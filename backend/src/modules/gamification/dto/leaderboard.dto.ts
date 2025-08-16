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
  LeaderboardType,
  LeaderboardMetric,
} from '../../../database/entities/leaderboard.entity';

export class CreateLeaderboardDto {
  @ApiProperty({
    description: 'Name of the leaderboard',
    example: 'Weekly Fitness Champions',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the leaderboard',
    example: 'Compete for the top fitness spot this week',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of leaderboard',
    enum: LeaderboardType,
    example: LeaderboardType.WEEKLY,
  })
  @IsEnum(LeaderboardType)
  type: LeaderboardType;

  @ApiProperty({
    description: 'Metric used for ranking',
    enum: LeaderboardMetric,
    example: LeaderboardMetric.POINTS,
  })
  @IsEnum(LeaderboardMetric)
  metric: LeaderboardMetric;

  @ApiPropertyOptional({
    description: 'Specific habit category for this leaderboard',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  habitCategoryId?: number;

  @ApiPropertyOptional({
    description: 'Start date for the leaderboard period',
    example: '2024-01-15T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for the leaderboard period',
    example: '2024-01-22T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of entries allowed',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  maxEntries?: number;

  @ApiPropertyOptional({
    description: 'Whether the leaderboard is public',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Rewards for top performers',
    example: {
      firstPlace: { points: 1000, badge: 'gold_medal' },
      secondPlace: { points: 500, badge: 'silver_medal' },
      thirdPlace: { points: 250, badge: 'bronze_medal' },
      participation: { points: 50 },
    },
  })
  @IsOptional()
  @IsObject()
  rewards?: {
    firstPlace?: { points: number; badge?: string };
    secondPlace?: { points: number; badge?: string };
    thirdPlace?: { points: number; badge?: string };
    participation?: { points: number; badge?: string };
  };
}

export class UpdateLeaderboardDto {
  @ApiPropertyOptional({
    description: 'Name of the leaderboard',
    example: 'Weekly Fitness Champions',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the leaderboard',
    example: 'Compete for the top fitness spot this week',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of leaderboard',
    enum: LeaderboardType,
    example: LeaderboardType.WEEKLY,
  })
  @IsOptional()
  @IsEnum(LeaderboardType)
  type?: LeaderboardType;

  @ApiPropertyOptional({
    description: 'Metric used for ranking',
    enum: LeaderboardMetric,
    example: LeaderboardMetric.POINTS,
  })
  @IsOptional()
  @IsEnum(LeaderboardMetric)
  metric?: LeaderboardMetric;

  @ApiPropertyOptional({
    description: 'Specific habit category for this leaderboard',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  habitCategoryId?: number;

  @ApiPropertyOptional({
    description: 'Start date for the leaderboard period',
    example: '2024-01-15T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for the leaderboard period',
    example: '2024-01-22T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of entries allowed',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  maxEntries?: number;

  @ApiPropertyOptional({
    description: 'Whether the leaderboard is public',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the leaderboard is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Rewards for top performers',
    example: {
      firstPlace: { points: 1000, badge: 'gold_medal' },
      secondPlace: { points: 500, badge: 'silver_medal' },
      thirdPlace: { points: 250, badge: 'bronze_medal' },
      participation: { points: 50 },
    },
  })
  @IsOptional()
  @IsObject()
  rewards?: {
    firstPlace?: { points: number; badge?: string };
    secondPlace?: { points: number; badge?: string };
    thirdPlace?: { points: number; badge?: string };
    participation?: { points: number; badge?: string };
  };
}

export class LeaderboardDto {
  @ApiProperty({
    description: 'ID of the leaderboard',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Name of the leaderboard',
    example: 'Weekly Fitness Champions',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the leaderboard',
    example: 'Compete for the top fitness spot this week',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of leaderboard',
    enum: LeaderboardType,
    example: LeaderboardType.WEEKLY,
  })
  @IsEnum(LeaderboardType)
  type: LeaderboardType;

  @ApiProperty({
    description: 'Metric used for ranking',
    enum: LeaderboardMetric,
    example: LeaderboardMetric.POINTS,
  })
  @IsEnum(LeaderboardMetric)
  metric: LeaderboardMetric;

  @ApiPropertyOptional({
    description: 'Specific habit category for this leaderboard',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  habitCategoryId?: number;

  @ApiPropertyOptional({
    description: 'Start date for the leaderboard period',
    example: '2024-01-15T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for the leaderboard period',
    example: '2024-01-22T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({
    description: 'Current number of participants',
    example: 45,
  })
  @IsNumber()
  currentParticipants: number;

  @ApiProperty({
    description: 'Maximum number of entries allowed',
    example: 100,
  })
  @IsNumber()
  maxEntries: number;

  @ApiProperty({
    description: 'Whether the leaderboard is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the leaderboard is public',
    example: true,
  })
  @IsBoolean()
  isPublic: boolean;

  @ApiPropertyOptional({
    description: 'Rewards for top performers',
    example: {
      firstPlace: { points: 1000, badge: 'gold_medal' },
      secondPlace: { points: 500, badge: 'silver_medal' },
      thirdPlace: { points: 250, badge: 'bronze_medal' },
      participation: { points: 50 },
    },
  })
  @IsOptional()
  @IsObject()
  rewards?: {
    firstPlace?: { points: number; badge?: string };
    secondPlace?: { points: number; badge?: string };
    thirdPlace?: { points: number; badge?: string };
    participation?: { points: number; badge?: string };
  };

  @ApiProperty({
    description: 'Date when leaderboard was created',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  createdAt: string;

  @ApiProperty({
    description: 'Date when leaderboard was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  updatedAt: string;
}

export class LeaderboardEntryDto {
  @ApiProperty({
    description: 'ID of the leaderboard entry',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'ID of the leaderboard',
    example: 1,
  })
  @IsNumber()
  leaderboardId: number;

  @ApiProperty({
    description: 'ID of the user',
    example: 1,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Score of the user',
    example: 1250.5,
  })
  @IsNumber()
  score: number;

  @ApiProperty({
    description: 'Rank of the user',
    example: 3,
  })
  @IsNumber()
  rank: number;

  @ApiPropertyOptional({
    description: 'Additional metadata about the score',
    example: {
      streak: 15,
      completionRate: 0.85,
      perfectDays: 12,
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: {
    streak?: number;
    completionRate?: number;
    perfectDays?: number;
    habitCount?: number;
    achievementCount?: number;
    socialScore?: number;
    customMetrics?: Record<string, any>;
  };

  @ApiPropertyOptional({
    description: 'Date when entry was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsString()
  lastUpdated?: string;

  @ApiProperty({
    description: 'Whether the entry is frozen',
    example: false,
  })
  @IsBoolean()
  isFrozen: boolean;

  @ApiProperty({
    description: 'Date when entry was created',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  createdAt: string;

  @ApiProperty({
    description: 'Date when entry was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  updatedAt: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 1,
      username: 'john_doe',
      avatar: '/avatars/john.jpg',
    },
  })
  user: {
    id: number;
    username: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
  };
}

