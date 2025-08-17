import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

import { PerformanceController } from './performance.controller';
import { NotificationProcessor } from './processors/notification.processor';
import { DataSyncProcessor } from './processors/data-sync.processor';
import { AnalyticsProcessor } from './processors/analytics.processor';
import { CacheService } from '../../common/services/cache.service';
import { QueueService } from '../../common/services/queue.service';
import { MonitoringService } from '../../common/services/monitoring.service';
import { RedisService } from '../../config/redis.service';

@Module({
  imports: [
    // Cache configuration with Redis
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.get('performance.redis');
        const cacheConfig = configService.get('performance.cache');

        return {
          store: redisStore,
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          db: redisConfig.db,
          ttl: cacheConfig.ttl,
          max: cacheConfig.max,
          checkPeriod: cacheConfig.checkPeriod,
        };
      },
      inject: [ConfigService],
    }),

    // Bull queue configuration
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.get('performance.redis');
        const queueConfig = configService.get('performance.queue');

        return {
          redis: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            db: redisConfig.db,
          },
          defaultJobOptions: queueConfig.defaultJobOptions,
          limiter: queueConfig.limiter,
        };
      },
      inject: [ConfigService],
    }),

    // Register specific queues
    BullModule.registerQueue(
      { name: 'default' },
      { name: 'notifications' },
      { name: 'data-sync' },
      { name: 'analytics' }
    ),

    // Health checks
    TerminusModule,

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const throttleConfig = configService.get('performance.throttling');

        return {
          ttl: throttleConfig.ttl,
          limit: throttleConfig.limit,
        };
      },
      inject: [ConfigService],
    }),

    // Scheduled tasks
    ScheduleModule.forRoot(),
  ],
  controllers: [PerformanceController],
  providers: [
    CacheService,
    QueueService,
    MonitoringService,
    RedisService,
    NotificationProcessor,
    DataSyncProcessor,
    AnalyticsProcessor,
  ],
  exports: [
    CacheService,
    QueueService,
    MonitoringService,
    RedisService,
    CacheModule,
    BullModule,
  ],
})
export class PerformanceModule {}
