import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsObject,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import {
  MentorshipStatus,
  MentorshipType,
  MentorshipLevel,
} from '../../../database/entities/mentorship.entity';

export class CreateMentorshipDto {
  @ApiProperty({ description: 'ID of the mentor user' })
  @IsNumber()
  mentorId: number;

  @ApiProperty({ description: 'Type of mentorship', enum: MentorshipType })
  @IsEnum(MentorshipType)
  type: MentorshipType;

  @ApiProperty({
    description: 'Mentorship level',
    enum: MentorshipLevel,
    default: MentorshipLevel.BEGINNER,
  })
  @IsEnum(MentorshipLevel)
  @IsOptional()
  level?: MentorshipLevel;

  @ApiProperty({
    description: 'Description of the mentorship',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Mentorship goals', required: false })
  @IsOptional()
  @IsObject()
  goals?: Record<string, any>;

  @ApiProperty({ description: 'Mentorship expectations', required: false })
  @IsOptional()
  @IsObject()
  expectations?: Record<string, any>;

  @ApiProperty({ description: 'Mentorship schedule', required: false })
  @IsOptional()
  @IsObject()
  schedule?: Record<string, any>;

  @ApiProperty({ description: 'Start date of mentorship', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date of mentorship', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateMentorshipDto {
  @ApiProperty({
    description: 'Type of mentorship',
    enum: MentorshipType,
    required: false,
  })
  @IsOptional()
  @IsEnum(MentorshipType)
  type?: MentorshipType;

  @ApiProperty({
    description: 'Mentorship level',
    enum: MentorshipLevel,
    required: false,
  })
  @IsOptional()
  @IsEnum(MentorshipLevel)
  level?: MentorshipLevel;

  @ApiProperty({
    description: 'Description of the mentorship',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Mentorship goals', required: false })
  @IsOptional()
  @IsObject()
  goals?: Record<string, any>;

  @ApiProperty({ description: 'Mentorship expectations', required: false })
  @IsOptional()
  @IsObject()
  expectations?: Record<string, any>;

  @ApiProperty({ description: 'Mentorship schedule', required: false })
  @IsOptional()
  @IsObject()
  schedule?: Record<string, any>;

  @ApiProperty({ description: 'Start date of mentorship', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date of mentorship', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Status of the mentorship',
    enum: MentorshipStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(MentorshipStatus)
  status?: MentorshipStatus;
}

export class MentorshipResponseDto {
  @ApiProperty({ description: 'Unique identifier for the mentorship' })
  id: number;

  @ApiProperty({ description: 'ID of the mentor user' })
  mentorId: number;

  @ApiProperty({ description: 'ID of the mentee user' })
  menteeId: number;

  @ApiProperty({
    description: 'Status of the mentorship',
    enum: MentorshipStatus,
  })
  status: MentorshipStatus;

  @ApiProperty({ description: 'Type of mentorship', enum: MentorshipType })
  type: MentorshipType;

  @ApiProperty({ description: 'Mentorship level', enum: MentorshipLevel })
  level: MentorshipLevel;

  @ApiProperty({ description: 'Description of the mentorship' })
  description: string;

  @ApiProperty({ description: 'Mentorship goals' })
  goals: Record<string, any>;

  @ApiProperty({ description: 'Mentorship expectations' })
  expectations: Record<string, any>;

  @ApiProperty({ description: 'Mentorship schedule' })
  schedule: Record<string, any>;

  @ApiProperty({ description: 'Start date of mentorship' })
  startDate: Date;

  @ApiProperty({ description: 'End date of mentorship' })
  endDate: Date;

  @ApiProperty({ description: 'Last session timestamp' })
  lastSessionAt: Date;

  @ApiProperty({ description: 'Next session timestamp' })
  nextSessionAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Mentor user information' })
  mentor: {
    id: number;
    username: string;
    avatar?: string;
  };

  @ApiProperty({ description: 'Mentee user information' })
  mentee: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export class CreateMentorshipSessionDto {
  @ApiProperty({ description: 'ID of the mentorship' })
  @IsNumber()
  mentorshipId: number;

  @ApiProperty({ description: 'Scheduled date and time for the session' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({
    description: 'Duration of the session in minutes',
    minimum: 15,
    maximum: 480,
    default: 60,
  })
  @IsNumber()
  @Min(15)
  @Max(480)
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({
    description: 'Session agenda',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  agenda?: string;
}

export class UpdateMentorshipSessionDto {
  @ApiProperty({
    description: 'Scheduled date and time for the session',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({
    description: 'Duration of the session in minutes',
    minimum: 15,
    maximum: 480,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(480)
  durationMinutes?: number;

  @ApiProperty({
    description: 'Session agenda',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  agenda?: string;

  @ApiProperty({
    description: 'Session notes',
    maxLength: 2000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiProperty({ description: 'Session outcomes', required: false })
  @IsOptional()
  @IsObject()
  outcomes?: Record<string, any>;
}

export class MentorshipSessionResponseDto {
  @ApiProperty({ description: 'Unique identifier for the session' })
  id: number;

  @ApiProperty({ description: 'ID of the mentorship' })
  mentorshipId: number;

  @ApiProperty({ description: 'ID of the mentor user' })
  mentorId: number;

  @ApiProperty({ description: 'ID of the mentee user' })
  menteeId: number;

  @ApiProperty({ description: 'Scheduled date and time for the session' })
  scheduledAt: Date;

  @ApiProperty({ description: 'Duration of the session in minutes' })
  durationMinutes: number;

  @ApiProperty({ description: 'Session agenda' })
  agenda: string;

  @ApiProperty({ description: 'Session notes' })
  notes: string;

  @ApiProperty({ description: 'Session outcomes' })
  outcomes: Record<string, any>;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
