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
  IsUrl,
} from 'class-validator';

export enum ImageType {
  HABIT_COMPLETION = 'HABIT_COMPLETION',
  PROGRESS_PHOTO = 'PROGRESS_PHOTO',
  GARDEN_UPDATE = 'GARDEN_UPDATE',
  WORKOUT_ACTIVITY = 'WORKOUT_ACTIVITY',
  MEAL_TRACKING = 'MEAL_TRACKING',
  GENERAL = 'GENERAL',
}

export enum RecognitionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum RecognitionConfidence {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class CreateImageRecognitionDto {
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsEnum(ImageType)
  imageType?: ImageType;

  @IsOptional()
  @IsUUID()
  habitId?: string;

  @IsOptional()
  @IsUUID()
  goalId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateImageRecognitionDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ImageType)
  imageType?: ImageType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ImageRecognitionDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsString()
  imageUrl: string;

  @IsEnum(ImageType)
  imageType: ImageType;

  @IsEnum(RecognitionStatus)
  status: RecognitionStatus;

  @IsOptional()
  @IsUUID()
  habitId?: string;

  @IsOptional()
  @IsUUID()
  goalId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  aiAnalysis?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  detectedObjects?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  detectedActivities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  detectedEmotions?: string[];

  @IsOptional()
  @IsNumber()
  confidence?: number;

  @IsOptional()
  @IsEnum(RecognitionConfidence)
  confidenceLevel?: RecognitionConfidence;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  tags?: Array<{ name: string; confidence: number }>;

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

export class ImageAnalysisResultDto {
  @IsUUID()
  id: string;

  @IsString()
  imageUrl: string;

  @IsString()
  aiAnalysis: string;

  @IsArray()
  @IsString({ each: true })
  detectedObjects: string[];

  @IsArray()
  @IsString({ each: true })
  detectedActivities: string[];

  @IsArray()
  @IsString({ each: true })
  detectedEmotions: string[];

  @IsNumber()
  confidence: number;

  @IsEnum(RecognitionConfidence)
  confidenceLevel: RecognitionConfidence;

  @IsArray()
  @IsObject({ each: true })
  tags: Array<{ name: string; confidence: number }>;

  @IsObject()
  metadata: Record<string, any>;
}
