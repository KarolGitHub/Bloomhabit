import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MilestoneDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  targetValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  achievedValue?: number;
}

export class SubGoalDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  targetValue: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number; // Percentage contribution to main goal
}

export class GoalSettingsDto {
  @IsOptional()
  @IsBoolean()
  allowPartialProgress?: boolean;

  @IsOptional()
  @IsBoolean()
  requireVerification?: boolean;

  @IsOptional()
  @IsBoolean()
  autoAdjustTarget?: boolean;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'never'])
  reminderFrequency?: 'daily' | 'weekly' | 'monthly' | 'never';

  @IsOptional()
  @IsString()
  reminderTime?: string;

  @IsOptional()
  @IsBoolean()
  showProgress?: boolean;

  @IsOptional()
  @IsBoolean()
  shareProgress?: boolean;
}

export class CreateGoalDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['habit_based', 'numeric', 'time_based', 'milestone', 'composite'])
  type: 'habit_based' | 'numeric' | 'time_based' | 'milestone' | 'composite';

  @IsEnum(['easy', 'medium', 'hard', 'expert'])
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';

  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority: 'low' | 'medium' | 'high' | 'critical';

  // SMART Goal Attributes
  @IsOptional()
  @IsString()
  specific?: string;

  @IsOptional()
  @IsString()
  measurable?: string;

  @IsOptional()
  @IsString()
  achievable?: string;

  @IsOptional()
  @IsString()
  relevant?: string;

  @IsOptional()
  @IsString()
  timeBound?: string;

  // Goal Configuration
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetValue?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  targetDate: string;

  // Milestones and Sub-goals
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones?: MilestoneDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubGoalDto)
  subGoals?: SubGoalDto[];

  // Goal Settings
  @IsOptional()
  @ValidateNested()
  @Type(() => GoalSettingsDto)
  settings?: GoalSettingsDto;

  // Tags and Categories
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  // Motivation and Notes
  @IsOptional()
  @IsString()
  motivation?: string;

  @IsOptional()
  @IsString()
  obstacles?: string;

  @IsOptional()
  @IsString()
  strategies?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Related Habits
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  habitIds?: number[];
}
