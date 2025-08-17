import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redisClient: Redis;
  private readonly redisSubscriber: Redis;

  constructor(private configService: ConfigService) {
    const redisConfig = this.configService.get('performance.redis');

    this.redisClient = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
      keyPrefix: redisConfig.keyPrefix,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redisSubscriber = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
      keyPrefix: redisConfig.keyPrefix,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redisClient.on('connect', () => {
      console.log('Redis client connected');
    });

    this.redisClient.on('error', (error) => {
      console.error('Redis client error:', error);
    });

    this.redisClient.on('ready', () => {
      console.log('Redis client ready');
    });

    this.redisSubscriber.on('connect', () => {
      console.log('Redis subscriber connected');
    });

    this.redisSubscriber.on('error', (error) => {
      console.error('Redis subscriber error:', error);
    });
  }

  getClient(): Redis {
    return this.redisClient;
  }

  getSubscriber(): Redis {
    return this.redisSubscriber;
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
    await this.redisSubscriber.quit();
  }
}
