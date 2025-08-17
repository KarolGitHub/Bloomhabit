import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsObject,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import {
  ChallengeStatus,
  ChallengeType,
  ChallengeDifficulty,
  ParticipantStatus,
} from '../../../database/entities/social-challenge.entity';

export class CreateSocialChallengeDto {
  @ApiProperty({ description: 'Name of the social challenge', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Description of the challenge',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Type of challenge', enum: ChallengeType })
  @IsEnum(ChallengeType)
  type: ChallengeType;

  @ApiProperty({
    description: 'Difficulty level of the challenge',
    enum: ChallengeDifficulty,
    default: ChallengeDifficulty.MEDIUM,
  })
  @IsEnum(ChallengeDifficulty)
  @IsOptional()
  difficulty?: ChallengeDifficulty;

  @ApiProperty({ description: 'Start date of the challenge' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date of the challenge' })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Maximum number of participants allowed',
    minimum: 1,
    maximum: 10000,
    default: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(10000)
  @IsOptional()
  maxParticipants?: number;

  @ApiProperty({
    description: 'Challenge rules and guidelines',
    required: false,
  })
  @IsOptional()
  @IsObject()
  rules?: Record<string, any>;

  @ApiProperty({ description: 'Challenge rewards and prizes', required: false })
  @IsOptional()
  @IsObject()
  rewards?: Record<string, any>;

  @ApiProperty({
    description: 'Challenge completion criteria',
    required: false,
  })
  @IsOptional()
  @IsObject()
  criteria?: Record<string, any>;

  @ApiProperty({
    description: 'Whether the challenge is public',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({ description: 'Registration deadline', required: false })
  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;
}

export class UpdateSocialChallengeDto {
  @ApiProperty({
    description: 'Name of the social challenge',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Description of the challenge',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Type of challenge',
    enum: ChallengeType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ChallengeType)
  type?: ChallengeType;

  @ApiProperty({
    description: 'Difficulty level of the challenge',
    enum: ChallengeDifficulty,
    required: false,
  })
  @IsOptional()
  @IsEnum(ChallengeDifficulty)
  difficulty?: ChallengeDifficulty;

  @ApiProperty({ description: 'Start date of the challenge', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date of the challenge', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Maximum number of participants allowed',
    minimum: 1,
    maximum: 10000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  maxParticipants?: number;

  @ApiProperty({
    description: 'Challenge rules and guidelines',
    required: false,
  })
  @IsOptional()
  @IsObject()
  rules?: Record<string, any>;

  @ApiProperty({ description: 'Challenge rewards and prizes', required: false })
  @IsOptional()
  @IsObject()
  rewards?: Record<string, any>;

  @ApiProperty({
    description: 'Challenge completion criteria',
    required: false,
  })
  @IsOptional()
  @IsObject()
  criteria?: Record<string, any>;

  @ApiProperty({
    description: 'Whether the challenge is public',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: 'Registration deadline', required: false })
  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;

  @ApiProperty({
    description: 'Status of the challenge',
    enum: ChallengeStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;
}

export class SocialChallengeResponseDto {
  @ApiProperty({ description: 'Unique identifier for the challenge' })
  id: number;

  @ApiProperty({ description: 'Name of the social challenge' })
  name: string;

  @ApiProperty({ description: 'Description of the challenge' })
  description: string;

  @ApiProperty({ description: 'Type of challenge', enum: ChallengeType })
  type: ChallengeType;

  @ApiProperty({
    description: 'Difficulty level of the challenge',
    enum: ChallengeDifficulty,
  })
  difficulty: ChallengeDifficulty;

  @ApiProperty({ description: 'ID of the challenge creator' })
  creatorId: number;

  @ApiProperty({ description: 'Start date of the challenge' })
  startDate: Date;

  @ApiProperty({ description: 'End date of the challenge' })
  endDate: Date;

  @ApiProperty({
    description: 'Status of the challenge',
    enum: ChallengeStatus,
  })
  status: ChallengeStatus;

  @ApiProperty({ description: 'Maximum number of participants allowed' })
  maxParticipants: number;

  @ApiProperty({ description: 'Current number of participants' })
  currentParticipants: number;

  @ApiProperty({ description: 'Challenge rules and guidelines' })
  rules: Record<string, any>;

  @ApiProperty({ description: 'Challenge rewards and prizes' })
  rewards: Record<string, any>;

  @ApiProperty({ description: 'Challenge completion criteria' })
  criteria: Record<string, any>;

  @ApiProperty({ description: 'Whether the challenge is public' })
  isPublic: boolean;

  @ApiProperty({ description: 'Registration deadline' })
  registrationDeadline: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Creator user information' })
  creator: {
    id: number;
    username: string;
    avatar?: string;
  };

  @ApiProperty({
    description: 'Challenge participants',
    type: [ChallengeParticipantResponseDto],
  })
  participants: ChallengeParticipantResponseDto[];
}

export class ChallengeParticipantResponseDto {
  @ApiProperty({ description: 'Unique identifier for the participant' })
  id: number;

  @ApiProperty({ description: 'User ID of the participant' })
  userId: number;

  @ApiProperty({
    description: 'Status of the participant',
    enum: ParticipantStatus,
  })
  status: ParticipantStatus;

  @ApiProperty({ description: 'When the participant joined the challenge' })
  joinedAt: Date;

  @ApiProperty({ description: 'When the participant completed the challenge' })
  completedAt: Date;

  @ApiProperty({ description: 'Participant score' })
  score: number;

  @ApiProperty({ description: 'Progress percentage' })
  progressPercentage: number;

  @ApiProperty({ description: 'Participant achievements' })
  achievements: Record<string, any>;

  @ApiProperty({ description: 'User information' })
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export class JoinChallengeDto {
  @ApiProperty({
    description: 'Message to include with join request',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;
}

export class UpdateParticipantStatusDto {
  @ApiProperty({
    description: 'New status for the participant',
    enum: ParticipantStatus,
  })
  @IsEnum(ParticipantStatus)
  status: ParticipantStatus;

  @ApiProperty({ description: 'Participant score', required: false })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({
    description: 'Progress percentage',
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercentage?: number;
}
