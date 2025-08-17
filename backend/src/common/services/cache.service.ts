import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RedisService } from '../../config/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService {
  private readonly defaultTTL: number;
  private readonly redisClient: any;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private redisService: RedisService,
    private configService: ConfigService
  ) {
    this.defaultTTL = this.configService.get('performance.cache.ttl') || 300;
    this.redisClient = this.redisService.getClient();
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const cacheTTL = ttl || this.defaultTTL;
      await this.cacheManager.set(key, value, cacheTTL);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Reset entire cache
   */
  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
    } catch (error) {
      console.error('Cache reset error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    try {
      const info = await this.redisClient.info();
      const keyspace = await this.redisClient.info('keyspace');

      return {
        info: info.split('\r\n').reduce((acc: any, line: string) => {
          if (line.includes(':')) {
            const [key, value] = line.split(':');
            acc[key] = value;
          }
          return acc;
        }, {}),
        keyspace: keyspace.split('\r\n').reduce((acc: any, line: string) => {
          if (line.includes(':')) {
            const [key, value] = line.split(':');
            acc[key] = value;
          }
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }

  /**
   * Get multiple values from cache
   */
  async mget(keys: string[]): Promise<(any | null)[]> {
    try {
      const promises = keys.map((key) => this.get(key));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple values in cache
   */
  async mset(
    keyValuePairs: { key: string; value: any; ttl?: number }[]
  ): Promise<void> {
    try {
      const promises = keyValuePairs.map(({ key, value, ttl }) =>
        this.set(key, value, ttl)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Cache mset error:', error);
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== null;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get cache keys by pattern
   */
  async getKeys(pattern: string): Promise<string[]> {
    try {
      return await this.redisClient.keys(pattern);
    } catch (error) {
      console.error(`Cache getKeys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async delByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.getKeys(pattern);
      if (keys.length > 0) {
        const promises = keys.map((key) => this.del(key));
        await Promise.all(promises);
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error(`Cache delByPattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Increment counter in cache
   */
  async incr(key: string, value: number = 1): Promise<number> {
    try {
      const current = (await this.get<number>(key)) || 0;
      const newValue = current + value;
      await this.set(key, newValue);
      return newValue;
    } catch (error) {
      console.error(`Cache incr error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Decrement counter in cache
   */
  async decr(key: string, value: number = 1): Promise<number> {
    try {
      const current = (await this.get<number>(key)) || 0;
      const newValue = Math.max(0, current - value);
      await this.set(key, newValue);
      return newValue;
    } catch (error) {
      console.error(`Cache decr error for key ${key}:`, error);
      return 0;
    }
  }
}
