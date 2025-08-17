import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job, JobOptions } from 'bull';
import { ConfigService } from '@nestjs/config';

export interface JobData {
  [key: string]: any;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private readonly defaultJobOptions: JobOptions;

  constructor(
    @InjectQueue('default') private defaultQueue: Queue,
    @InjectQueue('notifications') private notificationsQueue: Queue,
    @InjectQueue('data-sync') private dataSyncQueue: Queue,
    @InjectQueue('analytics') private analyticsQueue: Queue,
    private configService: ConfigService
  ) {
    this.defaultJobOptions = this.configService.get(
      'performance.queue.defaultJobOptions'
    );
  }

  /**
   * Add job to default queue
   */
  async addJob(
    name: string,
    data: JobData,
    options?: JobOptions
  ): Promise<Job> {
    try {
      const jobOptions = { ...this.defaultJobOptions, ...options };
      const job = await this.defaultQueue.add(name, data, jobOptions);

      this.logger.log(`Job ${name} added to default queue with ID: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add job ${name}:`, error);
      throw error;
    }
  }

  /**
   * Add notification job
   */
  async addNotificationJob(
    name: string,
    data: JobData,
    options?: JobOptions
  ): Promise<Job> {
    try {
      const jobOptions = { ...this.defaultJobOptions, ...options };
      const job = await this.notificationsQueue.add(name, data, jobOptions);

      this.logger.log(`Notification job ${name} added with ID: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add notification job ${name}:`, error);
      throw error;
    }
  }

  /**
   * Add data sync job
   */
  async addDataSyncJob(
    name: string,
    data: JobData,
    options?: JobOptions
  ): Promise<Job> {
    try {
      const jobOptions = { ...this.defaultJobOptions, ...options };
      const job = await this.dataSyncQueue.add(name, data, jobOptions);

      this.logger.log(`Data sync job ${name} added with ID: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add data sync job ${name}:`, error);
      throw error;
    }
  }

  /**
   * Add analytics job
   */
  async addAnalyticsJob(
    name: string,
    data: JobData,
    options?: JobOptions
  ): Promise<Job> {
    try {
      const jobOptions = { ...this.defaultJobOptions, ...options };
      const job = await this.analyticsQueue.add(name, data, jobOptions);

      this.logger.log(`Analytics job ${name} added with ID: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add analytics job ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get job by ID
   */
  async getJob(queueName: string, jobId: string | number): Promise<Job | null> {
    try {
      const queue = this.getQueueByName(queueName);
      return await queue.getJob(jobId);
    } catch (error) {
      this.logger.error(
        `Failed to get job ${jobId} from queue ${queueName}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get all jobs from a queue
   */
  async getJobs(
    queueName: string,
    status?: string,
    start?: number,
    end?: number
  ): Promise<Job[]> {
    try {
      const queue = this.getQueueByName(queueName);
      return await queue.getJobs([status], start, end);
    } catch (error) {
      this.logger.error(`Failed to get jobs from queue ${queueName}:`, error);
      return [];
    }
  }

  /**
   * Remove job from queue
   */
  async removeJob(queueName: string, jobId: string | number): Promise<void> {
    try {
      const queue = this.getQueueByName(queueName);
      const job = await queue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.log(`Job ${jobId} removed from queue ${queueName}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to remove job ${jobId} from queue ${queueName}:`,
        error
      );
    }
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName: string): Promise<void> {
    try {
      const queue = this.getQueueByName(queueName);
      await queue.pause();
      this.logger.log(`Queue ${queueName} paused`);
    } catch (error) {
      this.logger.error(`Failed to pause queue ${queueName}:`, error);
    }
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName: string): Promise<void> {
    try {
      const queue = this.getQueueByName(queueName);
      await queue.resume();
      this.logger.log(`Queue ${queueName} resumed`);
    } catch (error) {
      this.logger.error(`Failed to resume queue ${queueName}:`, error);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string): Promise<any> {
    try {
      const queue = this.getQueueByName(queueName);
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed(),
      ]);

      return {
        name: queueName,
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total:
          waiting.length +
          active.length +
          completed.length +
          failed.length +
          delayed.length,
      };
    } catch (error) {
      this.logger.error(`Failed to get stats for queue ${queueName}:`, error);
      return null;
    }
  }

  /**
   * Get all queues statistics
   */
  async getAllQueuesStats(): Promise<any[]> {
    try {
      const queues = ['default', 'notifications', 'data-sync', 'analytics'];
      const stats = await Promise.all(
        queues.map((queueName) => this.getQueueStats(queueName))
      );
      return stats.filter(Boolean);
    } catch (error) {
      this.logger.error('Failed to get all queues stats:', error);
      return [];
    }
  }

  /**
   * Clean completed jobs
   */
  async cleanCompletedJobs(
    queueName: string,
    olderThan?: number
  ): Promise<number> {
    try {
      const queue = this.getQueueByName(queueName);
      const result = await queue.clean(
        olderThan || 24 * 60 * 60 * 1000,
        'completed'
      );
      this.logger.log(
        `Cleaned ${result.length} completed jobs from queue ${queueName}`
      );
      return result.length;
    } catch (error) {
      this.logger.error(
        `Failed to clean completed jobs from queue ${queueName}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Clean failed jobs
   */
  async cleanFailedJobs(
    queueName: string,
    olderThan?: number
  ): Promise<number> {
    try {
      const queue = this.getQueueByName(queueName);
      const result = await queue.clean(
        olderThan || 24 * 60 * 60 * 1000,
        'failed'
      );
      this.logger.log(
        `Cleaned ${result.length} failed jobs from queue ${queueName}`
      );
      return result.length;
    } catch (error) {
      this.logger.error(
        `Failed to clean failed jobs from queue ${queueName}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Get queue by name
   */
  private getQueueByName(queueName: string): Queue {
    switch (queueName) {
      case 'notifications':
        return this.notificationsQueue;
      case 'data-sync':
        return this.dataSyncQueue;
      case 'analytics':
        return this.analyticsQueue;
      default:
        return this.defaultQueue;
    }
  }
}
