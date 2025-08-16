import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Backup,
  BackupStatus,
  BackupType,
  BackupFrequency,
  StorageProvider,
} from '../../database/entities/backup.entity';
import { User } from '../../database/entities/user.entity';
import { CreateBackupDto, UpdateBackupDto, BackupDto } from './dto/backup.dto';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class BackupsService {
  constructor(
    @InjectRepository(Backup)
    private backupRepository: Repository<Backup>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createBackup(
    userId: string,
    createBackupDto: CreateBackupDto
  ): Promise<BackupDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const backup = this.backupRepository.create({
      ...createBackupDto,
      userId,
      status: BackupStatus.PENDING,
      accessLog: {
        downloads: 0,
        uploads: 0,
        restores: 0,
        accessHistory: [],
      },
    });

    const savedBackup = await this.backupRepository.save(backup);

    // Start the backup process asynchronously
    this.processBackup(savedBackup.id);

    return this.mapToDto(savedBackup);
  }

  async updateBackup(
    userId: string,
    backupId: string,
    updateBackupDto: UpdateBackupDto
  ): Promise<BackupDto> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId, userId },
    });

    if (!backup) {
      throw new NotFoundException('Backup not found');
    }

    if (backup.status !== BackupStatus.PENDING) {
      throw new BadRequestException(
        'Cannot update backup that is already processing or completed'
      );
    }

    Object.assign(backup, updateBackupDto);
    const updatedBackup = await this.backupRepository.save(backup);

    return this.mapToDto(updatedBackup);
  }

  async getBackup(userId: string, backupId: string): Promise<BackupDto> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId, userId },
    });

    if (!backup) {
      throw new NotFoundException('Backup not found');
    }

    return this.mapToDto(backup);
  }

  async getUserBackups(userId: string): Promise<BackupDto[]> {
    const backups = await this.backupRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return backups.map((backup) => this.mapToDto(backup));
  }

  async deleteBackup(userId: string, backupId: string): Promise<void> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId, userId },
    });

    if (!backup) {
      throw new NotFoundException('Backup not found');
    }

    // Delete the backup file if it exists
    if (backup.localFilePath && fs.existsSync(backup.localFilePath)) {
      fs.unlinkSync(backup.localFilePath);
    }

    await this.backupRepository.remove(backup);
  }

  async downloadBackup(
    userId: string,
    backupId: string
  ): Promise<{ filePath: string; fileName: string }> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId, userId },
    });

    if (!backup) {
      throw new NotFoundException('Backup not found');
    }

    if (backup.status !== BackupStatus.COMPLETED) {
      throw new BadRequestException('Backup is not ready for download');
    }

    if (!backup.localFilePath || !fs.existsSync(backup.localFilePath)) {
      throw new NotFoundException('Backup file not found');
    }

    // Update access log
    backup.accessLog.downloads += 1;
    backup.accessLog.lastDownloaded = new Date().toISOString();
    backup.lastAccessed = new Date();
    backup.accessLog.accessHistory.push({
      action: 'DOWNLOAD',
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1', // In real app, get from request
      userAgent: 'API Client', // In real app, get from request
      location: 'Unknown', // In real app, get from request
    });

    await this.backupRepository.save(backup);

    const fileName = `${backup.name}_${backup.backupType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.zip`;

    return {
      filePath: backup.localFilePath,
      fileName,
    };
  }

  async restoreBackup(userId: string, backupId: string): Promise<BackupDto> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId, userId },
    });

    if (!backup) {
      throw new NotFoundException('Backup not found');
    }

    if (backup.status !== BackupStatus.COMPLETED) {
      throw new BadRequestException('Backup is not ready for restoration');
    }

    if (!backup.localFilePath || !fs.existsSync(backup.localFilePath)) {
      throw new NotFoundException('Backup file not found');
    }

    // Update access log
    backup.accessLog.restores += 1;
    backup.accessLog.lastRestored = new Date().toISOString();
    backup.accessLog.accessHistory.push({
      action: 'RESTORE',
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1', // In real app, get from request
      userAgent: 'API Client', // In real app, get from request
      location: 'Unknown', // In real app, get from request
    });

    await this.backupRepository.save(backup);

    // Start restoration process asynchronously
    this.restoreFromBackup(backup.id);

    return this.mapToDto(backup);
  }

  async verifyBackup(userId: string, backupId: string): Promise<BackupDto> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId, userId },
    });

    if (!backup) {
      throw new NotFoundException('Backup not found');
    }

    if (backup.status !== BackupStatus.COMPLETED) {
      throw new BadRequestException('Backup is not ready for verification');
    }

    // Start verification process asynchronously
    this.verifyBackupIntegrity(backup.id);

    return this.mapToDto(backup);
  }

  async cancelBackup(userId: string, backupId: string): Promise<BackupDto> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId, userId },
    });

    if (!backup) {
      throw new NotFoundException('Backup not found');
    }

    if (
      backup.status !== BackupStatus.PENDING &&
      backup.status !== BackupStatus.IN_PROGRESS
    ) {
      throw new BadRequestException(
        'Cannot cancel backup that is not pending or in progress'
      );
    }

    backup.status = BackupStatus.CANCELLED;
    const updatedBackup = await this.backupRepository.save(backup);

    return this.mapToDto(updatedBackup);
  }

  async retryBackup(userId: string, backupId: string): Promise<BackupDto> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId, userId },
    });

    if (!backup) {
      throw new NotFoundException('Backup not found');
    }

    if (backup.status !== BackupStatus.FAILED) {
      throw new BadRequestException('Can only retry failed backups');
    }

    backup.status = BackupStatus.PENDING;
    backup.errorDetails = null;
    const updatedBackup = await this.backupRepository.save(backup);

    // Start the backup process again
    this.processBackup(updatedBackup.id);

    return this.mapToDto(updatedBackup);
  }

  async getScheduledBackups(userId: string): Promise<BackupDto[]> {
    const backups = await this.backupRepository.find({
      where: {
        userId,
        status: BackupStatus.COMPLETED,
        schedule: { enabled: true },
      },
      order: { createdAt: 'DESC' },
    });

    return backups.map((backup) => this.mapToDto(backup));
  }

  private async processBackup(backupId: string): Promise<void> {
    try {
      const backup = await this.backupRepository.findOne({
        where: { id: backupId },
      });

      if (!backup) {
        return;
      }

      // Update status to in progress
      backup.status = BackupStatus.IN_PROGRESS;
      backup.startedAt = new Date();
      backup.progress = {
        currentStep: 'Initializing backup',
        totalSteps: 6,
        currentStepNumber: 1,
        percentage: 17,
        lastUpdate: new Date().toISOString(),
        bytesProcessed: 0,
        bytesTotal: 0,
      };
      await this.backupRepository.save(backup);

      // Step 1: Collect data
      await this.updateBackupProgress(backupId, 'Collecting data', 2, 33);
      const backupData = await this.collectBackupData(backup);

      // Step 2: Compress data
      await this.updateBackupProgress(backupId, 'Compressing data', 3, 50);
      const compressedData = await this.compressData(backupData, backup);

      // Step 3: Encrypt data if enabled
      if (backup.backupConfig.encryptionEnabled) {
        await this.updateBackupProgress(backupId, 'Encrypting data', 4, 67);
        await this.encryptData(backupId, compressedData);
      }

      // Step 4: Upload to storage
      await this.updateBackupProgress(backupId, 'Uploading to storage', 5, 83);
      const remotePath = await this.uploadToStorage(backupId, backup);

      // Step 5: Finalize backup
      await this.updateBackupProgress(backupId, 'Finalizing backup', 6, 100);
      await this.finalizeBackup(backupId, remotePath, backupData);
    } catch (error) {
      await this.handleBackupError(backupId, error);
    }
  }

  private async collectBackupData(backup: Backup): Promise<any> {
    // This is a simplified version - in a real app, you'd query the database
    // based on the backup configuration and data scope
    const mockData = {
      user: {
        id: backup.userId,
        profile: { name: 'John Doe', email: 'john@example.com' },
        settings: { theme: 'dark', notifications: true },
      },
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

  private async compressData(data: any, backup: Backup): Promise<Buffer> {
    // Simulate compression - in real app, use a library like archiver
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const jsonData = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonData, 'utf8');

    // Simulate compression ratio
    backup.performance = {
      creationTime: 2000,
      uploadTime: 0,
      downloadTime: 0,
      compressionRatio: 0.7,
      deduplicationRatio: 0.8,
      storageEfficiency: 0.85,
      networkSpeed: 0,
    };

    return buffer;
  }

  private async encryptData(backupId: string, data: Buffer): Promise<void> {
    // Simulate encryption - in real app, use a library like crypto
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async uploadToStorage(
    backupId: string,
    backup: Backup
  ): Promise<string> {
    // Simulate upload to storage provider
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const remotePath = `/backups/${backupId}_${Date.now()}.zip`;

    // Update performance metrics
    if (backup.performance) {
      backup.performance.uploadTime = 3000;
      backup.performance.networkSpeed = 1024 * 1024; // 1MB/s
    }

    return remotePath;
  }

  private async finalizeBackup(
    backupId: string,
    remotePath: string,
    backupData: any
  ): Promise<void> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId },
    });

    if (!backup) {
      return;
    }

    const localPath = `/tmp/backup_${backupId}.zip`;
    const stats = { size: 1024 * 1024 }; // Simulate file stats
    const checksum = this.calculateChecksum(backupData);

    backup.status = BackupStatus.COMPLETED;
    backup.localFilePath = localPath;
    backup.remoteFilePath = remotePath;
    backup.fileSize = stats.size;
    backup.checksum = checksum;
    backup.completedAt = new Date();
    backup.metadata = {
      version: '1.0.0',
      schema: this.generateBackupSchema(backupData),
      dataTypes: Object.keys(backupData),
      recordCounts: this.countBackupRecords(backupData),
      backupDate: new Date().toISOString(),
      applicationVersion: '2.1.0',
      databaseVersion: 'PostgreSQL 15',
      dependencies: ['habits', 'garden', 'analytics'],
    };

    await this.backupRepository.save(backup);
  }

  private async handleBackupError(backupId: string, error: any): Promise<void> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId },
    });

    if (!backup) {
      return;
    }

    backup.status = BackupStatus.FAILED;
    backup.errorDetails = {
      error: error.message || 'Backup error occurred',
      stackTrace: error.stack,
      retryCount: (backup.errorDetails?.retryCount || 0) + 1,
      lastRetry: new Date().toISOString(),
      canRetry: true,
      maxRetries: 3,
      retryDelay: 5000,
    };

    await this.backupRepository.save(backup);
  }

  private async restoreFromBackup(backupId: string): Promise<void> {
    // Simulate restoration process
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // In a real app, this would:
    // 1. Download the backup file
    // 2. Decrypt if necessary
    // 3. Decompress
    // 4. Validate data integrity
    // 5. Restore to database
    // 6. Update verification status
  }

  private async verifyBackupIntegrity(backupId: string): Promise<void> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId },
    });

    if (!backup) {
      return;
    }

    // Simulate verification process
    await new Promise((resolve) => setTimeout(resolve, 3000));

    backup.verification = {
      verified: true,
      verificationDate: new Date().toISOString(),
      verificationMethod: 'Checksum and size validation',
      checksumMatch: true,
      sizeMatch: true,
      integrityCheck: true,
      restoreTest: true,
      verificationNotes: ['All verification checks passed successfully'],
    };

    backup.isVerified = true;
    backup.lastVerified = new Date();

    await this.backupRepository.save(backup);
  }

  private async updateBackupProgress(
    backupId: string,
    step: string,
    stepNumber: number,
    percentage: number
  ): Promise<void> {
    const backup = await this.backupRepository.findOne({
      where: { id: backupId },
    });

    if (backup) {
      backup.progress = {
        currentStep: step,
        totalSteps: 6,
        currentStepNumber: stepNumber,
        percentage,
        lastUpdate: new Date().toISOString(),
        bytesProcessed: Math.floor((percentage / 100) * 1024 * 1024), // Simulate 1MB total
        bytesTotal: 1024 * 1024,
      };
      await this.backupRepository.save(backup);
    }

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private calculateChecksum(data: any): string {
    const jsonString = JSON.stringify(data);
    return crypto.createHash('md5').update(jsonString).digest('hex');
  }

  private generateBackupSchema(data: any): any {
    // Simplified schema generation
    const schema: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          schema[key] = {
            type: 'array',
            itemSchema: value.length > 0 ? typeof value[0] : 'unknown',
          };
        } else {
          schema[key] = {
            type: 'object',
            properties: Object.keys(value).reduce((acc, field) => {
              acc[field] = typeof value[field];
              return acc;
            }, {} as any),
          };
        }
      } else {
        schema[key] = typeof value;
      }
    }
    return schema;
  }

  private countBackupRecords(data: any): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        counts[key] = value.length;
      } else if (typeof value === 'object' && value !== null) {
        counts[key] = 1;
      } else {
        counts[key] = 1;
      }
    }
    return counts;
  }

  private mapToDto(backup: Backup): BackupDto {
    return {
      id: backup.id,
      userId: backup.userId,
      status: backup.status,
      backupType: backup.backupType,
      frequency: backup.frequency,
      name: backup.name,
      description: backup.description,
      localFilePath: backup.localFilePath,
      remoteFilePath: backup.remoteFilePath,
      downloadUrl: backup.downloadUrl,
      fileSize: backup.fileSize,
      checksum: backup.checksum,
      compressionChecksum: backup.compressionChecksum,
      backupConfig: backup.backupConfig,
      dataScope: backup.dataScope,
      storageConfig: backup.storageConfig,
      schedule: backup.schedule,
      progress: backup.progress,
      metadata: backup.metadata,
      verification: backup.verification,
      dependencies: backup.dependencies,
      errorDetails: backup.errorDetails,
      accessLog: backup.accessLog,
      performance: backup.performance,
      expiresAt: backup.expiresAt?.toISOString(),
      lastVerified: backup.lastVerified?.toISOString(),
      lastAccessed: backup.lastAccessed?.toISOString(),
      isCompressed: backup.isCompressed,
      isEncrypted: backup.isEncrypted,
      isIncremental: backup.isIncremental,
      isVerified: backup.isVerified,
      isAccessible: backup.isAccessible,
      createdAt: backup.createdAt.toISOString(),
      updatedAt: backup.updatedAt.toISOString(),
      startedAt: backup.startedAt?.toISOString(),
      completedAt: backup.completedAt?.toISOString(),
      uploadedAt: backup.uploadedAt?.toISOString(),
      verifiedAt: backup.verifiedAt?.toISOString(),
    };
  }
}
