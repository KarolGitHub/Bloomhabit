import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  HabitShare,
  HabitShareStatus,
  HabitSharePermission,
} from '../../database/entities/habit-share.entity';
import { Habit } from '../../database/entities/habit.entity';
import { User } from '../../database/entities/user.entity';
import { CreateHabitShareDto } from './dto/create-habit-share.dto';

@Injectable()
export class HabitSharesService {
  constructor(
    @InjectRepository(HabitShare)
    private readonly habitShareRepository: Repository<HabitShare>,
    @InjectRepository(Habit)
    private readonly habitRepository: Repository<Habit>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(
    sharedById: number,
    createHabitShareDto: CreateHabitShareDto
  ): Promise<HabitShare> {
    const { habitId, sharedWithId, permission, message, metadata } =
      createHabitShareDto;

    // Check if habit exists and belongs to the user
    const habit = await this.habitRepository.findOne({
      where: { id: habitId, userId: sharedById },
    });
    if (!habit) {
      throw new NotFoundException('Habit not found or access denied');
    }

    // Check if user exists
    const sharedWith = await this.userRepository.findOne({
      where: { id: sharedWithId },
    });
    if (!sharedWith) {
      throw new NotFoundException('User not found');
    }

    // Prevent self-sharing
    if (sharedById === sharedWithId) {
      throw new BadRequestException('Cannot share habit with yourself');
    }

    // Check if habit is already shared with this user
    const existingShare = await this.habitShareRepository.findOne({
      where: { habitId, sharedWithId },
    });

    if (existingShare) {
      if (existingShare.status === HabitShareStatus.ACTIVE) {
        throw new ConflictException('Habit already shared with this user');
      } else if (existingShare.status === HabitShareStatus.ARCHIVED) {
        // Reactivate archived share
        existingShare.status = HabitShareStatus.ACTIVE;
        existingShare.permission = permission || existingShare.permission;
        existingShare.message = message || existingShare.message;
        existingShare.metadata = { ...existingShare.metadata, ...metadata };
        existingShare.sharedAt = new Date();
        return await this.habitShareRepository.save(existingShare);
      }
    }

    // Create new habit share
    const habitShare = this.habitShareRepository.create({
      habitId,
      sharedById,
      sharedWithId,
      permission: permission || HabitSharePermission.VIEW,
      message,
      metadata,
      sharedAt: new Date(),
    });

    return await this.habitShareRepository.save(habitShare);
  }

  async findAll(userId: number): Promise<HabitShare[]> {
    return await this.habitShareRepository.find({
      where: [{ sharedById: userId }, { sharedWithId: userId }],
      relations: ['habit', 'sharedBy', 'sharedWith'],
      order: { sharedAt: 'DESC' },
    });
  }

  async findSharedWithMe(userId: number): Promise<HabitShare[]> {
    return await this.habitShareRepository.find({
      where: { sharedWithId: userId, status: HabitShareStatus.ACTIVE },
      relations: ['habit', 'sharedBy'],
      order: { sharedAt: 'DESC' },
    });
  }

  async findSharedByMe(userId: number): Promise<HabitShare[]> {
    return await this.habitShareRepository.find({
      where: { sharedById: userId },
      relations: ['habit', 'sharedWith'],
      order: { sharedAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<HabitShare> {
    const habitShare = await this.habitShareRepository.findOne({
      where: { id },
      relations: ['habit', 'sharedBy', 'sharedWith'],
    });

    if (!habitShare) {
      throw new NotFoundException('Habit share not found');
    }

    // Check if user has access to this share
    if (
      habitShare.sharedById !== userId &&
      habitShare.sharedWithId !== userId
    ) {
      throw new NotFoundException('Habit share not found');
    }

    return habitShare;
  }

  async updateStatus(
    id: number,
    status: HabitShareStatus,
    userId: number
  ): Promise<HabitShare> {
    const habitShare = await this.habitShareRepository.findOne({
      where: { id },
    });

    if (!habitShare) {
      throw new NotFoundException('Habit share not found');
    }

    // Only the owner can update the status
    if (habitShare.sharedById !== userId) {
      throw new BadRequestException(
        'Only the owner can update habit share status'
      );
    }

    habitShare.status = status;
    return await this.habitShareRepository.save(habitShare);
  }

  async updatePermission(
    id: number,
    permission: HabitSharePermission,
    userId: number
  ): Promise<HabitShare> {
    const habitShare = await this.habitShareRepository.findOne({
      where: { id },
    });

    if (!habitShare) {
      throw new NotFoundException('Habit share not found');
    }

    // Only the owner can update permissions
    if (habitShare.sharedById !== userId) {
      throw new BadRequestException(
        'Only the owner can update habit share permissions'
      );
    }

    habitShare.permission = permission;
    return await this.habitShareRepository.save(habitShare);
  }

  async remove(id: number, userId: number): Promise<void> {
    const habitShare = await this.habitShareRepository.findOne({
      where: { id },
    });

    if (!habitShare) {
      throw new NotFoundException('Habit share not found');
    }

    // Only the owner can remove the share
    if (habitShare.sharedById !== userId) {
      throw new BadRequestException('Only the owner can remove habit share');
    }

    await this.habitShareRepository.remove(habitShare);
  }

  async markAsViewed(id: number, userId: number): Promise<void> {
    const habitShare = await this.habitShareRepository.findOne({
      where: { id, sharedWithId: userId },
    });

    if (!habitShare) {
      throw new NotFoundException('Habit share not found');
    }

    habitShare.lastViewedAt = new Date();
    await this.habitShareRepository.save(habitShare);
  }

  async getSharedHabitStats(userId: number): Promise<{
    sharedWithOthers: number;
    sharedWithMe: number;
    totalViews: number;
    totalInteractions: number;
  }> {
    const [sharedWithOthers, sharedWithMe] = await Promise.all([
      this.habitShareRepository.count({
        where: { sharedById: userId, status: HabitShareStatus.ACTIVE },
      }),
      this.habitShareRepository.count({
        where: { sharedWithId: userId, status: HabitShareStatus.ACTIVE },
      }),
    ]);

    const totalViews = await this.habitShareRepository
      .createQueryBuilder('hs')
      .where('hs.sharedById = :userId', { userId })
      .andWhere('hs.lastViewedAt IS NOT NULL')
      .getCount();

    const totalInteractions = await this.habitShareRepository
      .createQueryBuilder('hs')
      .where('hs.sharedById = :userId', { userId })
      .andWhere('hs.lastInteractionAt IS NOT NULL')
      .getCount();

    return {
      sharedWithOthers,
      sharedWithMe,
      totalViews,
      totalInteractions,
    };
  }

  async findHabitsSharedWithUser(
    userId: number,
    limit: number = 20
  ): Promise<HabitShare[]> {
    return await this.habitShareRepository.find({
      where: { sharedWithId: userId, status: HabitShareStatus.ACTIVE },
      relations: ['habit', 'sharedBy'],
      order: { lastViewedAt: 'ASC', sharedAt: 'DESC' },
      take: limit,
    });
  }

  async findPopularSharedHabits(limit: number = 10): Promise<
    {
      habitId: number;
      habitTitle: string;
      shareCount: number;
      totalViews: number;
    }[]
  > {
    const result = await this.habitShareRepository
      .createQueryBuilder('hs')
      .leftJoin('hs.habit', 'h')
      .select([
        'h.id as habitId',
        'h.title as habitTitle',
        'COUNT(hs.id) as shareCount',
        'COUNT(hs.lastViewedAt) as totalViews',
      ])
      .where('hs.status = :status', { status: HabitShareStatus.ACTIVE })
      .groupBy('h.id, h.title')
      .orderBy('shareCount', 'DESC')
      .addOrderBy('totalViews', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((item) => ({
      habitId: parseInt(item.habitId),
      habitTitle: item.habitTitle,
      shareCount: parseInt(item.shareCount),
      totalViews: parseInt(item.totalViews),
    }));
  }
}
