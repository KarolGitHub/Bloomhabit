import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { FriendshipType } from '../../../database/entities/friendship.entity';

export class CreateFriendshipDto {
  @ApiProperty({
    description: 'ID of the user to send friend request to',
    example: 123,
  })
  @IsNumber()
  addresseeId: number;

  @ApiProperty({
    description: 'Type of friendship relationship',
    enum: FriendshipType,
    example: FriendshipType.FRIEND,
  })
  @IsEnum(FriendshipType)
  @IsOptional()
  type?: FriendshipType;

  @ApiProperty({
    description: 'Optional message with the friend request',
    example:
      'Hey! I noticed we have similar fitness goals. Would love to connect!',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  message?: string;

  @ApiProperty({
    description: 'Additional metadata for the friendship',
    example: { mutualInterests: ['fitness', 'meditation'] },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
