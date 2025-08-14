import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './notification.entity';
import { PushSubscription } from './push-subscription.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PushService } from './push.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(PushSubscription)
    private pushSubscriptionsRepository: Repository<PushSubscription>,
    private pushService: PushService,
  ) {}

  async create(
    userId: number,
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      ...createNotificationDto,
      userId,
    });

    const savedNotification = await this.notificationsRepository.save(notification);

    // Send notification immediately if not scheduled
    if (!createNotificationDto.scheduledFor) {
      await this.sendNotification(savedNotification);
    }

    return savedNotification;
  }

  async findAll(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnread(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId, status: NotificationStatus.UNREAD },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Notification> {
    return this.notificationsRepository.findOne({
      where: { id, userId },
    });
  }

  async update(
    id: number,
    userId: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.findOne(id, userId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    Object.assign(notification, updateNotificationDto);
    return this.notificationsRepository.save(notification);
  }

  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.findOne(id, userId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.status = NotificationStatus.READ;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.update(
      { userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ },
    );
  }

  async remove(id: number, userId: number): Promise<void> {
    const notification = await this.findOne(id, userId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.notificationsRepository.remove(notification);
  }

  async sendNotification(notification: Notification): Promise<void> {
    try {
      // Send in-app notification
      await this.sendInAppNotification(notification);

      // Send push notification if user has subscriptions
      await this.sendPushNotification(notification);

      // Update notification status
      notification.sentAt = new Date();
      notification.isInAppSent = true;
      notification.isPushSent = true;
      await this.notificationsRepository.save(notification);

      this.logger.log(`Notification sent: ${notification.title}`);
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  private async sendInAppNotification(notification: Notification): Promise<void> {
    // In-app notifications are handled by the frontend
    // This method can be extended for real-time updates via WebSockets
    this.logger.log(`In-app notification sent: ${notification.title}`);
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    const subscriptions = await this.pushSubscriptionsRepository.find({
      where: { userId: notification.userId, isActive: true },
    });

    for (const subscription of subscriptions) {
      try {
        await this.pushService.sendPushNotification(subscription, notification);
      } catch (error) {
        this.logger.error(
          `Failed to send push notification to subscription ${subscription.id}: ${error.message}`,
        );
      }
    }
  }

  async sendHabitReminder(
    userId: number,
    habitTitle: string,
    scheduledTime: Date,
  ): Promise<void> {
    await this.create(userId, {
      type: NotificationType.HABIT_REMINDER,
      title: 'Habit Reminder',
      message: `Time to work on: ${habitTitle}`,
      data: { habitTitle, scheduledTime },
      priority: 'medium',
      scheduledFor: scheduledTime.toISOString(),
    });
  }

  async sendStreakMilestone(
    userId: number,
    habitTitle: string,
    streakCount: number,
  ): Promise<void> {
    await this.create(userId, {
      type: NotificationType.STREAK_MILESTONE,
      title: 'Streak Milestone! 🎉',
      message: `Congratulations! You've maintained "${habitTitle}" for ${streakCount} days!`,
      data: { habitTitle, streakCount },
      priority: 'high',
    });
  }

  async sendGoalAchievement(
    userId: number,
    goalTitle: string,
    achievement: string,
  ): Promise<void> {
    await this.create(userId, {
      type: NotificationType.GOAL_ACHIEVEMENT,
      title: 'Goal Achieved! 🏆',
      message: `You've achieved: ${achievement}`,
      data: { goalTitle, achievement },
      priority: 'high',
    });
  }

  async sendAiInsight(
    userId: number,
    insight: string,
    habitTitle?: string,
  ): Promise<void> {
    await this.create(userId, {
      type: NotificationType.AI_INSIGHT,
      title: 'AI Gardener Insight 🌱',
      message: insight,
      data: { habitTitle, insight },
      priority: 'medium',
    });
  }

  async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const scheduledNotifications = await this.notificationsRepository.find({
      where: {
        scheduledFor: LessThanOrEqual(now),
        status: NotificationStatus.UNREAD,
      },
    });

    for (const notification of scheduledNotifications) {
      await this.sendNotification(notification);
    }
  }

  async getNotificationStats(userId: number): Promise<{
    total: number;
    unread: number;
    read: number;
    archived: number;
  }> {
    const [total, unread, read, archived] = await Promise.all([
      this.notificationsRepository.count({ where: { userId } }),
      this.notificationsRepository.count({
        where: { userId, status: NotificationStatus.UNREAD },
      }),
      this.notificationsRepository.count({
        where: { userId, status: NotificationStatus.READ },
      }),
      this.notificationsRepository.count({
        where: { userId, status: NotificationStatus.ARCHIVED },
      }),
    ]);

    return { total, unread, read, archived };
  }
}
