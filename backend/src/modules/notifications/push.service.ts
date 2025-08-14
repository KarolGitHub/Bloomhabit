import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PushSubscription } from './push-subscription.entity';
import { Notification } from './notification.entity';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(private configService: ConfigService) {
    this.initializeWebPush();
  }

  private initializeWebPush(): void {
    const vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      this.logger.warn('VAPID keys not configured. Push notifications will not work.');
      return;
    }

    webpush.setVapidDetails(
      'mailto:notifications@bloomhabit.app',
      vapidPublicKey,
      vapidPrivateKey,
    );

    this.logger.log('Web Push initialized successfully');
  }

  async sendPushNotification(
    subscription: PushSubscription,
    notification: Notification,
  ): Promise<void> {
    try {
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        icon: '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png',
        data: {
          notificationId: notification.id,
          type: notification.type,
          ...notification.data,
        },
        actions: this.getNotificationActions(notification.type),
        requireInteraction: notification.priority === 'high' || notification.priority === 'urgent',
        tag: `notification-${notification.type}`,
        renotify: true,
      });

      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
        payload,
      );

      this.logger.log(
        `Push notification sent successfully to subscription ${subscription.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send push notification: ${error.message}`,
      );

      // Handle subscription expiration
      if (error.statusCode === 410) {
        await this.deactivateSubscription(subscription.id);
      }

      throw error;
    }
  }

  private getNotificationActions(type: string): any[] {
    switch (type) {
      case 'habit_reminder':
        return [
          {
            action: 'complete',
            title: 'Mark Complete',
            icon: '/icons/check.svg',
          },
          {
            action: 'snooze',
            title: 'Snooze 15min',
            icon: '/icons/snooze.svg',
          },
        ];
      case 'streak_milestone':
        return [
          {
            action: 'celebrate',
            title: 'Celebrate! 🎉',
            icon: '/icons/party.svg',
          },
          {
            action: 'share',
            title: 'Share',
            icon: '/icons/share.svg',
          },
        ];
      case 'goal_achievement':
        return [
          {
            action: 'view',
            title: 'View Achievement',
            icon: '/icons/trophy.svg',
          },
          {
            action: 'share',
            title: 'Share',
            icon: '/icons/share.svg',
          },
        ];
      default:
        return [
          {
            action: 'view',
            title: 'View',
            icon: '/icons/eye.svg',
          },
        ];
    }
  }

  private async deactivateSubscription(subscriptionId: number): Promise<void> {
    // This would typically update the subscription in the database
    // For now, we'll just log it
    this.logger.log(`Subscription ${subscriptionId} expired and will be deactivated`);
  }

  getVapidPublicKey(): string {
    return this.configService.get<string>('VAPID_PUBLIC_KEY') || '';
  }
}
