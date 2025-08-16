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

export enum ExportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum ExportFormat {
  CSV = 'CSV',
  JSON = 'JSON',
  EXCEL = 'EXCEL',
  PDF = 'PDF',
}

export enum ExportType {
  FULL_DATA = 'FULL_DATA',
  HABITS_ONLY = 'HABITS_ONLY',
  GARDEN_ONLY = 'GARDEN_ONLY',
  ANALYTICS_ONLY = 'ANALYTICS_ONLY',
  SOCIAL_ONLY = 'SOCIAL_ONLY',
  CUSTOM = 'CUSTOM',
}

@Entity('data_exports')
export class DataExport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ExportStatus,
    default: ExportStatus.PENDING,
  })
  status: ExportStatus;

  @Column({
    type: 'enum',
    enum: ExportFormat,
    default: ExportFormat.JSON,
  })
  format: ExportFormat;

  @Column({
    type: 'enum',
    enum: ExportType,
    default: ExportType.FULL_DATA,
  })
  exportType: ExportType;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  filters: {
    dateRange?: { start: string; end: string };
    categories?: string[];
    tags?: string[];
    includeArchived?: boolean;
    includeDeleted?: boolean;
    dataTypes?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  customFields: {
    includeMetadata?: boolean;
    includeRelations?: boolean;
    includeHistory?: boolean;
    includeAnalytics?: boolean;
    includeFiles?: boolean;
    compressionLevel?: number;
    encryptionEnabled?: boolean;
  };

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  downloadUrl: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  checksum: string;

  @Column({ type: 'jsonb', nullable: true })
  progress: {
    currentStep: string;
    totalSteps: number;
    currentStepNumber: number;
    percentage: number;
    estimatedTimeRemaining?: number;
    lastUpdate: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    totalRecords: number;
    dataTypes: string[];
    dateRange: { start: string; end: string };
    version: string;
    exportDate: string;
    schema: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  errorDetails: {
    error: string;
    stackTrace?: string;
    retryCount: number;
    lastRetry?: string;
    canRetry: boolean;
  };

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isCompressed: boolean;

  @Column({ type: 'boolean', default: false })
  isEncrypted: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  encryptionKey: string;

  @Column({ type: 'jsonb', nullable: true })
  accessLog: {
    downloads: number;
    lastDownloaded?: string;
    downloadHistory: Array<{
      timestamp: string;
      ipAddress?: string;
      userAgent?: string;
      location?: string;
    }>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  downloadedAt: Date;
}
