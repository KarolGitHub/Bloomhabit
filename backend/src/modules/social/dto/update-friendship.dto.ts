import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import {
  FriendshipStatus,
  FriendshipType,
} from '../../../database/entities/friendship.entity';

export class UpdateFriendshipDto {
  @ApiProperty({
    description: 'New status of the friendship',
    enum: FriendshipStatus,
    example: FriendshipStatus.ACCEPTED,
    required: false,
  })
  @IsEnum(FriendshipStatus)
  @IsOptional()
  status?: FriendshipStatus;

  @ApiProperty({
    description: 'Type of friendship relationship',
    enum: FriendshipType,
    example: FriendshipType.FAMILY,
    required: false,
  })
  @IsEnum(FriendshipType)
  @IsOptional()
  type?: FriendshipType;

  @ApiProperty({
    description: 'Additional metadata for the friendship',
    example: { mutualInterests: ['fitness', 'meditation'] },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
