import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DataExport,
  ExportStatus,
  ExportFormat,
  ExportType,
} from '../../database/entities/data-export.entity';
import { User } from '../../database/entities/user.entity';
import {
  CreateDataExportDto,
  UpdateDataExportDto,
  DataExportDto,
} from './dto/data-export.dto';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class DataExportsService {
  constructor(
    @InjectRepository(DataExport)
    private dataExportRepository: Repository<DataExport>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createExport(
    userId: string,
    createExportDto: CreateDataExportDto
  ): Promise<DataExportDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const dataExport = this.dataExportRepository.create({
      ...createExportDto,
      userId,
      status: ExportStatus.PENDING,
      accessLog: {
        downloads: 0,
        downloadHistory: [],
      },
    });

    const savedExport = await this.dataExportRepository.save(dataExport);

    // Start the export process asynchronously
    this.processExport(savedExport.id);

    return this.mapToDto(savedExport);
  }

  async updateExport(
    userId: string,
    exportId: string,
    updateExportDto: UpdateDataExportDto
  ): Promise<DataExportDto> {
    const dataExport = await this.dataExportRepository.findOne({
      where: { id: exportId, userId },
    });

    if (!dataExport) {
      throw new NotFoundException('Export not found');
    }

    if (dataExport.status !== ExportStatus.PENDING) {
      throw new BadRequestException(
        'Cannot update export that is already processing or completed'
      );
    }

    Object.assign(dataExport, updateExportDto);
    const updatedExport = await this.dataExportRepository.save(dataExport);

    return this.mapToDto(updatedExport);
  }

  async getExport(userId: string, exportId: string): Promise<DataExportDto> {
    const dataExport = await this.dataExportRepository.findOne({
      where: { id: exportId, userId },
    });

    if (!dataExport) {
      throw new NotFoundException('Export not found');
    }

    return this.mapToDto(dataExport);
  }

  async getUserExports(userId: string): Promise<DataExportDto[]> {
    const exports = await this.dataExportRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return exports.map((exportItem) => this.mapToDto(exportItem));
  }

  async deleteExport(userId: string, exportId: string): Promise<void> {
    const dataExport = await this.dataExportRepository.findOne({
      where: { id: exportId, userId },
    });

    if (!dataExport) {
      throw new NotFoundException('Export not found');
    }

    // Delete the file if it exists
    if (dataExport.filePath && fs.existsSync(dataExport.filePath)) {
      fs.unlinkSync(dataExport.filePath);
    }

    await this.dataExportRepository.remove(dataExport);
  }

  async downloadExport(
    userId: string,
    exportId: string
  ): Promise<{ filePath: string; fileName: string }> {
    const dataExport = await this.dataExportRepository.findOne({
      where: { id: exportId, userId },
    });

    if (!dataExport) {
      throw new NotFoundException('Export not found');
    }

    if (dataExport.status !== ExportStatus.COMPLETED) {
      throw new BadRequestException('Export is not ready for download');
    }

    if (!dataExport.filePath || !fs.existsSync(dataExport.filePath)) {
      throw new NotFoundException('Export file not found');
    }

    // Update access log
    dataExport.accessLog.downloads += 1;
    dataExport.accessLog.lastDownloaded = new Date().toISOString();
    dataExport.downloadedAt = new Date();
    dataExport.accessLog.downloadHistory.push({
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1', // In real app, get from request
      userAgent: 'API Client', // In real app, get from request
      location: 'Unknown', // In real app, get from request
    });

    await this.dataExportRepository.save(dataExport);

    const fileName = `${dataExport.name}_${dataExport.format.toLowerCase()}_${new Date().toISOString().split('T')[0]}.${this.getFileExtension(dataExport.format)}`;

    return {
      filePath: dataExport.filePath,
      fileName,
    };
  }

  async cancelExport(userId: string, exportId: string): Promise<DataExportDto> {
    const dataExport = await this.dataExportRepository.findOne({
      where: { id: exportId, userId },
    });

    if (!dataExport) {
      throw new NotFoundException('Export not found');
    }

    if (
      dataExport.status !== ExportStatus.PENDING &&
      dataExport.status !== ExportStatus.PROCESSING
    ) {
      throw new BadRequestException(
        'Cannot cancel export that is not pending or processing'
      );
    }

    dataExport.status = ExportStatus.CANCELLED;
    const updatedExport = await this.dataExportRepository.save(dataExport);

    return this.mapToDto(updatedExport);
  }

  async retryExport(userId: string, exportId: string): Promise<DataExportDto> {
    const dataExport = await this.dataExportRepository.findOne({
      where: { id: exportId, userId },
    });

    if (!dataExport) {
      throw new NotFoundException('Export not found');
    }

    if (dataExport.status !== ExportStatus.FAILED) {
      throw new BadRequestException('Can only retry failed exports');
    }

    dataExport.status = ExportStatus.PENDING;
    dataExport.errorDetails = null;
    const updatedExport = await this.dataExportRepository.save(dataExport);

    // Start the export process again
    this.processExport(updatedExport.id);

    return this.mapToDto(updatedExport);
  }

  private async processExport(exportId: string): Promise<void> {
    try {
      const dataExport = await this.dataExportRepository.findOne({
        where: { id: exportId },
      });

      if (!dataExport) {
        return;
      }

      // Update status to processing
      dataExport.status = ExportStatus.PROCESSING;
      dataExport.startedAt = new Date();
      dataExport.progress = {
        currentStep: 'Initializing export',
        totalSteps: 5,
        currentStepNumber: 1,
        percentage: 20,
        lastUpdate: new Date().toISOString(),
      };
      await this.dataExportRepository.save(dataExport);

      // Step 1: Collect data
      await this.updateProgress(exportId, 'Collecting data', 2, 40);
      const exportData = await this.collectExportData(dataExport);

      // Step 2: Format data
      await this.updateProgress(exportId, 'Formatting data', 3, 60);
      const formattedData = await this.formatData(
        exportData,
        dataExport.format
      );

      // Step 3: Generate file
      await this.updateProgress(exportId, 'Generating file', 4, 80);
      const filePath = await this.generateFile(formattedData, dataExport);

      // Step 4: Finalize
      await this.updateProgress(exportId, 'Finalizing export', 5, 100);
      await this.finalizeExport(exportId, filePath, exportData);
    } catch (error) {
      await this.handleExportError(exportId, error);
    }
  }

  private async collectExportData(dataExport: DataExport): Promise<any> {
    // This is a simplified version - in a real app, you'd query the database
    // based on the export type and filters
    const mockData = {
      habits: [
        {
          id: '1',
          name: 'Morning Exercise',
          category: 'Health',
          createdAt: '2024-01-01',
        },
        {
          id: '2',
          name: 'Read 30 minutes',
          category: 'Learning',
          createdAt: '2024-01-01',
        },
      ],
      garden: [
        { id: '1', name: 'My Garden', plants: 5, createdAt: '2024-01-01' },
      ],
      analytics: [
        {
          id: '1',
          type: 'Habit Progress',
          data: { completed: 80, total: 100 },
        },
      ],
    };

    return mockData;
  }

  private async formatData(
    data: any,
    format: ExportFormat
  ): Promise<string | Buffer> {
    switch (format) {
      case ExportFormat.JSON:
        return JSON.stringify(data, null, 2);
      case ExportFormat.CSV:
        return this.convertToCSV(data);
      case ExportFormat.EXCEL:
        return this.convertToExcel(data);
      case ExportFormat.PDF:
        return this.convertToPDF(data);
      default:
        throw new BadRequestException(`Unsupported format: ${format}`);
    }
  }

  private convertToCSV(data: any): string {
    // Simplified CSV conversion
    let csv = '';
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        csv += `${key}\n`;
        if (value.length > 0) {
          const headers = Object.keys(value[0]);
          csv += headers.join(',') + '\n';
          for (const item of value) {
            csv += headers.map((header) => item[header]).join(',') + '\n';
          }
        }
        csv += '\n';
      }
    }
    return csv;
  }

  private convertToExcel(data: any): Buffer {
    // Simplified Excel conversion - in real app, use a library like exceljs
    const csv = this.convertToCSV(data);
    return Buffer.from(csv, 'utf8');
  }

  private convertToPDF(data: any): Buffer {
    // Simplified PDF conversion - in real app, use a library like puppeteer or jsPDF
    const text = JSON.stringify(data, null, 2);
    return Buffer.from(text, 'utf8');
  }

  private async generateFile(
    formattedData: string | Buffer,
    dataExport: DataExport
  ): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'exports');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${dataExport.id}_${Date.now()}.${this.getFileExtension(dataExport.format)}`;
    const filePath = path.join(uploadsDir, fileName);

    if (typeof formattedData === 'string') {
      fs.writeFileSync(filePath, formattedData, 'utf8');
    } else {
      fs.writeFileSync(filePath, formattedData);
    }

    return filePath;
  }

  private async finalizeExport(
    exportId: string,
    filePath: string,
    exportData: any
  ): Promise<void> {
    const dataExport = await this.dataExportRepository.findOne({
      where: { id: exportId },
    });

    if (!dataExport) {
      return;
    }

    const stats = fs.statSync(filePath);
    const checksum = this.calculateChecksum(filePath);

    dataExport.status = ExportStatus.COMPLETED;
    dataExport.filePath = filePath;
    dataExport.fileSize = stats.size;
    dataExport.checksum = checksum;
    dataExport.completedAt = new Date();
    dataExport.metadata = {
      totalRecords: this.countRecords(exportData),
      dataTypes: Object.keys(exportData),
      dateRange: {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      },
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      schema: this.generateSchema(exportData),
    };

    await this.dataExportRepository.save(dataExport);
  }

  private async handleExportError(exportId: string, error: any): Promise<void> {
    const dataExport = await this.dataExportRepository.findOne({
      where: { id: exportId },
    });

    if (!dataExport) {
      return;
    }

    dataExport.status = ExportStatus.FAILED;
    dataExport.errorDetails = {
      error: error.message || 'Unknown error occurred',
      stackTrace: error.stack,
      retryCount: (dataExport.errorDetails?.retryCount || 0) + 1,
      lastRetry: new Date().toISOString(),
      canRetry: true,
    };

    await this.dataExportRepository.save(dataExport);
  }

  private async updateProgress(
    exportId: string,
    step: string,
    stepNumber: number,
    percentage: number
  ): Promise<void> {
    const dataExport = await this.dataExportRepository.findOne({
      where: { id: exportId },
    });

    if (dataExport) {
      dataExport.progress = {
        currentStep: step,
        totalSteps: 5,
        currentStepNumber: stepNumber,
        percentage,
        lastUpdate: new Date().toISOString(),
      };
      await this.dataExportRepository.save(dataExport);
    }

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private getFileExtension(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.JSON:
        return 'json';
      case ExportFormat.CSV:
        return 'csv';
      case ExportFormat.EXCEL:
        return 'xlsx';
      case ExportFormat.PDF:
        return 'pdf';
      default:
        return 'txt';
    }
  }

  private calculateChecksum(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
  }

  private countRecords(data: any): number {
    let count = 0;
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        count += value.length;
      }
    }
    return count;
  }

  private generateSchema(data: any): any {
    // Simplified schema generation
    const schema: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) && value.length > 0) {
        schema[key] = {
          type: 'array',
          itemSchema: Object.keys(value[0]).reduce((acc, field) => {
            acc[field] = typeof value[0][field];
            return acc;
          }, {} as any),
        };
      }
    }
    return schema;
  }

  private mapToDto(dataExport: DataExport): DataExportDto {
    return {
      id: dataExport.id,
      userId: dataExport.userId,
      status: dataExport.status,
      format: dataExport.format,
      exportType: dataExport.exportType,
      name: dataExport.name,
      description: dataExport.description,
      filters: dataExport.filters,
      customFields: dataExport.customFields,
      filePath: dataExport.filePath,
      downloadUrl: dataExport.downloadUrl,
      fileSize: dataExport.fileSize,
      checksum: dataExport.checksum,
      progress: dataExport.progress,
      metadata: dataExport.metadata,
      errorDetails: dataExport.errorDetails,
      expiresAt: dataExport.expiresAt?.toISOString(),
      isCompressed: dataExport.isCompressed,
      isEncrypted: dataExport.isEncrypted,
      accessLog: dataExport.accessLog,
      createdAt: dataExport.createdAt.toISOString(),
      updatedAt: dataExport.updatedAt.toISOString(),
      completedAt: dataExport.completedAt?.toISOString(),
      downloadedAt: dataExport.downloadedAt?.toISOString(),
    };
  }
}
