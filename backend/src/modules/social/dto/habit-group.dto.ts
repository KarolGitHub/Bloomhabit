import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import {
  GroupPrivacy,
  GroupCategory,
  GroupRole,
} from '../../../database/entities/habit-group.entity';

export class CreateHabitGroupDto {
  @ApiProperty({ description: 'Name of the habit group', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Description of the habit group',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Privacy level of the group',
    enum: GroupPrivacy,
    default: GroupPrivacy.PUBLIC,
  })
  @IsEnum(GroupPrivacy)
  @IsOptional()
  privacy?: GroupPrivacy;

  @ApiProperty({
    description: 'Category of the group',
    enum: GroupCategory,
    default: GroupCategory.OTHER,
  })
  @IsEnum(GroupCategory)
  @IsOptional()
  category?: GroupCategory;

  @ApiProperty({
    description: 'Maximum number of members allowed',
    minimum: 1,
    maximum: 1000,
    default: 100,
  })
  @IsNumber()
  @Min(1)
  @Max(1000)
  @IsOptional()
  maxMembers?: number;

  @ApiProperty({ description: 'Group rules and guidelines', required: false })
  @IsOptional()
  @IsObject()
  rules?: Record<string, any>;

  @ApiProperty({
    description: 'Group settings and preferences',
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateHabitGroupDto {
  @ApiProperty({
    description: 'Name of the habit group',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Description of the habit group',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Privacy level of the group',
    enum: GroupPrivacy,
    required: false,
  })
  @IsOptional()
  @IsEnum(GroupPrivacy)
  privacy?: GroupPrivacy;

  @ApiProperty({
    description: 'Category of the group',
    enum: GroupCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(GroupCategory)
  category?: GroupCategory;

  @ApiProperty({
    description: 'Maximum number of members allowed',
    minimum: 1,
    maximum: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxMembers?: number;

  @ApiProperty({ description: 'Group rules and guidelines', required: false })
  @IsOptional()
  @IsObject()
  rules?: Record<string, any>;

  @ApiProperty({
    description: 'Group settings and preferences',
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiProperty({ description: 'Whether the group is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class GroupMemberResponseDto {
  @ApiProperty({ description: 'Unique identifier for the group member' })
  id: number;

  @ApiProperty({ description: 'User ID of the member' })
  userId: number;

  @ApiProperty({
    description: 'Role of the member in the group',
    enum: GroupRole,
  })
  role: GroupRole;

  @ApiProperty({ description: 'When the member joined the group' })
  joinedAt: Date;

  @ApiProperty({ description: 'Last activity timestamp' })
  lastActivityAt: Date;

  @ApiProperty({ description: 'User information' })
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export class HabitGroupResponseDto {
  @ApiProperty({ description: 'Unique identifier for the habit group' })
  id: number;

  @ApiProperty({ description: 'Name of the habit group' })
  name: string;

  @ApiProperty({ description: 'Description of the habit group' })
  description: string;

  @ApiProperty({
    description: 'Privacy level of the group',
    enum: GroupPrivacy,
  })
  privacy: GroupPrivacy;

  @ApiProperty({ description: 'Category of the group', enum: GroupCategory })
  category: GroupCategory;

  @ApiProperty({ description: 'ID of the group owner' })
  ownerId: number;

  @ApiProperty({ description: 'Maximum number of members allowed' })
  maxMembers: number;

  @ApiProperty({ description: 'Current number of members' })
  currentMembers: number;

  @ApiProperty({ description: 'Group rules and guidelines' })
  rules: Record<string, any>;

  @ApiProperty({ description: 'Group settings and preferences' })
  settings: Record<string, any>;

  @ApiProperty({ description: 'Whether the group is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Last activity timestamp' })
  lastActivityAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Owner user information' })
  owner: {
    id: number;
    username: string;
    avatar?: string;
  };

  @ApiProperty({ description: 'Group members', type: [GroupMemberResponseDto] })
  members: GroupMemberResponseDto[];
}

export class JoinGroupDto {
  @ApiProperty({
    description: 'Message to include with join request',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ description: 'New role for the member', enum: GroupRole })
  @IsEnum(GroupRole)
  role: GroupRole;
}
