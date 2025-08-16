import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsBoolean,
  IsObject,
} from 'class-validator';
import {
  AchievementType,
  AchievementTier,
} from '../../../database/entities/achievement.entity';

export class CreateAchievementDto {
  @ApiProperty({
    description: 'Unique code for the achievement',
    example: 'FIRST_HABIT',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Name of the achievement',
    example: 'First Steps',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the achievement',
    example: 'Create your first habit',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Type of achievement',
    enum: AchievementType,
    example: AchievementType.HABIT_CREATION,
  })
  @IsEnum(AchievementType)
  type: AchievementType;

  @ApiProperty({
    description: 'Tier of the achievement',
    enum: AchievementTier,
    example: AchievementTier.BRONZE,
  })
  @IsEnum(AchievementTier)
  tier: AchievementTier;

  @ApiProperty({
    description: 'Points awarded for this achievement',
    example: 100,
  })
  @IsNumber()
  points: number;

  @ApiPropertyOptional({
    description: 'Icon for the achievement',
    example: '🏆',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Badge image URL',
    example: '/images/badges/first-habit.png',
  })
  @IsOptional()
  @IsString()
  badgeImage?: string;

  @ApiProperty({
    description: 'Criteria for earning the achievement',
    example: {
      habitCount: 1,
    },
  })
  @IsObject()
  criteria: {
    habitId?: number;
    habitCategory?: string;
    streakDays?: number;
    completionCount?: number;
    perfectDays?: number;
    habitCount?: number;
    socialConnections?: number;
    customCondition?: string;
  };

  @ApiPropertyOptional({
    description: 'Whether the achievement is hidden until earned',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiPropertyOptional({
    description: 'Rarity percentage of the achievement',
    example: 25,
  })
  @IsOptional()
  @IsNumber()
  rarity?: number;
}

export class UpdateAchievementDto {
  @ApiPropertyOptional({
    description: 'Name of the achievement',
    example: 'First Steps',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the achievement',
    example: 'Create your first habit',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of achievement',
    enum: AchievementType,
    example: AchievementType.HABIT_CREATION,
  })
  @IsOptional()
  @IsEnum(AchievementType)
  type?: AchievementType;

  @ApiPropertyOptional({
    description: 'Tier of the achievement',
    enum: AchievementTier,
    example: AchievementTier.BRONZE,
  })
  @IsOptional()
  @IsEnum(AchievementTier)
  tier?: AchievementTier;

  @ApiPropertyOptional({
    description: 'Points awarded for this achievement',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  points?: number;

  @ApiPropertyOptional({
    description: 'Icon for the achievement',
    example: '🏆',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Badge image URL',
    example: '/images/badges/first-habit.png',
  })
  @IsOptional()
  @IsString()
  badgeImage?: string;

  @ApiPropertyOptional({
    description: 'Criteria for earning the achievement',
    example: {
      habitCount: 1,
    },
  })
  @IsOptional()
  @IsObject()
  criteria?: {
    habitId?: number;
    habitCategory?: string;
    streakDays?: number;
    completionCount?: number;
    perfectDays?: number;
    habitCount?: number;
    socialConnections?: number;
    customCondition?: string;
  };

  @ApiPropertyOptional({
    description: 'Whether the achievement is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the achievement is hidden until earned',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiPropertyOptional({
    description: 'Rarity percentage of the achievement',
    example: 25,
  })
  @IsOptional()
  @IsNumber()
  rarity?: number;
}

export class AchievementDto {
  @ApiProperty({
    description: 'ID of the achievement',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Unique code for the achievement',
    example: 'FIRST_HABIT',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Name of the achievement',
    example: 'First Steps',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the achievement',
    example: 'Create your first habit',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Type of achievement',
    enum: AchievementType,
    example: AchievementType.HABIT_CREATION,
  })
  @IsEnum(AchievementType)
  type: AchievementType;

  @ApiProperty({
    description: 'Tier of the achievement',
    enum: AchievementTier,
    example: AchievementTier.BRONZE,
  })
  @IsEnum(AchievementTier)
  tier: AchievementTier;

  @ApiProperty({
    description: 'Points awarded for this achievement',
    example: 100,
  })
  @IsNumber()
  points: number;

  @ApiPropertyOptional({
    description: 'Icon for the achievement',
    example: '🏆',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Badge image URL',
    example: '/images/badges/first-habit.png',
  })
  @IsOptional()
  @IsString()
  badgeImage?: string;

  @ApiProperty({
    description: 'Criteria for earning the achievement',
    example: {
      habitCount: 1,
    },
  })
  @IsObject()
  criteria: {
    habitId?: number;
    habitCategory?: string;
    streakDays?: number;
    completionCount?: number;
    perfectDays?: number;
    habitCount?: number;
    socialConnections?: number;
    customCondition?: string;
  };

  @ApiProperty({
    description: 'Whether the achievement is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the achievement is hidden until earned',
    example: false,
  })
  @IsBoolean()
  isHidden: boolean;

  @ApiProperty({
    description: 'Rarity percentage of the achievement',
    example: 25,
  })
  @IsNumber()
  rarity: number;

  @ApiProperty({
    description: 'Date when achievement was created',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  createdAt: string;

  @ApiProperty({
    description: 'Date when achievement was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  updatedAt: string;
}

export class UserAchievementDto {
  @ApiProperty({
    description: 'ID of the user achievement',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'ID of the user',
    example: 1,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'ID of the achievement',
    example: 1,
  })
  @IsNumber()
  achievementId: number;

  @ApiProperty({
    description: 'Date when achievement was earned',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  earnedAt: string;

  @ApiPropertyOptional({
    description: 'Progress data when achievement was earned',
    example: '{"habitCount": 1}',
  })
  @IsOptional()
  @IsString()
  progress?: string;

  @ApiProperty({
    description: 'Whether the user has been notified about this achievement',
    example: false,
  })
  @IsBoolean()
  isNotified: boolean;

  @ApiProperty({
    description: 'Whether the achievement has been shared',
    example: false,
  })
  @IsBoolean()
  isShared: boolean;

  @ApiProperty({
    description: 'Date when user achievement was created',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  createdAt: string;

  @ApiProperty({
    description: 'Date when user achievement was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  updatedAt: string;

  @ApiProperty({
    description: 'Achievement details',
    type: AchievementDto,
  })
  achievement: AchievementDto;
}

