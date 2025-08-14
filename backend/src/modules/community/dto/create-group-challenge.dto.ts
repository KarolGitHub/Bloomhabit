import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChallengeType, ChallengeDifficulty } from '../group-challenge.entity';

export class CreateGroupChallengeDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: ChallengeType })
  @IsEnum(ChallengeType)
  type: ChallengeType;

  @ApiProperty({ enum: ChallengeDifficulty, required: false })
  @IsOptional()
  @IsEnum(ChallengeDifficulty)
  difficulty?: ChallengeDifficulty;

  @ApiProperty()
  @IsNumber()
  communityGardenId: number;

  @ApiProperty()
  @IsNumber()
  targetValue: number;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  rewards?: {
    title: string;
    description: string;
    type: 'badge' | 'points' | 'recognition';
  }[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isTeamChallenge?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxTeamSize?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requiresVerification?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowLateJoins?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
