import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProgressContextDto {
  @IsOptional()
  @IsString()
  timeOfDay?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  energyLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  stressLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  sleepQuality?: number;

  @IsOptional()
  @IsString()
  nutrition?: string;

  @IsOptional()
  @IsBoolean()
  socialSupport?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  distractions?: string[];
}

export class ProgressMetadataDto {
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export class CreateGoalProgressDto {
  @IsNumber()
  goalId: number;

  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  previousValue?: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  mood?: number;

  @IsOptional()
  @IsString()
  weather?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProgressContextDto)
  context?: ProgressContextDto;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  verificationNotes?: string;

  @IsOptional()
  @IsEnum(['manual', 'automatic', 'habit_sync', 'milestone'])
  progressType?: 'manual' | 'automatic' | 'habit_sync' | 'milestone';

  @IsOptional()
  @ValidateNested()
  @Type(() => ProgressMetadataDto)
  metadata?: ProgressMetadataDto;
}
