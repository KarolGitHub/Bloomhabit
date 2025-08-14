import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HabitLogStatus } from '../../../database/entities/habit-log.entity';

export class LogHabitDto {
  @ApiProperty({ description: 'Habit ID to log' })
  @IsInt()
  habitId: number;

  @ApiProperty({
    description: 'Date of the habit log (YYYY-MM-DD format)',
    example: '2024-01-15',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    enum: HabitLogStatus,
    description: 'Status of the habit completion',
  })
  @IsEnum(HabitLogStatus)
  status: HabitLogStatus;

  @ApiPropertyOptional({
    description: 'Number of times the habit was completed',
    minimum: 0,
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  completedCount?: number;

  @ApiPropertyOptional({
    description: 'Target count for the habit on this date',
    minimum: 1,
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  targetCount?: number;

  @ApiPropertyOptional({
    description: 'Additional notes about the habit completion',
    example: 'Felt great today, exceeded my goal!',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

