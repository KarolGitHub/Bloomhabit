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
import { Transform } from 'class-transformer';

export enum ChatMessageType {
  USER = 'USER',
  AI = 'AI',
  SYSTEM = 'SYSTEM',
}

export enum ChatContextType {
  HABIT_QUESTION = 'HABIT_QUESTION',
  GARDEN_HELP = 'GARDEN_HELP',
  MOTIVATION = 'MOTIVATION',
  GOAL_PLANNING = 'GOAL_PLANNING',
  GENERAL = 'GENERAL',
}

export class CreateAiChatDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(ChatContextType)
  contextType?: ChatContextType;

  @IsOptional()
  @IsUUID()
  habitId?: string;

  @IsOptional()
  @IsUUID()
  goalId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateAiChatDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(ChatContextType)
  contextType?: ChatContextType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class AiChatDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsString()
  message: string;

  @IsEnum(ChatMessageType)
  messageType: ChatMessageType;

  @IsEnum(ChatContextType)
  contextType: ChatContextType;

  @IsOptional()
  @IsUUID()
  habitId?: string;

  @IsOptional()
  @IsUUID()
  goalId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  aiResponse?: string;

  @IsOptional()
  @IsNumber()
  confidence?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suggestions?: string[];

  @IsOptional()
  @IsBoolean()
  isHelpful?: boolean;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;
}

export class ChatSessionDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsEnum(ChatContextType)
  primaryContext: ChatContextType;

  @IsArray()
  @IsObject({ each: true })
  messages: AiChatDto[];

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;

  @IsOptional()
  @IsDateString()
  lastActivityAt?: string;
}

export class CreateChatSessionDto {
  @IsString()
  title: string;

  @IsEnum(ChatContextType)
  primaryContext: ChatContextType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateChatSessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(ChatContextType)
  primaryContext?: ChatContextType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
