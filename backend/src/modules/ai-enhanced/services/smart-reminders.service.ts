import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SmartReminder } from '../../../database/entities/smart-reminder.entity';
import { User } from '../../../database/entities/user.entity';
import { Habit } from '../../../database/entities/habit.entity';
import { Goal } from '../../../database/entities/goal.entity';
import {
  CreateSmartReminderDto,
  UpdateSmartReminderDto,
  SmartReminderDto,
  ReminderOptimizationDto,
  ReminderType,
  ReminderFrequency,
  ReminderStatus,
  ReminderPriority,
} from '../dto/smart-reminders.dto';

@Injectable()
export class SmartRemindersService {
  constructor(
    @InjectRepository(SmartReminder)
    private smartReminderRepository: Repository<SmartReminder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Habit)
    private habitRepository: Repository<Habit>,
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>
  ) {}

  async createSmartReminder(
    userId: string,
    createDto: CreateSmartReminderDto
  ): Promise<SmartReminderDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate related entities if provided
    if (createDto.habitId) {
      const habit = await this.habitRepository.findOne({
        where: { id: createDto.habitId },
      });
      if (!habit) {
        throw new NotFoundException('Habit not found');
      }
    }

    if (createDto.goalId) {
      const goal = await this.goalRepository.findOne({
        where: { id: createDto.goalId },
      });
      if (!goal) {
        throw new NotFoundException('Goal not found');
      }
    }

    // Optimize reminder timing using AI
    const optimizedTiming = await this.optimizeReminderTiming(
      userId,
      createDto
    );

    // Create smart reminder
    const smartReminder = this.smartReminderRepository.create({
      id: uuidv4(),
      userId,
      title: createDto.title,
      message: createDto.message,
      reminderType: createDto.reminderType,
      frequency: createDto.frequency,
      status: ReminderStatus.SCHEDULED,
      habitId: createDto.habitId,
      goalId: createDto.goalId,
      scheduledAt: optimizedTiming.optimizedScheduledAt,
      expiresAt: createDto.expiresAt,
      priority: createDto.priority || ReminderPriority.MEDIUM,
      aiOptimization: optimizedTiming.optimizationFactors,
      aiSuggestions: optimizedTiming.aiSuggestions,
      aiConfidence: optimizedTiming.aiConfidence,
      metadata: createDto.metadata,
    });

    const savedReminder =
      await this.smartReminderRepository.save(smartReminder);

    return this.mapToDto(savedReminder);
  }

  async updateSmartReminder(
    reminderId: string,
    userId: string,
    updateDto: UpdateSmartReminderDto
  ): Promise<SmartReminderDto> {
    const reminder = await this.smartReminderRepository.findOne({
      where: { id: reminderId, userId },
    });

    if (!reminder) {
      throw new NotFoundException('Smart reminder not found');
    }

    // If timing is being updated, re-optimize
    if (updateDto.scheduledAt) {
      const optimizedTiming = await this.optimizeReminderTiming(userId, {
        ...updateDto,
        reminderType: reminder.reminderType,
        frequency: reminder.frequency,
      });

      updateDto.scheduledAt = optimizedTiming.optimizedScheduledAt;
      updateDto.aiOptimization = optimizedTiming.optimizationFactors;
      updateDto.aiSuggestions = optimizedTiming.aiSuggestions;
      updateDto.aiConfidence = optimizedTiming.aiConfidence;
    }

    Object.assign(reminder, updateDto);
    const updatedReminder = await this.smartReminderRepository.save(reminder);

    return this.mapToDto(updatedReminder);
  }

  async getSmartReminder(
    reminderId: string,
    userId: string
  ): Promise<SmartReminderDto> {
    const reminder = await this.smartReminderRepository.findOne({
      where: { id: reminderId, userId },
    });

    if (!reminder) {
      throw new NotFoundException('Smart reminder not found');
    }

    return this.mapToDto(reminder);
  }

  async getUserSmartReminders(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<SmartReminderDto[]> {
    const reminders = await this.smartReminderRepository.find({
      where: { userId },
      order: { scheduledAt: 'ASC' },
      take: limit,
      skip: offset,
    });

    return reminders.map((reminder) => this.mapToDto(reminder));
  }

  async deleteSmartReminder(reminderId: string, userId: string): Promise<void> {
    const reminder = await this.smartReminderRepository.findOne({
      where: { id: reminderId, userId },
    });

    if (!reminder) {
      throw new NotFoundException('Smart reminder not found');
    }

    await this.smartReminderRepository.remove(reminder);
  }

  async cancelSmartReminder(
    reminderId: string,
    userId: string
  ): Promise<SmartReminderDto> {
    const reminder = await this.smartReminderRepository.findOne({
      where: { id: reminderId, userId },
    });

    if (!reminder) {
      throw new NotFoundException('Smart reminder not found');
    }

    if (reminder.status !== ReminderStatus.SCHEDULED) {
      throw new BadRequestException(
        'Only scheduled reminders can be cancelled'
      );
    }

    reminder.status = ReminderStatus.CANCELLED;
    const updatedReminder = await this.smartReminderRepository.save(reminder);

    return this.mapToDto(updatedReminder);
  }

  async retrySmartReminder(
    reminderId: string,
    userId: string
  ): Promise<SmartReminderDto> {
    const reminder = await this.smartReminderRepository.findOne({
      where: { id: reminderId, userId },
    });

    if (!reminder) {
      throw new NotFoundException('Smart reminder not found');
    }

    if (reminder.status !== ReminderStatus.FAILED) {
      throw new BadRequestException('Only failed reminders can be retried');
    }

    // Re-optimize timing
    const optimizedTiming = await this.optimizeReminderTiming(userId, {
      title: reminder.title,
      message: reminder.message,
      reminderType: reminder.reminderType,
      frequency: reminder.frequency,
    });

    reminder.status = ReminderStatus.SCHEDULED;
    reminder.scheduledAt = optimizedTiming.optimizedScheduledAt;
    reminder.aiOptimization = optimizedTiming.optimizationFactors;
    reminder.aiSuggestions = optimizedTiming.aiSuggestions;
    reminder.aiConfidence = optimizedTiming.aiConfidence;

    const updatedReminder = await this.smartReminderRepository.save(reminder);

    return this.mapToDto(updatedReminder);
  }

  async getSmartReminderStats(userId: string): Promise<{
    total: number;
    scheduled: number;
    sent: number;
    delivered: number;
    read: number;
    actedUpon: number;
    cancelled: number;
    failed: number;
  }> {
    const [
      total,
      scheduled,
      sent,
      delivered,
      read,
      actedUpon,
      cancelled,
      failed,
    ] = await Promise.all([
      this.smartReminderRepository.count({ where: { userId } }),
      this.smartReminderRepository.count({
        where: { userId, status: ReminderStatus.SCHEDULED },
      }),
      this.smartReminderRepository.count({
        where: { userId, status: ReminderStatus.SENT },
      }),
      this.smartReminderRepository.count({
        where: { userId, status: ReminderStatus.DELIVERED },
      }),
      this.smartReminderRepository.count({
        where: { userId, status: ReminderStatus.READ },
      }),
      this.smartReminderRepository.count({
        where: { userId, status: ReminderStatus.ACTED_UPON },
      }),
      this.smartReminderRepository.count({
        where: { userId, status: ReminderStatus.CANCELLED },
      }),
      this.smartReminderRepository.count({
        where: { userId, status: ReminderStatus.FAILED },
      }),
    ]);

    return {
      total,
      scheduled,
      sent,
      delivered,
      read,
      actedUpon,
      cancelled,
      failed,
    };
  }

  async getUpcomingReminders(
    userId: string,
    hours: number = 24
  ): Promise<SmartReminderDto[]> {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const reminders = await this.smartReminderRepository.find({
      where: {
        userId,
        status: ReminderStatus.SCHEDULED,
        scheduledAt: { $gte: now, $lte: futureTime } as any,
      },
      order: { scheduledAt: 'ASC' },
    });

    return reminders.map((reminder) => this.mapToDto(reminder));
  }

  async markReminderAsSent(reminderId: string): Promise<void> {
    await this.smartReminderRepository.update(reminderId, {
      status: ReminderStatus.SENT,
      sentAt: new Date(),
    });
  }

  async markReminderAsDelivered(reminderId: string): Promise<void> {
    await this.smartReminderRepository.update(reminderId, {
      status: ReminderStatus.DELIVERED,
      deliveredAt: new Date(),
    });
  }

  async markReminderAsRead(reminderId: string): Promise<void> {
    await this.smartReminderRepository.update(reminderId, {
      status: ReminderStatus.READ,
      readAt: new Date(),
    });
  }

  async markReminderAsActedUpon(reminderId: string): Promise<void> {
    await this.smartReminderRepository.update(reminderId, {
      status: ReminderStatus.ACTED_UPON,
      actedUponAt: new Date(),
    });
  }

  private async optimizeReminderTiming(
    userId: string,
    reminderData: Partial<CreateSmartReminderDto>
  ): Promise<{
    optimizedScheduledAt: Date;
    aiConfidence: number;
    aiSuggestions: string[];
    optimizationFactors: Record<string, any>;
  }> {
    // Mock AI optimization - in real implementation, this would analyze user behavior patterns
    const optimizationResult = await this.analyzeUserBehavior(
      userId,
      reminderData
    );

    return {
      optimizedScheduledAt: optimizationResult.optimizedTime,
      aiConfidence: optimizationResult.confidence,
      aiSuggestions: optimizationResult.suggestions,
      optimizationFactors: optimizationResult.factors,
    };
  }

  private async analyzeUserBehavior(
    userId: string,
    reminderData: Partial<CreateSmartReminderDto>
  ): Promise<{
    optimizedTime: Date;
    confidence: number;
    suggestions: string[];
    factors: Record<string, any>;
  }> {
    // Mock behavior analysis - in real implementation, this would analyze:
    // - User's response patterns to previous reminders
    // - Optimal times based on habit completion data
    // - User's daily schedule and preferences
    // - Seasonal and contextual factors

    const now = new Date();
    const baseTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    const mockOptimizations = {
      [ReminderType.HABIT_REMINDER]: {
        timeOffset: 1 * 60 * 60 * 1000, // 1 hour
        confidence: 0.89,
        suggestions: [
          'Based on your patterns, morning reminders have 85% higher engagement',
          'Consider setting reminders 15 minutes before your usual habit time',
          'Weekend reminders show better completion rates for this habit type',
        ],
        factors: {
          timeOfDay: 'morning',
          dayOfWeek: 'all',
          userEngagement: 'high',
          habitType: 'routine',
        },
      },
      [ReminderType.GOAL_REMINDER]: {
        timeOffset: 3 * 60 * 60 * 1000, // 3 hours
        confidence: 0.92,
        suggestions: [
          "Goal reminders work best when you're most focused",
          'Consider setting reminders during your peak productivity hours',
          'Link goal reminders to specific habit completion times',
        ],
        factors: {
          timeOfDay: 'afternoon',
          dayOfWeek: 'weekdays',
          userEngagement: 'very_high',
          goalType: 'long_term',
        },
      },
      [ReminderType.MOTIVATION]: {
        timeOffset: 4 * 60 * 60 * 1000, // 4 hours
        confidence: 0.87,
        suggestions: [
          'Motivational reminders are most effective during challenging periods',
          'Consider sending encouragement after missed habit days',
          'Personalized motivation based on progress shows better results',
        ],
        factors: {
          timeOfDay: 'evening',
          dayOfWeek: 'all',
          userEngagement: 'medium',
          motivationType: 'encouragement',
        },
      },
      [ReminderType.PROGRESS_CHECK]: {
        timeOffset: 6 * 60 * 60 * 1000, // 6 hours
        confidence: 0.85,
        suggestions: [
          'Progress check reminders work best at the end of activity periods',
          'Consider weekly progress summaries instead of daily checks',
          'Link progress reminders to milestone achievements',
        ],
        factors: {
          timeOfDay: 'evening',
          dayOfWeek: 'weekends',
          userEngagement: 'medium',
          progressType: 'summary',
        },
      },
      [ReminderType.GARDEN_UPDATE]: {
        timeOffset: 2 * 60 * 60 * 1000, // 2 hours
        confidence: 0.9,
        suggestions: [
          'Garden updates are most engaging during visual refresh periods',
          'Consider updating garden status after habit completions',
          'Seasonal garden changes increase engagement significantly',
        ],
        factors: {
          timeOfDay: 'morning',
          dayOfWeek: 'all',
          userEngagement: 'high',
          gardenType: 'visual',
        },
      },
      [ReminderType.CUSTOM]: {
        timeOffset: 2 * 60 * 60 * 1000, // 2 hours
        confidence: 0.8,
        suggestions: [
          'Custom reminders benefit from user-defined timing preferences',
          'Consider learning from user feedback on reminder effectiveness',
          'Adapt timing based on user interaction patterns',
        ],
        factors: {
          timeOfDay: 'flexible',
          dayOfWeek: 'all',
          userEngagement: 'variable',
          customType: 'user_defined',
        },
      },
    };

    const optimization =
      mockOptimizations[
        reminderData.reminderType || ReminderType.HABIT_REMINDER
      ];
    const optimizedTime = new Date(
      baseTime.getTime() + optimization.timeOffset
    );

    return {
      optimizedTime,
      confidence: optimization.confidence + (Math.random() - 0.5) * 0.1, // Add some randomness
      suggestions: optimization.suggestions,
      factors: optimization.factors,
    };
  }

  private mapToDto(reminder: SmartReminder): SmartReminderDto {
    return {
      id: reminder.id,
      userId: reminder.userId,
      title: reminder.title,
      message: reminder.message,
      reminderType: reminder.reminderType,
      frequency: reminder.frequency,
      status: reminder.status,
      habitId: reminder.habitId,
      goalId: reminder.goalId,
      scheduledAt: reminder.scheduledAt.toISOString(),
      expiresAt: reminder.expiresAt?.toISOString(),
      priority: reminder.priority,
      sentAt: reminder.sentAt?.toISOString(),
      deliveredAt: reminder.deliveredAt?.toISOString(),
      readAt: reminder.readAt?.toISOString(),
      actedUponAt: reminder.actedUponAt?.toISOString(),
      openRate: reminder.openRate,
      actionRate: reminder.actionRate,
      aiOptimization: reminder.aiOptimization,
      aiSuggestions: reminder.aiSuggestions,
      aiConfidence: reminder.aiConfidence,
      metadata: reminder.metadata,
      createdAt: reminder.createdAt.toISOString(),
      updatedAt: reminder.updatedAt.toISOString(),
    };
  }
}
