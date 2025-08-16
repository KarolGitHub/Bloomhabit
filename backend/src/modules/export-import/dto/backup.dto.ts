import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
  IsObject,
  IsDateString,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BackupRetentionPolicyDto {
  @IsNumber()
  maxVersions: number;

  @IsNumber()
  maxAge: number;

  @IsNumber()
  maxSize: number;

  @IsBoolean()
  autoDelete: boolean;
}

export class BackupConfigDto {
  @IsBoolean()
  includeData: boolean;

  @IsBoolean()
  includeFiles: boolean;

  @IsBoolean()
  includeSettings: boolean;

  @IsBoolean()
  includeAnalytics: boolean;

  @IsBoolean()
  includeSocial: boolean;

  @IsBoolean()
  includeGarden: boolean;

  @IsBoolean()
  includeWearable: boolean;

  @IsNumber()
  compressionLevel: number;

  @IsBoolean()
  encryptionEnabled: boolean;

  @IsBoolean()
  deduplication: boolean;

  @IsBoolean()
  incremental: boolean;

  @ValidateNested()
  @Type(() => BackupRetentionPolicyDto)
  retentionPolicy: BackupRetentionPolicyDto;
}

export class BackupDataScopeDto {
  @IsArray()
  @IsString({ each: true })
  tables: string[];

  @IsArray()
  @IsString({ each: true })
  schemas: string[];

  @IsArray()
  @IsString({ each: true })
  dataTypes: string[];

  @IsOptional()
  @IsObject()
  dateRange?: {
    start: string;
    end: string;
  };

  @IsBoolean()
  includeArchived: boolean;

  @IsBoolean()
  includeDeleted: boolean;

  @IsArray()
  @IsString({ each: true })
  excludePatterns: string[];
}

export class BackupCredentialsDto {
  @IsOptional()
  @IsString()
  accessKey?: string;

  @IsOptional()
  @IsString()
  secretKey?: string;

  @IsOptional()
  @IsString()
  token?: string;
}

export class BackupEncryptionDto {
  @IsString()
  algorithm: string;

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  iv?: string;
}

export class BackupCompressionDto {
  @IsString()
  algorithm: string;

  @IsNumber()
  level: number;
}

export class BackupStorageConfigDto {
  @IsEnum([
    'LOCAL',
    'AWS_S3',
    'GOOGLE_CLOUD',
    'AZURE_BLOB',
    'DROPBOX',
    'GOOGLE_DRIVE',
    'ONE_DRIVE',
  ])
  provider:
    | 'LOCAL'
    | 'AWS_S3'
    | 'GOOGLE_CLOUD'
    | 'AZURE_BLOB'
    | 'DROPBOX'
    | 'GOOGLE_DRIVE'
    | 'ONE_DRIVE';

  @IsOptional()
  @IsString()
  bucket?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupCredentialsDto)
  credentials?: BackupCredentialsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupEncryptionDto)
  encryption?: BackupEncryptionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupCompressionDto)
  compression?: BackupCompressionDto;
}

export class BackupScheduleDto {
  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsString()
  cronExpression?: string;

  @IsString()
  timezone: string;

  @IsOptional()
  @IsString()
  nextRun?: string;

  @IsOptional()
  @IsString()
  lastRun?: string;

  @IsNumber()
  runCount: number;

  @IsNumber()
  maxRetries: number;

  @IsNumber()
  retryDelay: number;
}

export class BackupProgressDto {
  @IsString()
  currentStep: string;

  @IsNumber()
  totalSteps: number;

  @IsNumber()
  currentStepNumber: number;

  @IsNumber()
  percentage: number;

  @IsOptional()
  @IsNumber()
  estimatedTimeRemaining?: number;

  @IsString()
  lastUpdate: string;

  @IsNumber()
  bytesProcessed: number;

  @IsNumber()
  bytesTotal: number;
}

export class BackupMetadataDto {
  @IsString()
  version: string;

  @IsObject()
  schema: any;

  @IsArray()
  @IsString({ each: true })
  dataTypes: string[];

  @IsObject()
  recordCounts: Record<string, number>;

  @IsString()
  backupDate: string;

  @IsString()
  applicationVersion: string;

  @IsString()
  databaseVersion: string;

  @IsArray()
  @IsString({ each: true })
  dependencies: string[];
}

export class BackupVerificationDto {
  @IsBoolean()
  verified: boolean;

  @IsOptional()
  @IsString()
  verificationDate?: string;

  @IsString()
  verificationMethod: string;

  @IsBoolean()
  checksumMatch: boolean;

  @IsBoolean()
  sizeMatch: boolean;

  @IsBoolean()
  integrityCheck: boolean;

  @IsBoolean()
  restoreTest: boolean;

  @IsArray()
  @IsString({ each: true })
  verificationNotes: string[];
}

export class BackupDependenciesDto {
  @IsOptional()
  @IsString()
  parentBackupId?: string;

  @IsArray()
  @IsString({ each: true })
  childBackupIds: string[];

  @IsArray()
  @IsString({ each: true })
  relatedBackupIds: string[];

  @IsArray()
  @IsString({ each: true })
  restoreChain: string[];

  @IsObject()
  dependencyGraph: any;
}

export class BackupErrorDetailsDto {
  @IsString()
  error: string;

  @IsOptional()
  @IsString()
  stackTrace?: string;

  @IsNumber()
  retryCount: number;

  @IsOptional()
  @IsString()
  lastRetry?: string;

  @IsBoolean()
  canRetry: boolean;

  @IsNumber()
  maxRetries: number;

  @IsNumber()
  retryDelay: number;
}

export class BackupAccessHistoryDto {
  @IsString()
  action: 'DOWNLOAD' | 'UPLOAD' | 'RESTORE' | 'VERIFY' | 'DELETE';

  @IsString()
  timestamp: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class BackupAccessLogDto {
  @IsNumber()
  downloads: number;

  @IsOptional()
  @IsString()
  lastDownloaded?: string;

  @IsNumber()
  uploads: number;

  @IsOptional()
  @IsString()
  lastUploaded?: string;

  @IsNumber()
  restores: number;

  @IsOptional()
  @IsString()
  lastRestored?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BackupAccessHistoryDto)
  accessHistory: BackupAccessHistoryDto[];
}

export class BackupPerformanceDto {
  @IsNumber()
  creationTime: number;

  @IsNumber()
  uploadTime: number;

  @IsNumber()
  downloadTime: number;

  @IsNumber()
  compressionRatio: number;

  @IsNumber()
  deduplicationRatio: number;

  @IsNumber()
  storageEfficiency: number;

  @IsNumber()
  networkSpeed: number;
}

export class CreateBackupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['AUTOMATED', 'MANUAL', 'SCHEDULED', 'TRIGGERED', 'SYSTEM'])
  backupType: 'AUTOMATED' | 'MANUAL' | 'SCHEDULED' | 'TRIGGERED' | 'SYSTEM';

  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ON_DEMAND'])
  frequency:
    | 'DAILY'
    | 'WEEKLY'
    | 'MONTHLY'
    | 'QUARTERLY'
    | 'YEARLY'
    | 'ON_DEMAND';

  @ValidateNested()
  @Type(() => BackupConfigDto)
  backupConfig: BackupConfigDto;

  @ValidateNested()
  @Type(() => BackupDataScopeDto)
  dataScope: BackupDataScopeDto;

  @ValidateNested()
  @Type(() => BackupStorageConfigDto)
  storageConfig: BackupStorageConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupScheduleDto)
  schedule?: BackupScheduleDto;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateBackupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupConfigDto)
  backupConfig?: BackupConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupDataScopeDto)
  dataScope?: BackupDataScopeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupStorageConfigDto)
  storageConfig?: BackupStorageConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupScheduleDto)
  schedule?: BackupScheduleDto;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class BackupDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsString()
  status: string;

  @IsString()
  backupType: string;

  @IsString()
  frequency: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  localFilePath?: string;

  @IsOptional()
  @IsString()
  remoteFilePath?: string;

  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  checksum?: string;

  @IsOptional()
  @IsString()
  compressionChecksum?: string;

  @ValidateNested()
  @Type(() => BackupConfigDto)
  backupConfig: BackupConfigDto;

  @ValidateNested()
  @Type(() => BackupDataScopeDto)
  dataScope: BackupDataScopeDto;

  @ValidateNested()
  @Type(() => BackupStorageConfigDto)
  storageConfig: BackupStorageConfigDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupScheduleDto)
  schedule?: BackupScheduleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupProgressDto)
  progress?: BackupProgressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupMetadataDto)
  metadata?: BackupMetadataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupVerificationDto)
  verification?: BackupVerificationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupDependenciesDto)
  dependencies?: BackupDependenciesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupErrorDetailsDto)
  errorDetails?: BackupErrorDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupAccessLogDto)
  accessLog?: BackupAccessLogDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BackupPerformanceDto)
  performance?: BackupPerformanceDto;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsDateString()
  lastVerified?: string;

  @IsOptional()
  @IsDateString()
  lastAccessed?: string;

  @IsBoolean()
  isCompressed: boolean;

  @IsBoolean()
  isEncrypted: boolean;

  @IsBoolean()
  isIncremental: boolean;

  @IsBoolean()
  isVerified: boolean;

  @IsBoolean()
  isAccessible: boolean;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsDateString()
  uploadedAt?: string;

  @IsOptional()
  @IsDateString()
  verifiedAt?: string;
}
