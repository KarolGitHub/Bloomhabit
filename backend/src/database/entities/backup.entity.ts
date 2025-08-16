import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum BackupStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
}

export enum BackupType {
  AUTOMATED = 'AUTOMATED',
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  TRIGGERED = 'TRIGGERED',
  SYSTEM = 'SYSTEM',
}

export enum BackupFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  ON_DEMAND = 'ON_DEMAND',
}

export enum StorageProvider {
  LOCAL = 'LOCAL',
  AWS_S3 = 'AWS_S3',
  GOOGLE_CLOUD = 'GOOGLE_CLOUD',
  AZURE_BLOB = 'AZURE_BLOB',
  DROPBOX = 'DROPBOX',
  GOOGLE_DRIVE = 'GOOGLE_DRIVE',
  ONE_DRIVE = 'ONE_DRIVE',
}

@Entity('backups')
export class Backup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: BackupStatus,
    default: BackupStatus.PENDING,
  })
  status: BackupStatus;

  @Column({
    type: 'enum',
    enum: BackupType,
    default: BackupType.AUTOMATED,
  })
  backupType: BackupType;

  @Column({
    type: 'enum',
    enum: BackupFrequency,
    default: BackupFrequency.WEEKLY,
  })
  frequency: BackupFrequency;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  localFilePath: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  remoteFilePath: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  downloadUrl: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  checksum: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  compressionChecksum: string;

  @Column({ type: 'jsonb', nullable: true })
  backupConfig: {
    includeData: boolean;
    includeFiles: boolean;
    includeSettings: boolean;
    includeAnalytics: boolean;
    includeSocial: boolean;
    includeGarden: boolean;
    includeWearable: boolean;
    compressionLevel: number;
    encryptionEnabled: boolean;
    deduplication: boolean;
    incremental: boolean;
    retentionPolicy: {
      maxVersions: number;
      maxAge: number;
      maxSize: number;
      autoDelete: boolean;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  dataScope: {
    tables: string[];
    schemas: string[];
    dataTypes: string[];
    dateRange?: { start: string; end: string };
    includeArchived: boolean;
    includeDeleted: boolean;
    excludePatterns: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  storageConfig: {
    provider: StorageProvider;
    bucket?: string;
    region?: string;
    path?: string;
    credentials?: {
      accessKey?: string;
      secretKey?: string;
      token?: string;
    };
    encryption?: {
      algorithm: string;
      key?: string;
      iv?: string;
    };
    compression?: {
      algorithm: string;
      level: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  schedule: {
    enabled: boolean;
    cronExpression?: string;
    timezone: string;
    nextRun?: string;
    lastRun?: string;
    runCount: number;
    maxRetries: number;
    retryDelay: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  progress: {
    currentStep: string;
    totalSteps: number;
    currentStepNumber: number;
    percentage: number;
    estimatedTimeRemaining?: number;
    lastUpdate: string;
    bytesProcessed: number;
    bytesTotal: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    version: string;
    schema: any;
    dataTypes: string[];
    recordCounts: Record<string, number>;
    backupDate: string;
    applicationVersion: string;
    databaseVersion: string;
    dependencies: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  verification: {
    verified: boolean;
    verificationDate?: string;
    verificationMethod: string;
    checksumMatch: boolean;
    sizeMatch: boolean;
    integrityCheck: boolean;
    restoreTest: boolean;
    verificationNotes: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  dependencies: {
    parentBackupId?: string;
    childBackupIds: string[];
    relatedBackupIds: string[];
    restoreChain: string[];
    dependencyGraph: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  errorDetails: {
    error: string;
    stackTrace?: string;
    retryCount: number;
    lastRetry?: string;
    canRetry: boolean;
    maxRetries: number;
    retryDelay: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  accessLog: {
    downloads: number;
    lastDownloaded?: string;
    uploads: number;
    lastUploaded?: string;
    restores: number;
    lastRestored?: string;
    accessHistory: Array<{
      action: 'DOWNLOAD' | 'UPLOAD' | 'RESTORE' | 'VERIFY' | 'DELETE';
      timestamp: string;
      ipAddress?: string;
      userAgent?: string;
      location?: string;
    }>;
  };

  @Column({ type: 'jsonb', nullable: true })
  performance: {
    creationTime: number;
    uploadTime: number;
    downloadTime: number;
    compressionRatio: number;
    deduplicationRatio: number;
    storageEfficiency: number;
    networkSpeed: number;
  };

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastVerified: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessed: Date;

  @Column({ type: 'boolean', default: false })
  isCompressed: boolean;

  @Column({ type: 'boolean', default: false })
  isEncrypted: boolean;

  @Column({ type: 'boolean', default: false })
  isIncremental: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isAccessible: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  uploadedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;
}
