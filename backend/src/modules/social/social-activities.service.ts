import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SocialActivity,
  ActivityType,
  ActivityStatus,
} from '../../database/entities/social-activity.entity';
import { User } from '../../database/entities/user.entity';
import { Habit } from '../../database/entities/habit.entity';
import { HabitLog } from '../../database/entities/habit-log.entity';
import { CreateSocialActivityDto } from './dto/create-social-activity.dto';

@Injectable()
export class SocialActivitiesService {
  constructor(
    @InjectRepository(SocialActivity)
    private readonly socialActivityRepository: Repository<SocialActivity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Habit)
    private readonly habitRepository: Repository<Habit>,
    @InjectRepository(HabitLog)
    private readonly habitLogRepository: Repository<HabitLog>
  ) {}

  async create(
    userId: number,
    createSocialActivityDto: CreateSocialActivityDto
  ): Promise<SocialActivity> {
    const { type, targetType, targetId, content, metadata } =
      createSocialActivityDto;

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if target exists based on targetType
    let targetExists = false;
    switch (targetType) {
      case 'habit':
        targetExists =
          (await this.habitRepository.findOne({ where: { id: targetId } })) !==
          null;
        break;
      case 'habit_log':
        targetExists =
          (await this.habitLogRepository.findOne({
            where: { id: targetId },
          })) !== null;
        break;
      default:
        throw new BadRequestException('Invalid target type');
    }

    if (!targetExists) {
      throw new NotFoundException('Target not found');
    }

    // Check if activity already exists (for likes, supports, etc.)
    if (type === ActivityType.LIKE || type === ActivityType.SUPPORT) {
      const existingActivity = await this.socialActivityRepository.findOne({
        where: { userId, type, targetType, targetId },
      });

      if (existingActivity) {
        if (existingActivity.status === ActivityStatus.ACTIVE) {
          throw new ConflictException('Activity already exists');
        } else {
          // Reactivate archived activity
          existingActivity.status = ActivityStatus.ACTIVE;
          existingActivity.metadata = {
            ...existingActivity.metadata,
            ...metadata,
          };
          existingActivity.lastInteractionAt = new Date();
          return await this.socialActivityRepository.save(existingActivity);
        }
      }
    }

    // Create new social activity
    const socialActivity = this.socialActivityRepository.create({
      userId,
      type,
      targetType,
      targetId,
      content,
      metadata,
      lastInteractionAt: new Date(),
    });

    return await this.socialActivityRepository.save(socialActivity);
  }

  async findAll(userId: number): Promise<SocialActivity[]> {
    return await this.socialActivityRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTarget(
    targetType: string,
    targetId: number
  ): Promise<SocialActivity[]> {
    return await this.socialActivityRepository.find({
      where: { targetType, targetId, status: ActivityStatus.ACTIVE },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async findLikesByTarget(
    targetType: string,
    targetId: number
  ): Promise<SocialActivity[]> {
    return await this.socialActivityRepository.find({
      where: {
        targetType,
        targetId,
        type: ActivityType.LIKE,
        status: ActivityStatus.ACTIVE,
      },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async findCommentsByTarget(
    targetType: string,
    targetId: number
  ): Promise<SocialActivity[]> {
    return await this.socialActivityRepository.find({
      where: {
        targetType,
        targetId,
        type: ActivityType.COMMENT,
        status: ActivityStatus.ACTIVE,
      },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<SocialActivity> {
    const socialActivity = await this.socialActivityRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!socialActivity) {
      throw new NotFoundException('Social activity not found');
    }

    return socialActivity;
  }

  async update(
    id: number,
    userId: number,
    updates: Partial<SocialActivity>
  ): Promise<SocialActivity> {
    const socialActivity = await this.socialActivityRepository.findOne({
      where: { id },
    });

    if (!socialActivity) {
      throw new NotFoundException('Social activity not found');
    }

    // Only the creator can update the activity
    if (socialActivity.userId !== userId) {
      throw new BadRequestException(
        'Only the creator can update this activity'
      );
    }

    // Only allow certain fields to be updated
    if (updates.content !== undefined) {
      socialActivity.content = updates.content;
    }
    if (updates.metadata !== undefined) {
      socialActivity.metadata = {
        ...socialActivity.metadata,
        ...updates.metadata,
      };
    }

    socialActivity.lastInteractionAt = new Date();
    return await this.socialActivityRepository.save(socialActivity);
  }

  async remove(id: number, userId: number): Promise<void> {
    const socialActivity = await this.socialActivityRepository.findOne({
      where: { id },
    });

    if (!socialActivity) {
      throw new NotFoundException('Social activity not found');
    }

    // Only the creator can remove the activity
    if (socialActivity.userId !== userId) {
      throw new BadRequestException(
        'Only the creator can remove this activity'
      );
    }

    await this.socialActivityRepository.remove(socialActivity);
  }

  async toggleLike(
    userId: number,
    targetType: string,
    targetId: number
  ): Promise<{ liked: boolean; activity?: SocialActivity }> {
    const existingLike = await this.socialActivityRepository.findOne({
      where: { userId, type: ActivityType.LIKE, targetType, targetId },
    });

    if (existingLike) {
      if (existingLike.status === ActivityStatus.ACTIVE) {
        // Unlike - archive the activity
        existingLike.status = ActivityStatus.ARCHIVED;
        await this.socialActivityRepository.save(existingLike);
        return { liked: false };
      } else {
        // Relike - reactivate the activity
        existingLike.status = ActivityStatus.ACTIVE;
        existingLike.lastInteractionAt = new Date();
        const reactivatedLike =
          await this.socialActivityRepository.save(existingLike);
        return { liked: true, activity: reactivatedLike };
      }
    } else {
      // Create new like
      const newLike = this.socialActivityRepository.create({
        userId,
        type: ActivityType.LIKE,
        targetType,
        targetId,
        lastInteractionAt: new Date(),
      });
      const savedLike = await this.socialActivityRepository.save(newLike);
      return { liked: true, activity: savedLike };
    }
  }

  async addComment(
    userId: number,
    targetType: string,
    targetId: number,
    content: string
  ): Promise<SocialActivity> {
    const comment = this.socialActivityRepository.create({
      userId,
      type: ActivityType.COMMENT,
      targetType,
      targetId,
      content,
      lastInteractionAt: new Date(),
    });

    return await this.socialActivityRepository.save(comment);
  }

  async addSupport(
    userId: number,
    targetType: string,
    targetId: number,
    message?: string
  ): Promise<SocialActivity> {
    const support = this.socialActivityRepository.create({
      userId,
      type: ActivityType.SUPPORT,
      targetType,
      targetId,
      content: message,
      lastInteractionAt: new Date(),
    });

    return await this.socialActivityRepository.save(support);
  }

  async addCheer(
    userId: number,
    targetType: string,
    targetId: number,
    emoji?: string
  ): Promise<SocialActivity> {
    const cheer = this.socialActivityRepository.create({
      userId,
      type: ActivityType.CHEER,
      targetType,
      targetId,
      metadata: { emoji: emoji || '🎉' },
      lastInteractionAt: new Date(),
    });

    return await this.socialActivityRepository.save(cheer);
  }

  async getActivityStats(
    targetType: string,
    targetId: number
  ): Promise<{
    likes: number;
    comments: number;
    supports: number;
    cheers: number;
  }> {
    const [likes, comments, supports, cheers] = await Promise.all([
      this.socialActivityRepository.count({
        where: {
          targetType,
          targetId,
          type: ActivityType.LIKE,
          status: ActivityStatus.ACTIVE,
        },
      }),
      this.socialActivityRepository.count({
        where: {
          targetType,
          targetId,
          type: ActivityType.COMMENT,
          status: ActivityStatus.ACTIVE,
        },
      }),
      this.socialActivityRepository.count({
        where: {
          targetType,
          targetId,
          type: ActivityType.SUPPORT,
          status: ActivityStatus.ACTIVE,
        },
      }),
      this.socialActivityRepository.count({
        where: {
          targetType,
          targetId,
          type: ActivityType.CHEER,
          status: ActivityStatus.ACTIVE,
        },
      }),
    ]);

    return { likes, comments, supports, cheers };
  }

  async getUserActivityFeed(
    userId: number,
    limit: number = 20
  ): Promise<SocialActivity[]> {
    return await this.socialActivityRepository.find({
      where: { userId, status: ActivityStatus.ACTIVE },
      relations: ['user'],
      order: { lastInteractionAt: 'DESC' },
      take: limit,
    });
  }

  async getTargetActivityFeed(
    targetType: string,
    targetId: number,
    limit: number = 20
  ): Promise<SocialActivity[]> {
    return await this.socialActivityRepository.find({
      where: { targetType, targetId, status: ActivityStatus.ACTIVE },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async markMilestone(
    userId: number,
    targetType: string,
    targetId: number,
    milestone: string
  ): Promise<SocialActivity> {
    const milestoneActivity = this.socialActivityRepository.create({
      userId,
      type: ActivityType.MILESTONE,
      targetType,
      targetId,
      content: milestone,
      metadata: { milestoneType: milestone },
      lastInteractionAt: new Date(),
    });

    return await this.socialActivityRepository.save(milestoneActivity);
  }

  async markStreak(
    userId: number,
    targetType: string,
    targetId: number,
    streakCount: number
  ): Promise<SocialActivity> {
    const streakActivity = this.socialActivityRepository.create({
      userId,
      type: ActivityType.STREAK,
      targetType,
      targetId,
      content: `Achieved ${streakCount} day streak!`,
      metadata: { streakCount },
      lastInteractionAt: new Date(),
    });

    return await this.socialActivityRepository.save(streakActivity);
  }

  async markGoalAchievement(
    userId: number,
    targetType: string,
    targetId: number,
    goal: string
  ): Promise<SocialActivity> {
    const achievementActivity = this.socialActivityRepository.create({
      userId,
      type: ActivityType.GOAL_ACHIEVEMENT,
      targetType,
      targetId,
      content: `Achieved goal: ${goal}`,
      metadata: { goal },
      lastInteractionAt: new Date(),
    });

    return await this.socialActivityRepository.save(achievementActivity);
  }
}
