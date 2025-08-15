import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { HabitSharePermission } from '../../../database/entities/habit-share.entity';

export class CreateHabitShareDto {
  @ApiProperty({
    description: 'ID of the habit to share',
    example: 123,
  })
  @IsNumber()
  habitId: number;

  @ApiProperty({
    description: 'ID of the user to share the habit with',
    example: 456,
  })
  @IsNumber()
  sharedWithId: number;

  @ApiProperty({
    description: 'Permission level for the shared habit',
    enum: HabitSharePermission,
    example: HabitSharePermission.VIEW,
    required: false,
  })
  @IsEnum(HabitSharePermission)
  @IsOptional()
  permission?: HabitSharePermission;

  @ApiProperty({
    description: 'Optional message with the habit share',
    example: "Check out this habit I'm working on! Would love your support!",
    maxLength: 500,
    required: false,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  message?: string;

  @ApiProperty({
    description: 'Additional metadata for the habit share',
    example: { allowComments: true, showProgress: true },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
