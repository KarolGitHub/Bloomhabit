import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { Notification } from './notification.entity';
import { PushSubscription } from './push-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, PushSubscription])],
  controllers: [NotificationsController],
  providers: [NotificationsService, PushService, PushSubscriptionsService],
  exports: [NotificationsService, PushService, PushSubscriptionsService],
})
export class NotificationsModule {}
