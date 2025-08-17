import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

export interface NotificationJobData {
  userId: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  title: string;
  message: string;
  data?: any;
}

export interface NotificationJobResult {
  success: boolean;
  messageId?: string;
  error?: string;
  sentAt: Date;
}

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  @Process('send-email')
  async handleSendEmail(
    job: Job<NotificationJobData>
  ): Promise<NotificationJobResult> {
    this.logger.log(
      `Processing email notification job ${job.id} for user ${job.data.userId}`
    );

    try {
      await this.simulateEmailSending(job.data);

      return {
        success: true,
        messageId: `email_${Date.now()}_${job.id}`,
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Email notification job ${job.id} failed:`, error);
      throw error;
    }
  }

  @Process('send-push')
  async handleSendPush(
    job: Job<NotificationJobData>
  ): Promise<NotificationJobResult> {
    this.logger.log(
      `Processing push notification job ${job.id} for user ${job.data.userId}`
    );

    try {
      await this.simulatePushSending(job.data);

      return {
        success: true,
        messageId: `push_${Date.now()}_${job.id}`,
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Push notification job ${job.id} failed:`, error);
      throw error;
    }
  }

  @Process('send-sms')
  async handleSendSms(
    job: Job<NotificationJobData>
  ): Promise<NotificationJobResult> {
    this.logger.log(
      `Processing SMS notification job ${job.id} for user ${job.data.userId}`
    );

    try {
      await this.simulateSmsSending(job.data);

      return {
        success: true,
        messageId: `sms_${Date.now()}_${job.id}`,
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`SMS notification job ${job.id} failed:`, error);
      throw error;
    }
  }

  @Process('send-in-app')
  async handleSendInApp(
    job: Job<NotificationJobData>
  ): Promise<NotificationJobResult> {
    this.logger.log(
      `Processing in-app notification job ${job.id} for user ${job.data.userId}`
    );

    try {
      await this.simulateInAppNotification(job.data);

      return {
        success: true,
        messageId: `in_app_${Date.now()}_${job.id}`,
        sentAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`In-app notification job ${job.id} failed:`, error);
      throw error;
    }
  }

  private async simulateEmailSending(data: NotificationJobData): Promise<void> {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 1000 + 500)
    );
    if (Math.random() < 0.05) {
      throw new Error('Email service temporarily unavailable');
    }
  }

  private async simulatePushSending(data: NotificationJobData): Promise<void> {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 500 + 200)
    );
    if (Math.random() < 0.03) {
      throw new Error('Push notification service error');
    }
  }

  private async simulateSmsSending(data: NotificationJobData): Promise<void> {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 800 + 300)
    );
    if (Math.random() < 0.08) {
      throw new Error('SMS gateway error');
    }
  }

  private async simulateInAppNotification(
    data: NotificationJobData
  ): Promise<void> {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 200 + 100)
    );
    if (Math.random() < 0.02) {
      throw new Error('In-app notification service error');
    }
  }
}
