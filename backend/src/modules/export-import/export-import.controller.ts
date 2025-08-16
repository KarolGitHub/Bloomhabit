import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { DataExportsService } from './data-exports.service';
import { DataImportsService } from './data-imports.service';
import { BackupsService } from './backups.service';
import {
  CreateDataExportDto,
  UpdateDataExportDto,
} from './dto/data-export.dto';
import {
  CreateDataImportDto,
  UpdateDataImportDto,
} from './dto/data-import.dto';
import { CreateBackupDto, UpdateBackupDto } from './dto/backup.dto';

@Controller('export-import')
@UseGuards(JwtAuthGuard)
export class ExportImportController {
  constructor(
    private readonly dataExportsService: DataExportsService,
    private readonly dataImportsService: DataImportsService,
    private readonly backupsService: BackupsService
  ) {}

  // ==================== DATA EXPORTS ====================

  @Post('exports')
  async createExport(
    @CurrentUser() user: any,
    @Body() createExportDto: CreateDataExportDto
  ) {
    return this.dataExportsService.createExport(user.id, createExportDto);
  }

  @Get('exports')
  async getUserExports(@CurrentUser() user: any) {
    return this.dataExportsService.getUserExports(user.id);
  }

  @Get('exports/:id')
  async getExport(@CurrentUser() user: any, @Param('id') id: string) {
    return this.dataExportsService.getExport(user.id, id);
  }

  @Put('exports/:id')
  async updateExport(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateExportDto: UpdateDataExportDto
  ) {
    return this.dataExportsService.updateExport(user.id, id, updateExportDto);
  }

  @Delete('exports/:id')
  async deleteExport(@CurrentUser() user: any, @Param('id') id: string) {
    await this.dataExportsService.deleteExport(user.id, id);
    return { message: 'Export deleted successfully' };
  }

  @Post('exports/:id/download')
  async downloadExport(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res() res: Response
  ) {
    const { filePath, fileName } = await this.dataExportsService.downloadExport(
      user.id,
      id
    );

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    return res.sendFile(filePath, { root: process.cwd() });
  }

  @Post('exports/:id/cancel')
  async cancelExport(@CurrentUser() user: any, @Param('id') id: string) {
    return this.dataExportsService.cancelExport(user.id, id);
  }

  @Post('exports/:id/retry')
  async retryExport(@CurrentUser() user: any, @Param('id') id: string) {
    return this.dataExportsService.retryExport(user.id, id);
  }

  // ==================== DATA IMPORTS ====================

  @Post('imports')
  async createImport(
    @CurrentUser() user: any,
    @Body() createImportDto: CreateDataImportDto
  ) {
    return this.dataImportsService.createImport(user.id, createImportDto);
  }

  @Get('imports')
  async getUserImports(@CurrentUser() user: any) {
    return this.dataImportsService.getUserImports(user.id);
  }

  @Get('imports/:id')
  async getImport(@CurrentUser() user: any, @Param('id') id: string) {
    return this.dataImportsService.getImport(user.id, id);
  }

  @Put('imports/:id')
  async updateImport(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateImportDto: UpdateDataImportDto
  ) {
    return this.dataImportsService.updateImport(user.id, id, updateImportDto);
  }

  @Delete('imports/:id')
  async deleteImport(@CurrentUser() user: any, @Param('id') id: string) {
    await this.dataImportsService.deleteImport(user.id, id);
    return { message: 'Import deleted successfully' };
  }

  @Post('imports/:id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.dataImportsService.uploadFile(user.id, id, file);
  }

  @Post('imports/:id/start')
  async startImport(@CurrentUser() user: any, @Param('id') id: string) {
    return this.dataImportsService.startImport(user.id, id);
  }

  @Post('imports/:id/cancel')
  async cancelImport(@CurrentUser() user: any, @Param('id') id: string) {
    return this.dataImportsService.cancelImport(user.id, id);
  }

  @Post('imports/:id/retry')
  async retryImport(@CurrentUser() user: any, @Param('id') id: string) {
    return this.dataImportsService.retryImport(user.id, id);
  }

  // ==================== BACKUPS ====================

  @Post('backups')
  async createBackup(
    @CurrentUser() user: any,
    @Body() createBackupDto: CreateBackupDto
  ) {
    return this.backupsService.createBackup(user.id, createBackupDto);
  }

  @Get('backups')
  async getUserBackups(@CurrentUser() user: any) {
    return this.backupsService.getUserBackups(user.id);
  }

  @Get('backups/scheduled')
  async getScheduledBackups(@CurrentUser() user: any) {
    return this.backupsService.getScheduledBackups(user.id);
  }

  @Get('backups/:id')
  async getBackup(@CurrentUser() user: any, @Param('id') id: string) {
    return this.backupsService.getBackup(user.id, id);
  }

  @Put('backups/:id')
  async updateBackup(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateBackupDto: UpdateBackupDto
  ) {
    return this.backupsService.updateBackup(user.id, id, updateBackupDto);
  }

  @Delete('backups/:id')
  async deleteBackup(@CurrentUser() user: any, @Param('id') id: string) {
    await this.backupsService.deleteBackup(user.id, id);
    return { message: 'Backup deleted successfully' };
  }

  @Post('backups/:id/download')
  async downloadBackup(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res() res: Response
  ) {
    const { filePath, fileName } = await this.backupsService.downloadBackup(
      user.id,
      id
    );

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/zip');

    return res.sendFile(filePath, { root: process.cwd() });
  }

  @Post('backups/:id/restore')
  async restoreBackup(@CurrentUser() user: any, @Param('id') id: string) {
    return this.backupsService.restoreBackup(user.id, id);
  }

  @Post('backups/:id/verify')
  async verifyBackup(@CurrentUser() user: any, @Param('id') id: string) {
    return this.backupsService.verifyBackup(user.id, id);
  }

  @Post('backups/:id/cancel')
  async cancelBackup(@CurrentUser() user: any, @Param('id') id: string) {
    return this.backupsService.cancelBackup(user.id, id);
  }

  @Post('backups/:id/retry')
  async retryBackup(@CurrentUser() user: any, @Param('id') id: string) {
    return this.backupsService.retryBackup(user.id, id);
  }

  // ==================== DASHBOARD & ANALYTICS ====================

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    const [exports, imports, backups] = await Promise.all([
      this.dataExportsService.getUserExports(user.id),
      this.dataImportsService.getUserImports(user.id),
      this.backupsService.getUserBackups(user.id),
    ]);

    const stats = {
      exports: {
        total: exports.length,
        completed: exports.filter((e) => e.status === 'COMPLETED').length,
        pending: exports.filter((e) => e.status === 'PENDING').length,
        processing: exports.filter((e) => e.status === 'PROCESSING').length,
        failed: exports.filter((e) => e.status === 'FAILED').length,
      },
      imports: {
        total: imports.length,
        completed: imports.filter((i) => i.status === 'COMPLETED').length,
        pending: imports.filter((i) => i.status === 'PENDING').length,
        validating: imports.filter((i) => i.status === 'VALIDATING').length,
        processing: imports.filter((i) => i.status === 'PROCESSING').length,
        failed: imports.filter((i) => i.status === 'FAILED').length,
      },
      backups: {
        total: backups.length,
        completed: backups.filter((b) => b.status === 'COMPLETED').length,
        pending: backups.filter((b) => b.status === 'PENDING').length,
        inProgress: backups.filter((b) => b.status === 'IN_PROGRESS').length,
        failed: backups.filter((b) => b.status === 'FAILED').length,
        verified: backups.filter((b) => b.isVerified).length,
      },
      recentActivity: [
        ...exports.slice(0, 5).map((e) => ({
          type: 'export',
          id: e.id,
          name: e.name,
          status: e.status,
          createdAt: e.createdAt,
        })),
        ...imports.slice(0, 5).map((i) => ({
          type: 'import',
          id: i.id,
          name: i.name,
          status: i.status,
          createdAt: i.createdAt,
        })),
        ...backups.slice(0, 5).map((b) => ({
          type: 'backup',
          id: b.id,
          name: b.name,
          status: b.status,
          createdAt: b.createdAt,
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10),
    };

    return stats;
  }

  @Get('exports/:id/progress')
  async getExportProgress(@CurrentUser() user: any, @Param('id') id: string) {
    const exportItem = await this.dataExportsService.getExport(user.id, id);
    return {
      id: exportItem.id,
      status: exportItem.status,
      progress: exportItem.progress,
      errorDetails: exportItem.errorDetails,
    };
  }

  @Get('imports/:id/progress')
  async getImportProgress(@CurrentUser() user: any, @Param('id') id: string) {
    const importItem = await this.dataImportsService.getImport(user.id, id);
    return {
      id: importItem.id,
      status: importItem.status,
      validationStatus: importItem.validationStatus,
      progress: importItem.progress,
      errorDetails: importItem.errorDetails,
    };
  }

  @Get('backups/:id/progress')
  async getBackupProgress(@CurrentUser() user: any, @Param('id') id: string) {
    const backup = await this.backupsService.getBackup(user.id, id);
    return {
      id: backup.id,
      status: backup.status,
      progress: backup.progress,
      errorDetails: backup.errorDetails,
    };
  }

  // ==================== BULK OPERATIONS ====================

  @Post('exports/bulk')
  async createBulkExports(
    @CurrentUser() user: any,
    @Body() createExportsDto: CreateDataExportDto[]
  ) {
    const results = await Promise.allSettled(
      createExportsDto.map((dto) =>
        this.dataExportsService.createExport(user.id, dto)
      )
    );

    return {
      total: createExportsDto.length,
      successful: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
      results: results.map((result, index) => ({
        index,
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null,
      })),
    };
  }

  @Delete('exports/bulk')
  async deleteBulkExports(
    @CurrentUser() user: any,
    @Body() exportIds: string[]
  ) {
    const results = await Promise.allSettled(
      exportIds.map((id) => this.dataExportsService.deleteExport(user.id, id))
    );

    return {
      total: exportIds.length,
      successful: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    };
  }

  @Post('backups/bulk')
  async createBulkBackups(
    @CurrentUser() user: any,
    @Body() createBackupsDto: CreateBackupDto[]
  ) {
    const results = await Promise.allSettled(
      createBackupsDto.map((dto) =>
        this.backupsService.createBackup(user.id, dto)
      )
    );

    return {
      total: createBackupsDto.length,
      successful: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
      results: results.map((result, index) => ({
        index,
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null,
      })),
    };
  }

  // ==================== SYSTEM OPERATIONS ====================

  @Post('system/cleanup')
  async cleanupExpiredItems(@CurrentUser() user: any) {
    // This would clean up expired exports, imports, and backups
    // Implementation would depend on your business logic
    return {
      message: 'Cleanup process started',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('system/health')
  async getSystemHealth() {
    // This would check the health of the export/import system
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        exports: 'operational',
        imports: 'operational',
        backups: 'operational',
      },
    };
  }
}
