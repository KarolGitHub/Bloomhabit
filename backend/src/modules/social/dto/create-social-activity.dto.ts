import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ActivityType } from '../../../database/entities/social-activity.entity';

export class CreateSocialActivityDto {
  @ApiProperty({
    description: 'Type of social activity',
    enum: ActivityType,
    example: ActivityType.LIKE,
  })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({
    description: 'Type of the target (habit, habit_log, goal, etc.)',
    example: 'habit',
  })
  @IsString()
  targetType: string;

  @ApiProperty({
    description: 'ID of the target',
    example: 123,
  })
  @IsNumber()
  targetId: number;

  @ApiProperty({
    description: 'Content of the activity (for comments, etc.)',
    example: 'Great job on maintaining your streak!',
    maxLength: 1000,
    required: false,
  })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Additional metadata for the activity',
    example: { emoji: '🎉', isAnonymous: false },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
