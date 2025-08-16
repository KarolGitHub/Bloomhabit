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

export enum ReminderType {
  HABIT_REMINDER = 'HABIT_REMINDER',
  GOAL_REMINDER = 'GOAL_REMINDER',
  MOTIVATION = 'MOTIVATION',
  PROGRESS_CHECK = 'PROGRESS_CHECK',
  GARDEN_UPDATE = 'GARDEN_UPDATE',
  CUSTOM = 'CUSTOM',
}

export enum ReminderFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

export enum ReminderStatus {
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  ACTED_UPON = 'ACTED_UPON',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum ReminderPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateSmartReminderDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(ReminderType)
  reminderType: ReminderType;

  @IsEnum(ReminderFrequency)
  frequency: ReminderFrequency;

  @IsOptional()
  @IsUUID()
  habitId?: string;

  @IsOptional()
  @IsUUID()
  goalId?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsEnum(ReminderPriority)
  priority?: ReminderPriority;

  @IsOptional()
  @IsObject()
  aiOptimization?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateSmartReminderDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(ReminderType)
  reminderType?: ReminderType;

  @IsOptional()
  @IsEnum(ReminderFrequency)
  frequency?: ReminderFrequency;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsEnum(ReminderPriority)
  priority?: ReminderPriority;

  @IsOptional()
  @IsObject()
  aiOptimization?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SmartReminderDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(ReminderType)
  reminderType: ReminderType;

  @IsEnum(ReminderFrequency)
  frequency: ReminderFrequency;

  @IsEnum(ReminderStatus)
  status: ReminderStatus;

  @IsOptional()
  @IsUUID()
  habitId?: string;

  @IsOptional()
  @IsUUID()
  goalId?: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsEnum(ReminderPriority)
  priority: ReminderPriority;

  @IsOptional()
  @IsDateString()
  sentAt?: string;

  @IsOptional()
  @IsDateString()
  deliveredAt?: string;

  @IsOptional()
  @IsDateString()
  readAt?: string;

  @IsOptional()
  @IsDateString()
  actedUponAt?: string;

  @IsOptional()
  @IsNumber()
  openRate?: number;

  @IsOptional()
  @IsNumber()
  actionRate?: number;

  @IsOptional()
  @IsObject()
  aiOptimization?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiSuggestions?: string[];

  @IsOptional()
  @IsNumber()
  aiConfidence?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;
}

export class ReminderOptimizationDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsDateString()
  optimizedScheduledAt: string;

  @IsNumber()
  aiConfidence: number;

  @IsArray()
  @IsString({ each: true })
  aiSuggestions: string[];

  @IsObject()
  optimizationFactors: Record<string, any>;

  @IsObject()
  metadata: Record<string, any>;
}
