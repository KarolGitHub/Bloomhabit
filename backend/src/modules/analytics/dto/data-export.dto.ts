import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel',
  PDF = 'pdf',
}

export enum ExportType {
  HABIT_DATA = 'habit_data',
  HABIT_LOGS = 'habit_logs',
  ANALYTICS = 'analytics',
  CORRELATIONS = 'correlations',
  PREDICTIONS = 'predictions',
  GOALS = 'goals',
  COMPLETE_PROFILE = 'complete_profile',
}

export enum ExportTimeRange {
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_YEAR = 'last_year',
  ALL_TIME = 'all_time',
  CUSTOM = 'custom',
}

export class DataExportRequestDto {
  @ApiProperty({
    description: 'Type of data to export',
    enum: ExportType,
    example: ExportType.HABIT_DATA,
  })
  @IsEnum(ExportType)
  exportType: ExportType;

  @ApiProperty({
    description: 'Format for the export',
    enum: ExportFormat,
    example: ExportFormat.CSV,
  })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiProperty({
    description: 'Time range for the data',
    enum: ExportTimeRange,
    example: ExportTimeRange.LAST_30_DAYS,
  })
  @IsEnum(ExportTimeRange)
  timeRange: ExportTimeRange;

  @ApiPropertyOptional({
    description: 'Custom start date (ISO string)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  customStartDate?: string;

  @ApiPropertyOptional({
    description: 'Custom end date (ISO string)',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  customEndDate?: string;

  @ApiPropertyOptional({
    description: 'Specific habit IDs to include',
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  habitIds?: number[];

  @ApiPropertyOptional({
    description: 'Include metadata and additional fields',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;

  @ApiPropertyOptional({
    description: 'Include processed/calculated fields',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  includeCalculated?: boolean;

  @ApiPropertyOptional({
    description: 'Group data by time intervals',
    example: 'daily',
  })
  @IsOptional()
  @IsString()
  groupBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order for the data',
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Additional export options',
    example: { includeCharts: true, includeInsights: true },
  })
  @IsOptional()
  exportOptions?: {
    includeCharts?: boolean;
    includeInsights?: boolean;
    includeRecommendations?: boolean;
    includeCorrelations?: boolean;
    includePredictions?: boolean;
    compressOutput?: boolean;
  };
}

export class DataExportResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the export job',
    example: 'export_001',
  })
  @IsString()
  exportId: string;

  @ApiProperty({
    description: 'Status of the export job',
    example: 'processing',
  })
  @IsString()
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiProperty({
    description: 'Type of data being exported',
    enum: ExportType,
    example: ExportType.HABIT_DATA,
  })
  @IsEnum(ExportType)
  exportType: ExportType;

  @ApiProperty({
    description: 'Format of the export',
    enum: ExportFormat,
    example: ExportFormat.CSV,
  })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiProperty({
    description: 'Time range of the exported data',
    enum: ExportTimeRange,
    example: ExportTimeRange.LAST_30_DAYS,
  })
  @IsEnum(ExportTimeRange)
  timeRange: ExportTimeRange;

  @ApiProperty({
    description: 'Number of records exported',
    example: 1250,
  })
  @IsString()
  recordCount: string;

  @ApiProperty({
    description: 'File size of the export',
    example: '2.5 MB',
  })
  @IsString()
  fileSize: string;

  @ApiPropertyOptional({
    description: 'Download URL for the exported file',
    example: 'https://api.bloomhabit.com/exports/export_001/download',
  })
  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @ApiPropertyOptional({
    description: 'Expiration date of the download link',
    example: '2024-02-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({
    description: 'Date when export was created',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  createdAt: string;

  @ApiPropertyOptional({
    description: 'Date when export was completed',
    example: '2024-01-15T10:32:00Z',
  })
  @IsOptional()
  @IsString()
  completedAt?: string;

  @ApiPropertyOptional({
    description: 'Error message if export failed',
    example: 'Failed to process habit logs',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Progress percentage (0-100)',
    example: 75,
  })
  @IsOptional()
  @IsString()
  progress?: string;
}

export class ExportHistoryDto {
  @ApiProperty({
    description: 'List of export jobs',
    type: [DataExportResponseDto],
  })
  exports: DataExportResponseDto[];

  @ApiProperty({
    description: 'Total number of exports',
    example: 15,
  })
  @IsString()
  totalExports: string;

  @ApiProperty({
    description: 'Total storage used by exports',
    example: '45.2 MB',
  })
  @IsString()
  totalStorageUsed: string;

  @ApiProperty({
    description: 'Date when export history was retrieved',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  retrievedAt: string;
}

export class ExportTemplateDto {
  @ApiProperty({
    description: 'Name of the export template',
    example: 'Weekly Habit Report',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the template',
    example: 'Export weekly habit data with insights and charts',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Export configuration for the template',
    type: DataExportRequestDto,
  })
  exportConfig: DataExportRequestDto;

  @ApiProperty({
    description: 'Whether this is a default template',
    example: false,
  })
  @IsBoolean()
  isDefault: boolean;

  @ApiProperty({
    description: 'Date when template was created',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  createdAt: string;
}
