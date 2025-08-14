import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import {
  CommunityGarden,
  CommunityGardenType,
  CommunityGardenStatus,
} from './community-garden.entity';
import { User } from '../../database/entities/user.entity';
import { CreateCommunityGardenDto } from './dto/create-community-garden.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommunityGardensService {
  constructor(
    @InjectRepository(CommunityGarden)
    private communityGardensRepository: Repository<CommunityGarden>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationsService: NotificationsService
  ) {}

  async create(
    userId: number,
    createCommunityGardenDto: CreateCommunityGardenDto
  ): Promise<CommunityGarden> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const garden = this.communityGardensRepository.create({
      ...createCommunityGardenDto,
      ownerId: userId,
      memberCount: 1, // Owner is automatically a member
    });

    const savedGarden = await this.communityGardensRepository.save(garden);

    // Add owner as member
    await this.addMember(savedGarden.id, userId, userId);

    return savedGarden;
  }

  async findAll(
    userId?: number,
    filters?: {
      type?: CommunityGardenType;
      tags?: string[];
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ gardens: CommunityGarden[]; total: number }> {
    const queryBuilder = this.communityGardensRepository
      .createQueryBuilder('garden')
      .leftJoinAndSelect('garden.owner', 'owner')
      .leftJoinAndSelect('garden.members', 'members')
      .where('garden.status = :status', {
        status: CommunityGardenStatus.ACTIVE,
      });

    // Apply filters
    if (filters?.type) {
      queryBuilder.andWhere('garden.type = :type', { type: filters.type });
    }

    if (filters?.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('garden.tags && :tags', { tags: filters.tags });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(garden.name ILIKE :search OR garden.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Handle visibility based on user and garden type
    if (userId) {
      queryBuilder.andWhere(
        '(garden.type = :publicType OR garden.ownerId = :userId OR members.id = :userId)',
        { publicType: CommunityGardenType.PUBLIC, userId }
      );
    } else {
      queryBuilder.andWhere('garden.allowGuestViewing = :allowGuest', {
        allowGuest: true,
      });
    }

    const total = await queryBuilder.getCount();

    // Apply pagination
    if (filters?.limit) {
      queryBuilder.limit(filters.limit);
    }
    if (filters?.offset) {
      queryBuilder.offset(filters.offset);
    }

    const gardens = await queryBuilder
      .orderBy('garden.createdAt', 'DESC')
      .getMany();

    return { gardens, total };
  }

  async findOne(id: number, userId?: number): Promise<CommunityGarden> {
    const garden = await this.communityGardensRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'habits'],
    });

    if (!garden) {
      throw new NotFoundException('Community garden not found');
    }

    // Check access permissions
    if (garden.type === CommunityGardenType.PRIVATE) {
      if (
        !userId ||
        (garden.ownerId !== userId &&
          !garden.members.some((m) => m.id === userId))
      ) {
        throw new ForbiddenException('Access denied to private garden');
      }
    }

    return garden;
  }

  async update(
    id: number,
    userId: number,
    updateData: Partial<CreateCommunityGardenDto>
  ): Promise<CommunityGarden> {
    const garden = await this.findOne(id, userId);

    if (garden.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the garden owner can update the garden'
      );
    }

    Object.assign(garden, updateData);
    return this.communityGardensRepository.save(garden);
  }

  async remove(id: number, userId: number): Promise<void> {
    const garden = await this.findOne(id, userId);

    if (garden.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the garden owner can delete the garden'
      );
    }

    garden.status = CommunityGardenStatus.ARCHIVED;
    await this.communityGardensRepository.save(garden);
  }

  async addMember(
    gardenId: number,
    userId: number,
    addedByUserId: number
  ): Promise<void> {
    const garden = await this.findOne(gardenId, addedByUserId);
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member
    if (garden.members.some((m) => m.id === userId)) {
      throw new ConflictException('User is already a member of this garden');
    }

    // Check member limit
    if (garden.maxMembers && garden.memberCount >= garden.maxMembers) {
      throw new ConflictException('Garden has reached maximum member limit');
    }

    // Add user to members
    garden.members.push(user);
    garden.memberCount = garden.members.length;

    await this.communityGardensRepository.save(garden);

    // Send notification to new member
    await this.notificationsService.create(userId, {
      type: 'friend_activity',
      title: 'Welcome to the Garden! 🌱',
      message: `You've been added to "${garden.name}" community garden. Start growing together!`,
      data: { gardenId: garden.id, gardenName: garden.name },
      priority: 'medium',
    });
  }

  async removeMember(
    gardenId: number,
    userId: number,
    removedByUserId: number
  ): Promise<void> {
    const garden = await this.findOne(gardenId, removedByUserId);

    if (garden.ownerId !== removedByUserId && removedByUserId !== userId) {
      throw new ForbiddenException(
        'Only the garden owner or the user themselves can remove members'
      );
    }

    if (garden.ownerId === userId) {
      throw new ForbiddenException('Cannot remove the garden owner');
    }

    garden.members = garden.members.filter((m) => m.id !== userId);
    garden.memberCount = garden.members.length;

    await this.communityGardensRepository.save(garden);

    // Send notification to removed member
    await this.notificationsService.create(userId, {
      type: 'friend_activity',
      title: 'Garden Membership Ended',
      message: `You've been removed from "${garden.name}" community garden.`,
      data: { gardenId: garden.id, gardenName: garden.name },
      priority: 'low',
    });
  }

  async joinGarden(gardenId: number, userId: number): Promise<void> {
    const garden = await this.findOne(gardenId, userId);

    if (garden.type === CommunityGardenType.INVITE_ONLY) {
      throw new ForbiddenException(
        'This garden requires an invitation to join'
      );
    }

    if (garden.requiresApproval) {
      // Create a join request (this would need a separate entity)
      throw new ForbiddenException(
        'This garden requires approval to join. Please contact the garden owner.'
      );
    }

    await this.addMember(gardenId, userId, userId);
  }

  async leaveGarden(gardenId: number, userId: number): Promise<void> {
    await this.removeMember(gardenId, userId, userId);
  }

  async getGardenStats(
    gardenId: number,
    userId: number
  ): Promise<{
    totalMembers: number;
    activeMembers: number;
    totalHabits: number;
    totalStreak: number;
    recentActivity: any[];
  }> {
    const garden = await this.findOne(gardenId, userId);

    // Calculate active members (users with activity in last 7 days)
    const activeMembers = garden.members.filter((member) => {
      // This would need to be implemented with actual activity tracking
      return true; // Placeholder
    }).length;

    const stats = {
      totalMembers: garden.memberCount,
      activeMembers,
      totalHabits: garden.habits?.length || 0,
      totalStreak: garden.totalStreak,
      recentActivity: [], // This would need to be implemented
    };

    return stats;
  }

  async searchGardens(
    query: string,
    filters?: {
      type?: CommunityGardenType;
      tags?: string[];
      limit?: number;
      offset?: number;
    }
  ): Promise<{ gardens: CommunityGarden[]; total: number }> {
    return this.findAll(undefined, {
      search: query,
      ...filters,
    });
  }

  async getPopularGardens(limit: number = 10): Promise<CommunityGarden[]> {
    return this.communityGardensRepository
      .createQueryBuilder('garden')
      .leftJoinAndSelect('garden.owner', 'owner')
      .where('garden.status = :status', {
        status: CommunityGardenStatus.ACTIVE,
      })
      .orderBy('garden.memberCount', 'DESC')
      .addOrderBy('garden.totalStreak', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getUserGardens(userId: number): Promise<CommunityGarden[]> {
    return this.communityGardensRepository
      .createQueryBuilder('garden')
      .leftJoinAndSelect('garden.owner', 'owner')
      .leftJoinAndSelect('garden.members', 'members')
      .where('garden.ownerId = :userId', { userId })
      .orWhere('members.id = :userId', { userId })
      .andWhere('garden.status = :status', {
        status: CommunityGardenStatus.ACTIVE,
      })
      .orderBy('garden.updatedAt', 'DESC')
      .getMany();
  }
}
