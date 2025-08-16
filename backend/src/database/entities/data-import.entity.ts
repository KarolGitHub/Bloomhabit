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

export enum ImportStatus {
  PENDING = 'PENDING',
  VALIDATING = 'VALIDATING',
  VALIDATED = 'VALIDATED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  ROLLED_BACK = 'ROLLED_BACK',
}

export enum ImportFormat {
  CSV = 'CSV',
  JSON = 'JSON',
  EXCEL = 'EXCEL',
  BACKUP = 'BACKUP',
}

export enum ImportType {
  FULL_RESTORE = 'FULL_RESTORE',
  PARTIAL_RESTORE = 'PARTIAL_RESTORE',
  MERGE_DATA = 'MERGE_DATA',
  UPDATE_EXISTING = 'UPDATE_EXISTING',
  BULK_IMPORT = 'BULK_IMPORT',
}

export enum ValidationStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  WARNINGS = 'WARNINGS',
}

@Entity('data_imports')
export class DataImport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ImportStatus,
    default: ImportStatus.PENDING,
  })
  status: ImportStatus;

  @Column({
    type: 'enum',
    enum: ImportFormat,
    default: ImportFormat.JSON,
  })
  format: ImportFormat;

  @Column({
    type: 'enum',
    enum: ImportType,
    default: ImportType.MERGE_DATA,
  })
  importType: ImportType;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  sourceFilePath: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  uploadedFilePath: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  checksum: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  originalChecksum: string;

  @Column({ type: 'jsonb', nullable: true })
  importOptions: {
    conflictResolution: 'SKIP' | 'OVERWRITE' | 'MERGE' | 'RENAME';
    createMissing: boolean;
    updateExisting: boolean;
    validateData: boolean;
    backupBeforeImport: boolean;
    rollbackOnError: boolean;
    maxErrors: number;
    dryRun: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  filters: {
    dateRange?: { start: string; end: string };
    categories?: string[];
    tags?: string[];
    dataTypes?: string[];
    excludeTypes?: string[];
    includeArchived?: boolean;
    includeDeleted?: boolean;
  };

  @Column({
    type: 'enum',
    enum: ValidationStatus,
    default: ValidationStatus.PENDING,
  })
  validationStatus: ValidationStatus;

  @Column({ type: 'jsonb', nullable: true })
  validationResults: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    warnings: number;
    errors: Array<{
      row: number;
      field: string;
      value: any;
      error: string;
      severity: 'ERROR' | 'WARNING' | 'INFO';
    }>;
    schemaValidation: {
      passed: boolean;
      missingFields: string[];
      extraFields: string[];
      typeMismatches: Array<{
        field: string;
        expectedType: string;
        actualType: string;
      }>;
    };
    dataValidation: {
      passed: boolean;
      constraintViolations: Array<{
        field: string;
        constraint: string;
        value: any;
        message: string;
      }>;
      duplicateChecks: Array<{
        field: string;
        duplicates: number;
        examples: any[];
      }>;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  progress: {
    currentStep: string;
    totalSteps: number;
    currentStepNumber: number;
    percentage: number;
    estimatedTimeRemaining?: number;
    lastUpdate: string;
    recordsProcessed: number;
    recordsTotal: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  results: {
    totalRecords: number;
    importedRecords: number;
    skippedRecords: number;
    failedRecords: number;
    updatedRecords: number;
    createdRecords: number;
    deletedRecords: number;
    dataTypes: string[];
    importDate: string;
    version: string;
    conflicts: Array<{
      type: 'DUPLICATE' | 'CONSTRAINT_VIOLATION' | 'SCHEMA_MISMATCH';
      description: string;
      resolution: string;
      affectedRecords: number;
    }>;
  };

  @Column({ type: 'jsonb', nullable: true })
  backupInfo: {
    backupId: string;
    backupDate: string;
    backupSize: number;
    backupChecksum: string;
    backupLocation: string;
    restorePoint: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  errorDetails: {
    error: string;
    stackTrace?: string;
    retryCount: number;
    lastRetry?: string;
    canRetry: boolean;
    rollbackAttempted: boolean;
    rollbackSuccessful: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source: string;
    sourceVersion?: string;
    importDate: string;
    schema: any;
    dataQuality: {
      completeness: number;
      accuracy: number;
      consistency: number;
      timeliness: number;
    };
    tags: string[];
    notes: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  accessLog: {
    uploads: number;
    lastUploaded?: string;
    uploadHistory: Array<{
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
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  validatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  uploadedAt: Date;
}
