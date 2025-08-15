import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { HealthDataType } from '../../../database/entities/health-data.entity';
import { Transform, Type } from 'class-transformer';

export class HealthDataQueryDto {
  @ApiPropertyOptional({
    description: 'Type of health data to retrieve',
    enum: HealthDataType,
    example: HealthDataType.STEPS,
  })
  @IsOptional()
  @IsEnum(HealthDataType)
  type?: HealthDataType;

  @ApiPropertyOptional({
    description: 'Array of health data types to retrieve',
    enum: HealthDataType,
    isArray: true,
    example: [HealthDataType.STEPS, HealthDataType.HEART_RATE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(HealthDataType, { each: true })
  types?: HealthDataType[];

  @ApiPropertyOptional({
    description: 'Start date for data range (ISO string)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for data range (ISO string)',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Device ID to filter data by',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  deviceId?: number;

  @ApiPropertyOptional({
    description: 'Provider to filter data by',
    example: 'fitbit',
  })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({
    description: 'Number of data points to return',
    example: 100,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @ApiPropertyOptional({
    description: 'Number of data points to skip (for pagination)',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Sort order: asc or desc',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  order?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Group data by time interval',
    example: '1h',
    enum: ['1m', '5m', '15m', '30m', '1h', '6h', '12h', '1d', '1w', '1M'],
  })
  @IsOptional()
  @IsString()
  groupBy?:
    | '1m'
    | '5m'
    | '15m'
    | '30m'
    | '1h'
    | '6h'
    | '12h'
    | '1d'
    | '1w'
    | '1M';

  @ApiPropertyOptional({
    description: 'Include processed data in response',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeProcessed?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include metadata in response',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeMetadata?: boolean = false;

  @ApiPropertyOptional({
    description: 'Filter by data quality',
    example: 'high',
    enum: ['high', 'medium', 'low', 'unknown'],
  })
  @IsOptional()
  @IsString()
  quality?: 'high' | 'medium' | 'low' | 'unknown';
}
