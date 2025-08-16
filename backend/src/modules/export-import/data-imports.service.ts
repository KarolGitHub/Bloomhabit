import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DataImport,
  ImportStatus,
  ImportFormat,
  ImportType,
  ValidationStatus,
} from '../../database/entities/data-import.entity';
import { User } from '../../database/entities/user.entity';
import {
  CreateDataImportDto,
  UpdateDataImportDto,
  DataImportDto,
} from './dto/data-import.dto';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class DataImportsService {
  constructor(
    @InjectRepository(DataImport)
    private dataImportRepository: Repository<DataImport>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createImport(
    userId: string,
    createImportDto: CreateDataImportDto
  ): Promise<DataImportDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const dataImport = this.dataImportRepository.create({
      ...createImportDto,
      userId,
      status: ImportStatus.PENDING,
      validationStatus: ValidationStatus.PENDING,
      accessLog: {
        uploads: 0,
        uploadHistory: [],
      },
    });

    const savedImport = await this.dataImportRepository.save(dataImport);

    return this.mapToDto(savedImport);
  }

  async updateImport(
    userId: string,
    importId: string,
    updateImportDto: UpdateDataImportDto
  ): Promise<DataImportDto> {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id: importId, userId },
    });

    if (!dataImport) {
      throw new NotFoundException('Import not found');
    }

    if (dataImport.status !== ImportStatus.PENDING) {
      throw new BadRequestException(
        'Cannot update import that is already processing or completed'
      );
    }

    Object.assign(dataImport, updateImportDto);
    const updatedImport = await this.dataImportRepository.save(dataImport);

    return this.mapToDto(updatedImport);
  }

  async getImport(userId: string, importId: string): Promise<DataImportDto> {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id: importId, userId },
    });

    if (!dataImport) {
      throw new NotFoundException('Import not found');
    }

    return this.mapToDto(dataImport);
  }

  async getUserImports(userId: string): Promise<DataImportDto[]> {
    const imports = await this.dataImportRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return imports.map((importItem) => this.mapToDto(importItem));
  }

  async deleteImport(userId: string, importId: string): Promise<void> {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id: importId, userId },
    });

    if (!dataImport) {
      throw new NotFoundException('Import not found');
    }

    // Delete the uploaded file if it exists
    if (
      dataImport.uploadedFilePath &&
      fs.existsSync(dataImport.uploadedFilePath)
    ) {
      fs.unlinkSync(dataImport.uploadedFilePath);
    }

    await this.dataImportRepository.remove(dataImport);
  }

  async uploadFile(
    userId: string,
    importId: string,
    file: Express.Multer.File
  ): Promise<DataImportDto> {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id: importId, userId },
    });

    if (!dataImport) {
      throw new NotFoundException('Import not found');
    }

    if (dataImport.status !== ImportStatus.PENDING) {
      throw new BadRequestException(
        'Cannot upload file for import that is already processing or completed'
      );
    }

    // Save the uploaded file
    const uploadsDir = path.join(process.cwd(), 'uploads', 'imports');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${importId}_${Date.now()}_${file.originalname}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    // Update import with file information
    dataImport.uploadedFilePath = filePath;
    dataImport.sourceFilePath = file.originalname;
    dataImport.fileSize = file.size;
    dataImport.checksum = this.calculateChecksum(file.buffer);
    dataImport.uploadedAt = new Date();
    dataImport.accessLog.uploads += 1;
    dataImport.accessLog.lastUploaded = new Date().toISOString();
    dataImport.accessLog.uploadHistory.push({
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1', // In real app, get from request
      userAgent: 'API Client', // In real app, get from request
      location: 'Unknown', // In real app, get from request
    });

    const updatedImport = await this.dataImportRepository.save(dataImport);

    // Start validation process
    this.validateImport(updatedImport.id);

    return this.mapToDto(updatedImport);
  }

  async startImport(userId: string, importId: string): Promise<DataImportDto> {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id: importId, userId },
    });

    if (!dataImport) {
      throw new NotFoundException('Import not found');
    }

    if (dataImport.status !== ImportStatus.VALIDATED) {
      throw new BadRequestException('Import must be validated before starting');
    }

    if (
      !dataImport.uploadedFilePath ||
      !fs.existsSync(dataImport.uploadedFilePath)
    ) {
      throw new BadRequestException('Import file not found');
    }

    dataImport.status = ImportStatus.PROCESSING;
    dataImport.startedAt = new Date();
    const updatedImport = await this.dataImportRepository.save(dataImport);

    // Start the import process asynchronously
    this.processImport(updatedImport.id);

    return this.mapToDto(updatedImport);
  }

  async cancelImport(userId: string, importId: string): Promise<DataImportDto> {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id: importId, userId },
    });

    if (!dataImport) {
      throw new NotFoundException('Import not found');
    }

    if (
      dataImport.status !== ImportStatus.PENDING &&
      dataImport.status !== ImportStatus.VALIDATING &&
      dataImport.status !== ImportStatus.PROCESSING
    ) {
      throw new BadRequestException(
        'Cannot cancel import that is not pending, validating, or processing'
      );
    }

    dataImport.status = ImportStatus.CANCELLED;
    const updatedImport = await this.dataImportRepository.save(dataImport);

    return this.mapToDto(updatedImport);
  }

  async retryImport(userId: string, importId: string): Promise<DataImportDto> {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id: importId, userId },
    });

    if (!dataImport) {
      throw new NotFoundException('Import not found');
    }

    if (dataImport.status !== ImportStatus.FAILED) {
      throw new BadRequestException('Can only retry failed imports');
    }

    dataImport.status = ImportStatus.PENDING;
    dataImport.errorDetails = null;
    const updatedImport = await this.dataImportRepository.save(dataImport);

    // Start validation process again
    this.validateImport(updatedImport.id);

    return this.mapToDto(updatedImport);
  }

  private async validateImport(importId: string): Promise<void> {
    try {
      const dataImport = await this.dataImportRepository.findOne({
        where: { id: importId },
      });

      if (!dataImport) {
        return;
      }

      // Update status to validating
      dataImport.status = ImportStatus.VALIDATING;
      dataImport.validationStatus = ValidationStatus.PENDING;
      await this.dataImportRepository.save(dataImport);

      // Step 1: Validate file format and structure
      const fileValidation = await this.validateFileFormat(dataImport);

      // Step 2: Validate schema
      const schemaValidation = await this.validateSchema(dataImport);

      // Step 3: Validate data integrity
      const dataValidation = await this.validateDataIntegrity(dataImport);

      // Step 4: Finalize validation
      await this.finalizeValidation(
        importId,
        fileValidation,
        schemaValidation,
        dataValidation
      );
    } catch (error) {
      await this.handleValidationError(importId, error);
    }
  }

  private async validateFileFormat(dataImport: DataImport): Promise<any> {
    // Simulate file format validation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      passed: true,
      fileType: dataImport.format,
      encoding: 'UTF-8',
      lineCount: 100,
      size: dataImport.fileSize,
    };
  }

  private async validateSchema(dataImport: DataImport): Promise<any> {
    // Simulate schema validation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      passed: true,
      missingFields: [],
      extraFields: [],
      typeMismatches: [],
    };
  }

  private async validateDataIntegrity(dataImport: DataImport): Promise<any> {
    // Simulate data integrity validation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      passed: true,
      constraintViolations: [],
      duplicateChecks: [],
    };
  }

  private async finalizeValidation(
    importId: string,
    fileValidation: any,
    schemaValidation: any,
    dataValidation: any
  ): Promise<void> {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id: importId },
    });

    if (!dataImport) {
      return;
    }

    const allPassed =
      fileValidation.passed && schemaValidation.passed && dataValidation.passed;

    dataImport.validationStatus = allPassed
      ? ValidationStatus.PASSED
      : ValidationStatus.FAILED;
    dataImport.status = allPassed
      ? ImportStatus.VALIDATED
      : ImportStatus.FAILED;
    dataImport.validatedAt = new Date();
    dataImport.validationResults = {
      totalRecords: 100,
      validRecords: allPassed ? 100 : 0,
      invalidRecords: allPassed ? 0 : 100,
      warnings: 0,
      errors: [],
      schemaValidation,
      dataValidation,
    };

    if (!allPassed) {
      dataImport.errorDetails = {
        error: 'Validation failed',
        stackTrace: null,
        retryCount: 0,
        canRetry: true,
        rollbackAttempted: false,
        rollbackSuccessful: false,
      };
    }

    await this.dataImportRepository.save(dataImport);
  }

  private async handleValidationError(
    importId: string,
    error: any
  ): Promise<void> {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id: importId },
    });

    if (!dataImport) {
      return;
    }

    dataImport.validationStatus = ValidationStatus.FAILED;
    dataImport.status = ImportStatus.FAILED;
    dataImport.errorDetails = {
      error: error.message || 'Validation error occurred',
      stackTrace: error.stack,
      retryCount: (dataImport.errorDetails?.retryCount || 0) + 1,
      canRetry: true,
      rollbackAttempted: false,
      rollbackSuccessful: false,
    };

    await this.dataImportRepository.save(dataImport);
  }

  private async processImport(importId: string): Promise<void> {
    try {
      const dataImport = await this.dataImportRepository.findOne({
        where: { id: importId },
      });

      if (!dataImport) {
        return;
      }

      // Update progress
      dataImport.progress = {
        currentStep: 'Starting import',
        totalSteps: 4,
        currentStepNumber: 1,
        percentage: 25,
        lastUpdate: new Date().toISOString(),
        recordsProcessed: 0,
        recordsTotal: 100,
      };
      await this.dataImportRepository.save(dataImport);

      // Step 1: Create backup if requested
      if (dataImport.importOptions.backupBeforeImport) {
        await this.updateImportProgress(importId, 'Creating backup', 2, 50);
        await this.createBackup(dataImport);
      }

      // Step 2: Process data
      await this.updateImportProgress(importId, 'Processing data', 3, 75);
      const results = await this.processData(dataImport);

      // Step 3: Finalize import
      await this.updateImportProgress(importId, 'Finalizing import', 4, 100);
      await this.finalizeImport(importId, results);
    } catch (error) {
      await this.handleImportError(importId, error);
    }
  }

  private async createBackup(dataImport: DataImport): Promise<void> {
    // Simulate backup creation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    dataImport.backupInfo = {
      backupId: uuidv4(),
      backupDate: new Date().toISOString(),
      backupSize: 1024 * 1024, // 1MB
      backupChecksum: 'mock-checksum',
      backupLocation: '/backups/mock-backup.zip',
      restorePoint: 'before-import-' + dataImport.id,
    };
  }

  private async processData(dataImport: DataImport): Promise<any> {
    // Simulate data processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    return {
      totalRecords: 100,
      importedRecords: 95,
      skippedRecords: 3,
      failedRecords: 2,
      updatedRecords: 10,
      createdRecords: 85,
      deletedRecords: 0,
      dataTypes: ['habits', 'garden', 'analytics'],
      importDate: new Date().toISOString(),
      version: '1.0.0',
      conflicts: [
        {
          type: 'DUPLICATE',
          description: 'Duplicate habit names found',
          resolution: 'Skipped duplicates',
          affectedRecords: 3,
        },
      ],
    };
  }

  private async finalizeImport(importId: string, results: any): Promise<void> {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id: importId },
    });

    if (!dataImport) {
      return;
    }

    dataImport.status = ImportStatus.COMPLETED;
    dataImport.completedAt = new Date();
    dataImport.results = results;

    await this.dataImportRepository.save(dataImport);
  }

  private async handleImportError(importId: string, error: any): Promise<void> {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id: importId },
    });

    if (!dataImport) {
      return;
    }

    dataImport.status = ImportStatus.FAILED;
    dataImport.errorDetails = {
      error: error.message || 'Import error occurred',
      stackTrace: error.stack,
      retryCount: (dataImport.errorDetails?.retryCount || 0) + 1,
      canRetry: true,
      rollbackAttempted: false,
      rollbackSuccessful: false,
    };

    // Attempt rollback if enabled
    if (dataImport.importOptions.rollbackOnError && dataImport.backupInfo) {
      dataImport.errorDetails.rollbackAttempted = true;
      try {
        await this.rollbackImport(dataImport);
        dataImport.errorDetails.rollbackSuccessful = true;
      } catch (rollbackError) {
        dataImport.errorDetails.rollbackSuccessful = false;
      }
    }

    await this.dataImportRepository.save(dataImport);
  }

  private async rollbackImport(dataImport: DataImport): Promise<void> {
    // Simulate rollback process
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  private async updateImportProgress(
    importId: string,
    step: string,
    stepNumber: number,
    percentage: number
  ): Promise<void> {
    const dataImport = await this.dataImportRepository.findOne({
      where: { id: importId },
    });

    if (dataImport) {
      dataImport.progress = {
        currentStep: step,
        totalSteps: 4,
        currentStepNumber: stepNumber,
        percentage,
        lastUpdate: new Date().toISOString(),
        recordsProcessed: Math.floor((percentage / 100) * 100),
        recordsTotal: 100,
      };
      await this.dataImportRepository.save(dataImport);
    }

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  private mapToDto(dataImport: DataImport): DataImportDto {
    return {
      id: dataImport.id,
      userId: dataImport.userId,
      status: dataImport.status,
      format: dataImport.format,
      importType: dataImport.importType,
      name: dataImport.name,
      description: dataImport.description,
      sourceFilePath: dataImport.sourceFilePath,
      uploadedFilePath: dataImport.uploadedFilePath,
      fileSize: dataImport.fileSize,
      checksum: dataImport.checksum,
      originalChecksum: dataImport.originalChecksum,
      importOptions: dataImport.importOptions,
      filters: dataImport.filters,
      validationStatus: dataImport.validationStatus,
      validationResults: dataImport.validationResults,
      progress: dataImport.progress,
      results: dataImport.results,
      backupInfo: dataImport.backupInfo,
      errorDetails: dataImport.errorDetails,
      metadata: dataImport.metadata,
      accessLog: dataImport.accessLog,
      createdAt: dataImport.createdAt.toISOString(),
      updatedAt: dataImport.updatedAt.toISOString(),
      startedAt: dataImport.startedAt?.toISOString(),
      completedAt: dataImport.completedAt?.toISOString(),
      validatedAt: dataImport.validatedAt?.toISOString(),
      uploadedAt: dataImport.uploadedAt?.toISOString(),
    };
  }
}
