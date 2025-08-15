import { ApiProperty } from '@nestjs/swagger';
import {
  FriendshipStatus,
  FriendshipType,
} from '../../../database/entities/friendship.entity';

export class UserSummaryDto {
  @ApiProperty({
    description: 'User ID',
    example: 123,
  })
  id: number;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Fitness enthusiast and meditation practitioner',
    required: false,
  })
  bio?: string;
}

export class FriendshipResponseDto {
  @ApiProperty({
    description: 'Friendship ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User who sent the friend request',
    type: UserSummaryDto,
  })
  requester: UserSummaryDto;

  @ApiProperty({
    description: 'User who received the friend request',
    type: UserSummaryDto,
  })
  addressee: UserSummaryDto;

  @ApiProperty({
    description: 'Current status of the friendship',
    enum: FriendshipStatus,
    example: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;

  @ApiProperty({
    description: 'Type of friendship relationship',
    enum: FriendshipType,
    example: FriendshipType.FRIEND,
  })
  type: FriendshipType;

  @ApiProperty({
    description: 'Message with the friend request',
    example:
      'Hey! I noticed we have similar fitness goals. Would love to connect!',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'When the friendship was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the friendship was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'When the friendship was accepted',
    example: '2024-01-16T14:20:00Z',
    required: false,
  })
  acceptedAt?: Date;
}
