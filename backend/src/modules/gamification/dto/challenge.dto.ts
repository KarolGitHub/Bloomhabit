import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsBoolean,
  IsObject,
  IsDateString,
} from 'class-validator';
import {
  ChallengeType,
  ChallengeStatus,
  ChallengeDifficulty,
} from '../../../database/entities/challenge.entity';

export class CreateChallengeDto {
  @ApiProperty({
    description: 'Name of the challenge',
    example: '30-Day Fitness Streak',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the challenge',
    example: 'Complete your fitness habits for 30 consecutive days',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Type of challenge',
    enum: ChallengeType,
    example: ChallengeType.STREAK,
  })
  @IsEnum(ChallengeType)
  type: ChallengeType;

  @ApiProperty({
    description: 'Difficulty level of the challenge',
    enum: ChallengeDifficulty,
    example: ChallengeDifficulty.MEDIUM,
  })
  @IsEnum(ChallengeDifficulty)
  difficulty: ChallengeDifficulty;

  @ApiProperty({
    description: 'Start date of the challenge',
    example: '2024-01-15T00:00:00Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the challenge',
    example: '2024-02-15T23:59:59Z',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Maximum number of participants',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  maxParticipants?: number;

  @ApiProperty({
    description: 'Requirements to complete the challenge',
    example: {
      streakDays: 30,
      habitCategory: 'fitness',
    },
  })
  @IsObject()
  requirements: {
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
    description: 'Rewards for completing the challenge',
    example: {
      points: 500,
      badge: 'fitness_streak',
      achievement: 'STREAK_MASTER',
    },
  })
  @IsObject()
  rewards: {
    points: number;
    badge?: string;
    achievement?: string;
    specialReward?: string;
  };

  @ApiPropertyOptional({
    description: 'Icon for the challenge',
    example: '🏃‍♂️',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Banner image URL',
    example: '/images/challenges/fitness-streak-banner.jpg',
  })
  @IsOptional()
  @IsString()
  bannerImage?: string;

  @ApiPropertyOptional({
    description: 'Whether the challenge is public',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the challenge is recurring',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description: 'Recurrence pattern for recurring challenges',
    example: '0 0 1 * *', // Monthly on the 1st
  })
  @IsOptional()
  @IsString()
  recurrencePattern?: string;
}

export class UpdateChallengeDto {
  @ApiPropertyOptional({
    description: 'Name of the challenge',
    example: '30-Day Fitness Streak',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the challenge',
    example: 'Complete your fitness habits for 30 consecutive days',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of challenge',
    enum: ChallengeType,
    example: ChallengeType.STREAK,
  })
  @IsOptional()
  @IsEnum(ChallengeType)
  type?: ChallengeType;

  @ApiPropertyOptional({
    description: 'Difficulty level of the challenge',
    enum: ChallengeDifficulty,
    example: ChallengeDifficulty.MEDIUM,
  })
  @IsOptional()
  @IsEnum(ChallengeDifficulty)
  difficulty?: ChallengeDifficulty;

  @ApiPropertyOptional({
    description: 'Start date of the challenge',
    example: '2024-01-15T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date of the challenge',
    example: '2024-02-15T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of participants',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  maxParticipants?: number;

  @ApiPropertyOptional({
    description: 'Requirements to complete the challenge',
    example: {
      streakDays: 30,
      habitCategory: 'fitness',
    },
  })
  @IsOptional()
  @IsObject()
  requirements?: {
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
    description: 'Rewards for completing the challenge',
    example: {
      points: 500,
      badge: 'fitness_streak',
      achievement: 'STREAK_MASTER',
    },
  })
  @IsOptional()
  @IsObject()
  rewards?: {
    points: number;
    badge?: string;
    achievement?: string;
    specialReward?: string;
  };

  @ApiPropertyOptional({
    description: 'Icon for the challenge',
    example: '🏃‍♂️',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Banner image URL',
    example: '/images/challenges/fitness-streak-banner.jpg',
  })
  @IsOptional()
  @IsString()
  bannerImage?: string;

  @ApiPropertyOptional({
    description: 'Whether the challenge is public',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the challenge is recurring',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description: 'Recurrence pattern for recurring challenges',
    example: '0 0 1 * *', // Monthly on the 1st
  })
  @IsOptional()
  @IsString()
  recurrencePattern?: string;
}

export class ChallengeDto {
  @ApiProperty({
    description: 'ID of the challenge',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Name of the challenge',
    example: '30-Day Fitness Streak',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the challenge',
    example: 'Complete your fitness habits for 30 consecutive days',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Type of challenge',
    enum: ChallengeType,
    example: ChallengeType.STREAK,
  })
  @IsEnum(ChallengeType)
  type: ChallengeType;

  @ApiProperty({
    description: 'Difficulty level of the challenge',
    enum: ChallengeDifficulty,
    example: ChallengeDifficulty.MEDIUM,
  })
  @IsEnum(ChallengeDifficulty)
  difficulty: ChallengeDifficulty;

  @ApiProperty({
    description: 'Start date of the challenge',
    example: '2024-01-15T00:00:00Z',
  })
  @IsString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the challenge',
    example: '2024-02-15T23:59:59Z',
  })
  @IsString()
  endDate: string;

  @ApiProperty({
    description: 'Maximum number of participants',
    example: 1000,
  })
  @IsNumber()
  maxParticipants: number;

  @ApiProperty({
    description: 'Current number of participants',
    example: 45,
  })
  @IsNumber()
  currentParticipants: number;

  @ApiProperty({
    description: 'Status of the challenge',
    enum: ChallengeStatus,
    example: ChallengeStatus.ACTIVE,
  })
  @IsEnum(ChallengeStatus)
  status: ChallengeStatus;

  @ApiProperty({
    description: 'Requirements to complete the challenge',
    example: {
      streakDays: 30,
      habitCategory: 'fitness',
    },
  })
  @IsObject()
  requirements: {
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
    description: 'Rewards for completing the challenge',
    example: {
      points: 500,
      badge: 'fitness_streak',
      achievement: 'STREAK_MASTER',
    },
  })
  @IsObject()
  rewards: {
    points: number;
    badge?: string;
    achievement?: string;
    specialReward?: string;
  };

  @ApiPropertyOptional({
    description: 'Icon for the challenge',
    example: '🏃‍♂️',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Banner image URL',
    example: '/images/challenges/fitness-streak-banner.jpg',
  })
  @IsOptional()
  @IsString()
  bannerImage?: string;

  @ApiProperty({
    description: 'Whether the challenge is public',
    example: true,
  })
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({
    description: 'Whether the challenge is recurring',
    example: false,
  })
  @IsBoolean()
  isRecurring: boolean;

  @ApiPropertyOptional({
    description: 'Recurrence pattern for recurring challenges',
    example: '0 0 1 * *', // Monthly on the 1st
  })
  @IsOptional()
  @IsString()
  recurrencePattern?: string;

  @ApiProperty({
    description: 'Date when challenge was created',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  createdAt: string;

  @ApiProperty({
    description: 'Date when challenge was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  updatedAt: string;
}

export class UserChallengeDto {
  @ApiProperty({
    description: 'ID of the user challenge',
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
    description: 'ID of the challenge',
    example: 1,
  })
  @IsNumber()
  challengeId: number;

  @ApiProperty({
    description: 'Status of the user in the challenge',
    enum: ['joined', 'in_progress', 'completed', 'failed', 'abandoned'],
    example: 'in_progress',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Date when user joined the challenge',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  joinedAt: string;

  @ApiPropertyOptional({
    description: 'Date when user started the challenge',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsString()
  startedAt?: string;

  @ApiPropertyOptional({
    description: 'Date when user completed the challenge',
    example: '2024-02-15T10:30:00Z',
  })
  @IsOptional()
  @IsString()
  completedAt?: string;

  @ApiPropertyOptional({
    description: 'Date when user failed the challenge',
    example: '2024-02-10T10:30:00Z',
  })
  @IsOptional()
  @IsString()
  failedAt?: string;

  @ApiProperty({
    description: 'Progress in the challenge (0.00 to 1.00)',
    example: 0.75,
  })
  @IsNumber()
  progress: number;

  @ApiPropertyOptional({
    description: 'Progress data for the challenge',
    example: {
      currentStreak: 22,
      totalCompletions: 22,
      perfectDays: 18,
    },
  })
  @IsOptional()
  @IsObject()
  progressData?: {
    currentStreak?: number;
    totalCompletions?: number;
    perfectDays?: number;
    habitCount?: number;
    socialScore?: number;
    customMetrics?: Record<string, any>;
  };

  @ApiProperty({
    description: 'Whether the user has been rewarded',
    example: false,
  })
  @IsBoolean()
  isRewarded: boolean;

  @ApiPropertyOptional({
    description: 'Date when user was rewarded',
    example: '2024-02-15T10:30:00Z',
  })
  @IsOptional()
  @IsString()
  rewardedAt?: string;

  @ApiPropertyOptional({
    description: 'User notes about the challenge',
    example: 'This is harder than I expected!',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Date when user challenge was created',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  createdAt: string;

  @ApiProperty({
    description: 'Date when user challenge was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  updatedAt: string;

  @ApiProperty({
    description: 'Challenge details',
    type: ChallengeDto,
  })
  challenge: ChallengeDto;
}

