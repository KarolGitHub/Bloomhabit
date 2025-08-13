import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  HabitCategory,
  HabitFrequency,
  FlowerType,
} from '../../../database/entities/habit.entity';

export class CreateHabitDto {
  @ApiProperty({
    description: 'Habit title',
    example: 'Morning Exercise',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Habit description',
    example: '30 minutes of cardio exercise every morning',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Habit category',
    enum: HabitCategory,
    example: HabitCategory.HEALTH,
  })
  @IsEnum(HabitCategory)
  category: HabitCategory;

  @ApiProperty({
    description: 'Habit frequency',
    enum: HabitFrequency,
    example: HabitFrequency.DAILY,
  })
  @IsEnum(HabitFrequency)
  frequency: HabitFrequency;

  @ApiProperty({
    description: 'Target count for the habit',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  targetCount?: number;

  @ApiProperty({
    description: 'Flower type for the habit',
    enum: FlowerType,
    example: FlowerType.ROSE,
  })
  @IsEnum(FlowerType)
  flowerType: FlowerType;

  @ApiProperty({
    description: 'Whether the habit is public',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
