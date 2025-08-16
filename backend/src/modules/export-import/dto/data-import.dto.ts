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

export class ImportOptionsDto {
  @IsEnum(['SKIP', 'OVERWRITE', 'MERGE', 'RENAME'])
  conflictResolution: 'SKIP' | 'OVERWRITE' | 'MERGE' | 'RENAME';

  @IsBoolean()
  createMissing: boolean;

  @IsBoolean()
  updateExisting: boolean;

  @IsBoolean()
  validateData: boolean;

  @IsBoolean()
  backupBeforeImport: boolean;

  @IsBoolean()
  rollbackOnError: boolean;

  @IsNumber()
  maxErrors: number;

  @IsBoolean()
  dryRun: boolean;
}

export class ImportFiltersDto {
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
  @IsArray()
  @IsString({ each: true })
  dataTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeTypes?: string[];

  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;

  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}

export class ImportValidationErrorDto {
  @IsNumber()
  row: number;

  @IsString()
  field: string;

  @IsString()
  value: any;

  @IsString()
  error: string;

  @IsEnum(['ERROR', 'WARNING', 'INFO'])
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export class ImportSchemaValidationDto {
  @IsBoolean()
  passed: boolean;

  @IsArray()
  @IsString({ each: true })
  missingFields: string[];

  @IsArray()
  @IsString({ each: true })
  extraFields: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportTypeMismatchDto)
  typeMismatches: ImportTypeMismatchDto[];
}

export class ImportTypeMismatchDto {
  @IsString()
  field: string;

  @IsString()
  expectedType: string;

  @IsString()
  actualType: string;
}

export class ImportConstraintViolationDto {
  @IsString()
  field: string;

  @IsString()
  constraint: string;

  @IsString()
  value: any;

  @IsString()
  message: string;
}

export class ImportDuplicateCheckDto {
  @IsString()
  field: string;

  @IsNumber()
  duplicates: number;

  @IsArray()
  examples: any[];
}

export class ImportDataValidationDto {
  @IsBoolean()
  passed: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportConstraintViolationDto)
  constraintViolations: ImportConstraintViolationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportDuplicateCheckDto)
  duplicateChecks: ImportDuplicateCheckDto[];
}

export class ImportValidationResultsDto {
  @IsNumber()
  totalRecords: number;

  @IsNumber()
  validRecords: number;

  @IsNumber()
  invalidRecords: number;

  @IsNumber()
  warnings: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportValidationErrorDto)
  errors: ImportValidationErrorDto[];

  @ValidateNested()
  @Type(() => ImportSchemaValidationDto)
  schemaValidation: ImportSchemaValidationDto;

  @ValidateNested()
  @Type(() => ImportDataValidationDto)
  dataValidation: ImportDataValidationDto;
}

export class ImportProgressDto {
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
  recordsProcessed: number;

  @IsNumber()
  recordsTotal: number;
}

export class ImportConflictDto {
  @IsString()
  type: 'DUPLICATE' | 'CONSTRAINT_VIOLATION' | 'SCHEMA_MISMATCH';

  @IsString()
  description: string;

  @IsString()
  resolution: string;

  @IsNumber()
  affectedRecords: number;
}

export class ImportResultsDto {
  @IsNumber()
  totalRecords: number;

  @IsNumber()
  importedRecords: number;

  @IsNumber()
  skippedRecords: number;

  @IsNumber()
  failedRecords: number;

  @IsNumber()
  updatedRecords: number;

  @IsNumber()
  createdRecords: number;

  @IsNumber()
  deletedRecords: number;

  @IsArray()
  @IsString({ each: true })
  dataTypes: string[];

  @IsString()
  importDate: string;

  @IsString()
  version: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportConflictDto)
  conflicts: ImportConflictDto[];
}

export class ImportBackupInfoDto {
  @IsString()
  backupId: string;

  @IsString()
  backupDate: string;

  @IsNumber()
  backupSize: number;

  @IsString()
  backupChecksum: string;

  @IsString()
  backupLocation: string;

  @IsString()
  restorePoint: string;
}

export class ImportErrorDetailsDto {
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

  @IsBoolean()
  rollbackAttempted: boolean;

  @IsBoolean()
  rollbackSuccessful: boolean;
}

export class ImportDataQualityDto {
  @IsNumber()
  completeness: number;

  @IsNumber()
  accuracy: number;

  @IsNumber()
  consistency: number;

  @IsNumber()
  timeliness: number;
}

export class ImportMetadataDto {
  @IsString()
  source: string;

  @IsOptional()
  @IsString()
  sourceVersion?: string;

  @IsString()
  importDate: string;

  @IsObject()
  schema: any;

  @ValidateNested()
  @Type(() => ImportDataQualityDto)
  dataQuality: ImportDataQualityDto;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @IsString({ each: true })
  notes: string[];
}

export class ImportUploadHistoryDto {
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

export class ImportAccessLogDto {
  @IsNumber()
  uploads: number;

  @IsOptional()
  @IsString()
  lastUploaded?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportUploadHistoryDto)
  uploadHistory: ImportUploadHistoryDto[];
}

export class CreateDataImportDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['CSV', 'JSON', 'EXCEL', 'BACKUP'])
  format: 'CSV' | 'JSON' | 'EXCEL' | 'BACKUP';

  @IsEnum([
    'FULL_RESTORE',
    'PARTIAL_RESTORE',
    'MERGE_DATA',
    'UPDATE_EXISTING',
    'BULK_IMPORT',
  ])
  importType:
    | 'FULL_RESTORE'
    | 'PARTIAL_RESTORE'
    | 'MERGE_DATA'
    | 'UPDATE_EXISTING'
    | 'BULK_IMPORT';

  @ValidateNested()
  @Type(() => ImportOptionsDto)
  importOptions: ImportOptionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImportFiltersDto)
  filters?: ImportFiltersDto;
}

export class UpdateDataImportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImportOptionsDto)
  importOptions?: ImportOptionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImportFiltersDto)
  filters?: ImportFiltersDto;
}

export class DataImportDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsString()
  status: string;

  @IsString()
  format: string;

  @IsString()
  importType: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sourceFilePath?: string;

  @IsOptional()
  @IsString()
  uploadedFilePath?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  checksum?: string;

  @IsOptional()
  @IsString()
  originalChecksum?: string;

  @ValidateNested()
  @Type(() => ImportOptionsDto)
  importOptions: ImportOptionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImportFiltersDto)
  filters?: ImportFiltersDto;

  @IsString()
  validationStatus: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImportValidationResultsDto)
  validationResults?: ImportValidationResultsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImportProgressDto)
  progress?: ImportProgressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImportResultsDto)
  results?: ImportResultsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImportBackupInfoDto)
  backupInfo?: ImportBackupInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImportErrorDetailsDto)
  errorDetails?: ImportErrorDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImportMetadataDto)
  metadata?: ImportMetadataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImportAccessLogDto)
  accessLog?: ImportAccessLogDto;

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
  validatedAt?: string;

  @IsOptional()
  @IsDateString()
  uploadedAt?: string;
}
