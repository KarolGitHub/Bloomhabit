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

export class ExportFiltersDto {
  @IsOptional()
  @IsObject()
  dateRange?: {
    start: string;
    end: string;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;

  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataTypes?: string[];
}

export class ExportCustomFieldsDto {
  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;

  @IsOptional()
  @IsBoolean()
  includeRelations?: boolean;

  @IsOptional()
  @IsBoolean()
  includeHistory?: boolean;

  @IsOptional()
  @IsBoolean()
  includeAnalytics?: boolean;

  @IsOptional()
  @IsBoolean()
  includeFiles?: boolean;

  @IsOptional()
  @IsNumber()
  compressionLevel?: number;

  @IsOptional()
  @IsBoolean()
  encryptionEnabled?: boolean;
}

export class ExportProgressDto {
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
}

export class ExportMetadataDto {
  @IsNumber()
  totalRecords: number;

  @IsArray()
  @IsString({ each: true })
  dataTypes: string[];

  @IsObject()
  dateRange: {
    start: string;
    end: string;
  };

  @IsString()
  version: string;

  @IsString()
  exportDate: string;

  @IsObject()
  schema: any;
}

export class ExportErrorDetailsDto {
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
}

export class ExportAccessLogDto {
  @IsNumber()
  downloads: number;

  @IsOptional()
  @IsString()
  lastDownloaded?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExportDownloadHistoryDto)
  downloadHistory: ExportDownloadHistoryDto[];
}

export class ExportDownloadHistoryDto {
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

export class CreateDataExportDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['CSV', 'JSON', 'EXCEL', 'PDF'])
  format: 'CSV' | 'JSON' | 'EXCEL' | 'PDF';

  @IsEnum([
    'FULL_DATA',
    'HABITS_ONLY',
    'GARDEN_ONLY',
    'ANALYTICS_ONLY',
    'SOCIAL_ONLY',
    'CUSTOM',
  ])
  exportType:
    | 'FULL_DATA'
    | 'HABITS_ONLY'
    | 'GARDEN_ONLY'
    | 'ANALYTICS_ONLY'
    | 'SOCIAL_ONLY'
    | 'CUSTOM';

  @IsOptional()
  @ValidateNested()
  @Type(() => ExportFiltersDto)
  filters?: ExportFiltersDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExportCustomFieldsDto)
  customFields?: ExportCustomFieldsDto;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateDataExportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExportFiltersDto)
  filters?: ExportFiltersDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExportCustomFieldsDto)
  customFields?: ExportCustomFieldsDto;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class DataExportDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsString()
  status: string;

  @IsString()
  format: string;

  @IsString()
  exportType: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExportFiltersDto)
  filters?: ExportFiltersDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExportCustomFieldsDto)
  customFields?: ExportCustomFieldsDto;

  @IsOptional()
  @IsString()
  filePath?: string;

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
  @ValidateNested()
  @Type(() => ExportProgressDto)
  progress?: ExportProgressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExportMetadataDto)
  metadata?: ExportMetadataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExportErrorDetailsDto)
  errorDetails?: ExportErrorDetailsDto;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsBoolean()
  isCompressed: boolean;

  @IsBoolean()
  isEncrypted: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExportAccessLogDto)
  accessLog?: ExportAccessLogDto;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsDateString()
  downloadedAt?: string;
}
