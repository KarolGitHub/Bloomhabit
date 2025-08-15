import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Friendship,
  FriendshipStatus,
  FriendshipType,
} from '../../database/entities/friendship.entity';
import { User } from '../../database/entities/user.entity';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import {
  FriendshipResponseDto,
  UserSummaryDto,
} from './dto/friendship-response.dto';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(
    requesterId: number,
    createFriendshipDto: CreateFriendshipDto
  ): Promise<FriendshipResponseDto> {
    const { addresseeId, type, message, metadata } = createFriendshipDto;

    // Check if users exist
    const addressee = await this.userRepository.findOne({
      where: { id: addresseeId },
    });
    if (!addressee) {
      throw new NotFoundException('User not found');
    }

    // Prevent self-friending
    if (requesterId === addresseeId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Check if friendship already exists
    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        throw new ConflictException('Friendship already exists');
      } else if (existingFriendship.status === FriendshipStatus.PENDING) {
        if (existingFriendship.requesterId === requesterId) {
          throw new ConflictException('Friend request already sent');
        } else {
          throw new ConflictException(
            'Friend request already received from this user'
          );
        }
      } else if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        throw new ConflictException(
          'Cannot send friend request to blocked user'
        );
      }
    }

    // Create new friendship
    const friendship = this.friendshipRepository.create({
      requesterId,
      addresseeId,
      type: type || FriendshipType.FRIEND,
      message,
      metadata,
    });

    const savedFriendship = await this.friendshipRepository.save(friendship);
    return this.mapToResponseDto(savedFriendship);
  }

  async findAll(userId: number): Promise<FriendshipResponseDto[]> {
    const friendships = await this.friendshipRepository.find({
      where: [{ requesterId: userId }, { addresseeId: userId }],
      relations: ['requester', 'addressee'],
      order: { updatedAt: 'DESC' },
    });

    return friendships.map((friendship) => this.mapToResponseDto(friendship));
  }

  async findFriends(userId: number): Promise<FriendshipResponseDto[]> {
    const friendships = await this.friendshipRepository.find({
      where: [
        { requesterId: userId, status: FriendshipStatus.ACCEPTED },
        { addresseeId: userId, status: FriendshipStatus.ACCEPTED },
      ],
      relations: ['requester', 'addressee'],
      order: { updatedAt: 'DESC' },
    });

    return friendships.map((friendship) => this.mapToResponseDto(friendship));
  }

  async findPendingRequests(userId: number): Promise<FriendshipResponseDto[]> {
    const friendships = await this.friendshipRepository.find({
      where: { addresseeId: userId, status: FriendshipStatus.PENDING },
      relations: ['requester', 'addressee'],
      order: { createdAt: 'DESC' },
    });

    return friendships.map((friendship) => this.mapToResponseDto(friendship));
  }

  async findSentRequests(userId: number): Promise<FriendshipResponseDto[]> {
    const friendships = await this.friendshipRepository.find({
      where: { requesterId: userId, status: FriendshipStatus.PENDING },
      relations: ['requester', 'addressee'],
      order: { createdAt: 'DESC' },
    });

    return friendships.map((friendship) => this.mapToResponseDto(friendship));
  }

  async findOne(id: number, userId: number): Promise<FriendshipResponseDto> {
    const friendship = await this.friendshipRepository.findOne({
      where: { id },
      relations: ['requester', 'addressee'],
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    // Check if user is part of this friendship
    if (
      friendship.requesterId !== userId &&
      friendship.addresseeId !== userId
    ) {
      throw new NotFoundException('Friendship not found');
    }

    return this.mapToResponseDto(friendship);
  }

  async update(
    id: number,
    updateFriendshipDto: UpdateFriendshipDto,
    userId: number
  ): Promise<FriendshipResponseDto> {
    const friendship = await this.friendshipRepository.findOne({
      where: { id },
      relations: ['requester', 'addressee'],
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    // Only the addressee can update the friendship status
    if (friendship.addresseeId !== userId) {
      throw new BadRequestException(
        'Only the recipient can update friendship status'
      );
    }

    // Update status
    if (updateFriendshipDto.status) {
      if (updateFriendshipDto.status === FriendshipStatus.ACCEPTED) {
        friendship.acceptedAt = new Date();
      } else if (updateFriendshipDto.status === FriendshipStatus.BLOCKED) {
        friendship.blockedAt = new Date();
      }
      friendship.status = updateFriendshipDto.status;
    }

    // Update other fields
    if (updateFriendshipDto.type) {
      friendship.type = updateFriendshipDto.type;
    }
    if (updateFriendshipDto.metadata) {
      friendship.metadata = {
        ...friendship.metadata,
        ...updateFriendshipDto.metadata,
      };
    }

    const updatedFriendship = await this.friendshipRepository.save(friendship);
    return this.mapToResponseDto(updatedFriendship);
  }

  async remove(id: number, userId: number): Promise<void> {
    const friendship = await this.friendshipRepository.findOne({
      where: { id },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    // Check if user is part of this friendship
    if (
      friendship.requesterId !== userId &&
      friendship.addresseeId !== userId
    ) {
      throw new NotFoundException('Friendship not found');
    }

    await this.friendshipRepository.remove(friendship);
  }

  async blockUser(userId: number, targetUserId: number): Promise<void> {
    // Check if friendship exists
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { requesterId: userId, addresseeId: targetUserId },
        { requesterId: targetUserId, addresseeId: userId },
      ],
    });

    if (friendship) {
      // Update existing friendship
      friendship.status = FriendshipStatus.BLOCKED;
      friendship.blockedAt = new Date();
      await this.friendshipRepository.save(friendship);
    } else {
      // Create new blocked friendship
      const blockedFriendship = this.friendshipRepository.create({
        requesterId: userId,
        addresseeId: targetUserId,
        status: FriendshipStatus.BLOCKED,
        blockedAt: new Date(),
      });
      await this.friendshipRepository.save(blockedFriendship);
    }
  }

  async unblockUser(userId: number, targetUserId: number): Promise<void> {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { requesterId: userId, addresseeId: targetUserId },
        { requesterId: targetUserId, addresseeId: userId },
      ],
    });

    if (friendship && friendship.status === FriendshipStatus.BLOCKED) {
      await this.friendshipRepository.remove(friendship);
    }
  }

  async getMutualFriends(
    userId1: number,
    userId2: number
  ): Promise<UserSummaryDto[]> {
    // Get friends of both users
    const user1Friends = await this.friendshipRepository.find({
      where: [
        { requesterId: userId1, status: FriendshipStatus.ACCEPTED },
        { addresseeId: userId1, status: FriendshipStatus.ACCEPTED },
      ],
    });

    const user2Friends = await this.friendshipRepository.find({
      where: [
        { requesterId: userId2, status: FriendshipStatus.ACCEPTED },
        { addresseeId: userId2, status: FriendshipStatus.ACCEPTED },
      ],
    });

    // Extract friend IDs
    const user1FriendIds = user1Friends.map((f) =>
      f.requesterId === userId1 ? f.addresseeId : f.requesterId
    );
    const user2FriendIds = user2Friends.map((f) =>
      f.requesterId === userId2 ? f.addresseeId : f.requesterId
    );

    // Find mutual friends
    const mutualFriendIds = user1FriendIds.filter((id) =>
      user2FriendIds.includes(id)
    );

    if (mutualFriendIds.length === 0) {
      return [];
    }

    // Get user details for mutual friends
    const mutualFriends = await this.userRepository.find({
      where: { id: In(mutualFriendIds) },
      select: ['id', 'username', 'firstName', 'lastName', 'avatar', 'bio'],
    });

    return mutualFriends.map((user) => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      bio: user.bio,
    }));
  }

  async searchUsers(
    query: string,
    userId: number,
    limit: number = 10
  ): Promise<UserSummaryDto[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :userId', { userId })
      .andWhere(
        '(user.username ILIKE :query OR user.firstName ILIKE :query OR user.lastName ILIKE :query)',
        { query: `%${query}%` }
      )
      .select([
        'user.id',
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.avatar',
        'user.bio',
      ])
      .limit(limit)
      .getMany();

    return users;
  }

  private mapToResponseDto(friendship: Friendship): FriendshipResponseDto {
    const requester = friendship.requester;
    const addressee = friendship.addressee;

    return {
      id: friendship.id,
      requester: {
        id: requester.id,
        username: requester.username,
        firstName: requester.firstName,
        lastName: requester.lastName,
        avatar: requester.avatar,
        bio: requester.bio,
      },
      addressee: {
        id: addressee.id,
        username: addressee.username,
        firstName: addressee.firstName,
        lastName: addressee.lastName,
        avatar: addressee.avatar,
        bio: addressee.bio,
      },
      status: friendship.status,
      type: friendship.type,
      message: friendship.message,
      createdAt: friendship.createdAt,
      updatedAt: friendship.updatedAt,
      acceptedAt: friendship.acceptedAt,
    };
  }
}
