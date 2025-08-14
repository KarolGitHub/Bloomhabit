import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommunityGardenType } from '../community-garden.entity';

export class CreateCommunityGardenDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: CommunityGardenType, required: false })
  @IsOptional()
  @IsEnum(CommunityGardenType)
  type?: CommunityGardenType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxMembers?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowGuestViewing?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  theme?: string;
}
