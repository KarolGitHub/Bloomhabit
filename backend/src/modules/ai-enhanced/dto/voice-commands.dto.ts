import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsObject,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export enum VoiceCommandType {
  HABIT_LOG = 'HABIT_LOG',
  HABIT_CREATE = 'HABIT_CREATE',
  HABIT_UPDATE = 'HABIT_UPDATE',
  GOAL_SET = 'GOAL_SET',
  PROGRESS_CHECK = 'PROGRESS_CHECK',
  MOTIVATION_REQUEST = 'MOTIVATION_REQUEST',
  GARDEN_STATUS = 'GARDEN_STATUS',
  GENERAL_QUERY = 'GENERAL_QUERY',
}

export enum VoiceCommandStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
}

export enum VoiceQuality {
  POOR = 'POOR',
  FAIR = 'FAIR',
  GOOD = 'GOOD',
  EXCELLENT = 'EXCELLENT',
}

export class CreateVoiceCommandDto {
  @IsString()
  audioUrl: string;

  @IsOptional()
  @IsString()
  transcript?: string;

  @IsOptional()
  @IsEnum(VoiceCommandType)
  commandType?: VoiceCommandType;

  @IsOptional()
  @IsUUID()
  habitId?: string;

  @IsOptional()
  @IsUUID()
  goalId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateVoiceCommandDto {
  @IsOptional()
  @IsString()
  transcript?: string;

  @IsOptional()
  @IsEnum(VoiceCommandType)
  commandType?: VoiceCommandType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class VoiceCommandDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsString()
  audioUrl: string;

  @IsOptional()
  @IsString()
  transcript?: string;

  @IsEnum(VoiceCommandType)
  commandType: VoiceCommandType;

  @IsEnum(VoiceCommandStatus)
  status: VoiceCommandStatus;

  @IsOptional()
  @IsUUID()
  habitId?: string;

  @IsOptional()
  @IsUUID()
  goalId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  aiInterpretation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  extractedEntities?: string[];

  @IsOptional()
  @IsNumber()
  confidence?: number;

  @IsOptional()
  @IsEnum(VoiceQuality)
  voiceQuality?: VoiceQuality;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suggestedActions?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;

  @IsOptional()
  @IsDateString()
  processedAt?: string;
}

export class VoiceCommandResultDto {
  @IsUUID()
  id: string;

  @IsString()
  transcript: string;

  @IsString()
  aiInterpretation: string;

  @IsArray()
  @IsString({ each: true })
  extractedEntities: string[];

  @IsNumber()
  confidence: number;

  @IsEnum(VoiceQuality)
  voiceQuality: VoiceQuality;

  @IsArray()
  @IsString({ each: true })
  suggestedActions: string[];

  @IsObject()
  metadata: Record<string, any>;
}
