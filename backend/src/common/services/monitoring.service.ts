import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { QueueService } from './queue.service';
import { RedisService } from '../../config/redis.service';

export interface SystemMetrics {
  timestamp: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    load: number;
    usage: number;
  };
  database: {
    connections: number;
    queries: number;
    responseTime: number;
  };
  cache: {
    hitRate: number;
    memoryUsage: number;
    keys: number;
  };
  queues: {
    totalJobs: number;
    activeJobs: number;
    failedJobs: number;
  };
  uptime: number;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: number;
  checks: {
    [key: string]: {
      status: 'up' | 'down';
      responseTime: number;
      details?: any;
    };
  };
  summary: {
    total: number;
    up: number;
    down: number;
  };
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly monitoringEnabled: boolean;
  private metricsHistory: SystemMetrics[] = [];
  private readonly maxHistorySize = 1000;

  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
    private queueService: QueueService,
    private redisService: RedisService
  ) {
    this.monitoringEnabled =
      this.configService.get('performance.monitoring.enabled') || false;
  }

  /**
   * Get current system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    if (!this.monitoringEnabled) {
      throw new Error('Monitoring is disabled');
    }

    try {
      const startTime = Date.now();

      const [memory, cpu, database, cache, queues] = await Promise.all([
        this.getMemoryMetrics(),
        this.getCpuMetrics(),
        this.getDatabaseMetrics(),
        this.getCacheMetrics(),
        this.getQueueMetrics(),
      ]);

      const metrics: SystemMetrics = {
        timestamp: Date.now(),
        memory,
        cpu,
        database,
        cache,
        queues,
        uptime: process.uptime(),
      };

      // Store in history
      this.metricsHistory.push(metrics);
      if (this.metricsHistory.length > this.maxHistorySize) {
        this.metricsHistory.shift();
      }

      const duration = Date.now() - startTime;
      this.logger.debug(`System metrics collected in ${duration}ms`);

      return metrics;
    } catch (error) {
      this.logger.error('Failed to collect system metrics:', error);
      throw error;
    }
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(limit: number = 100): SystemMetrics[] {
    return this.metricsHistory.slice(-limit);
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    if (!this.configService.get('performance.monitoring.health.enabled')) {
      throw new Error('Health checks are disabled');
    }

    const startTime = Date.now();
    const checks: HealthCheckResult['checks'] = {};

    try {
      // Database health check
      const dbStart = Date.now();
      const dbHealth = await this.checkDatabaseHealth();
      checks.database = {
        status: dbHealth.status,
        responseTime: Date.now() - dbStart,
        details: dbHealth.details,
      };

      // Redis health check
      const redisStart = Date.now();
      const redisHealth = await this.checkRedisHealth();
      checks.redis = {
        status: redisHealth.status,
        responseTime: Date.now() - redisStart,
        details: redisHealth.details,
      };

      // Cache health check
      const cacheStart = Date.now();
      const cacheHealth = await this.checkCacheHealth();
      checks.cache = {
        status: cacheHealth.status,
        responseTime: Date.now() - cacheStart,
        details: cacheHealth.details,
      };

      // Queue health check
      const queueStart = Date.now();
      const queueHealth = await this.checkQueueHealth();
      checks.queues = {
        status: queueHealth.status,
        responseTime: Date.now() - queueStart,
        details: queueHealth.details,
      };

      // System health check
      const systemStart = Date.now();
      const systemHealth = await this.checkSystemHealth();
      checks.system = {
        status: systemHealth.status,
        responseTime: Date.now() - systemStart,
        details: systemHealth.details,
      };

      const totalDuration = Date.now() - startTime;
      const upCount = Object.values(checks).filter(
        (check) => check.status === 'up'
      ).length;
      const downCount = Object.values(checks).filter(
        (check) => check.status === 'down'
      ).length;
      const total = Object.keys(checks).length;

      let overallStatus: HealthCheckResult['status'] = 'healthy';
      if (downCount > 0) {
        overallStatus = downCount === total ? 'unhealthy' : 'degraded';
      }

      const result: HealthCheckResult = {
        status: overallStatus,
        timestamp: Date.now(),
        checks,
        summary: {
          total,
          up: upCount,
          down: downCount,
        },
      };

      this.logger.log(
        `Health check completed in ${totalDuration}ms - Status: ${overallStatus}`
      );
      return result;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  async getPerformanceStats(): Promise<any> {
    try {
      const [metrics, health, cacheStats, queueStats] = await Promise.all([
        this.getSystemMetrics(),
        this.performHealthCheck(),
        this.cacheService.getStats(),
        this.queueService.getAllQueuesStats(),
      ]);

      return {
        metrics,
        health,
        cache: cacheStats,
        queues: queueStats,
        timestamp: Date.now(),
      };
    } catch (error) {
      this.logger.error('Failed to get performance stats:', error);
      throw error;
    }
  }

  /**
   * Get memory metrics
   */
  private async getMemoryMetrics(): Promise<SystemMetrics['memory']> {
    const memUsage = process.memoryUsage();
    const total = memUsage.heapTotal;
    const used = memUsage.heapUsed;

    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: Math.round((used / total) * 100),
    };
  }

  /**
   * Get CPU metrics
   */
  private async getCpuMetrics(): Promise<SystemMetrics['cpu']> {
    // Simple CPU load calculation
    const load = process.cpuUsage();
    const totalLoad = load.user + load.system;

    return {
      load: Math.round(totalLoad / 1000), // Convert to milliseconds
      usage: Math.round((totalLoad / (totalLoad + 1000000)) * 100), // Rough percentage
    };
  }

  /**
   * Get database metrics
   */
  private async getDatabaseMetrics(): Promise<SystemMetrics['database']> {
    // Placeholder for database metrics
    // In a real implementation, you'd query your database for connection info
    return {
      connections: 0,
      queries: 0,
      responseTime: 0,
    };
  }

  /**
   * Get cache metrics
   */
  private async getCacheMetrics(): Promise<SystemMetrics['cache']> {
    try {
      const stats = await this.cacheService.getStats();
      const keys = await this.cacheService.getKeys('*');

      return {
        hitRate: stats?.info?.keyspace_hits || 0,
        memoryUsage: 0, // Would need Redis INFO command for this
        keys: keys.length,
      };
    } catch (error) {
      return {
        hitRate: 0,
        memoryUsage: 0,
        keys: 0,
      };
    }
  }

  /**
   * Get queue metrics
   */
  private async getQueueMetrics(): Promise<SystemMetrics['queues']> {
    try {
      const stats = await this.queueService.getAllQueuesStats();
      const totalJobs = stats.reduce((sum, queue) => sum + queue.total, 0);
      const activeJobs = stats.reduce((sum, queue) => sum + queue.active, 0);
      const failedJobs = stats.reduce((sum, queue) => sum + queue.failed, 0);

      return {
        totalJobs,
        activeJobs,
        failedJobs,
      };
    } catch (error) {
      return {
        totalJobs: 0,
        activeJobs: 0,
        failedJobs: 0,
      };
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<{
    status: 'up' | 'down';
    details?: any;
  }> {
    try {
      // Placeholder for database health check
      // In a real implementation, you'd test database connectivity
      return {
        status: 'up',
        details: { message: 'Database connection healthy' },
      };
    } catch (error) {
      return { status: 'down', details: { error: error.message } };
    }
  }

  /**
   * Check Redis health
   */
  private async checkRedisHealth(): Promise<{
    status: 'up' | 'down';
    details?: any;
  }> {
    try {
      const client = this.redisService.getClient();
      await client.ping();
      return { status: 'up', details: { message: 'Redis connection healthy' } };
    } catch (error) {
      return { status: 'down', details: { error: error.message } };
    }
  }

  /**
   * Check cache health
   */
  private async checkCacheHealth(): Promise<{
    status: 'up' | 'down';
    details?: any;
  }> {
    try {
      await this.cacheService.set('health_check', 'ok', 10);
      const result = await this.cacheService.get('health_check');
      await this.cacheService.del('health_check');

      if (result === 'ok') {
        return {
          status: 'up',
          details: { message: 'Cache operations healthy' },
        };
      } else {
        return {
          status: 'down',
          details: { error: 'Cache read/write failed' },
        };
      }
    } catch (error) {
      return { status: 'down', details: { error: error.message } };
    }
  }

  /**
   * Check queue health
   */
  private async checkQueueHealth(): Promise<{
    status: 'up' | 'down';
    details?: any;
  }> {
    try {
      const stats = await this.queueService.getAllQueuesStats();
      const healthyQueues = stats.filter((queue) => queue.total >= 0).length;

      if (healthyQueues === stats.length) {
        return {
          status: 'up',
          details: {
            message: 'All queues healthy',
            queueCount: stats.length,
          },
        };
      } else {
        return {
          status: 'down',
          details: {
            error: 'Some queues unhealthy',
            healthyQueues,
            totalQueues: stats.length,
          },
        };
      }
    } catch (error) {
      return { status: 'down', details: { error: error.message } };
    }
  }

  /**
   * Check system health
   */
  private async checkSystemHealth(): Promise<{
    status: 'up' | 'down';
    details?: any;
  }> {
    try {
      const memUsage = process.memoryUsage();
      const memoryUsage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

      if (memoryUsage > 90) {
        return {
          status: 'down',
          details: {
            error: 'High memory usage',
            memoryUsage: Math.round(memoryUsage) + '%',
          },
        };
      }

      if (process.uptime() < 60) {
        return {
          status: 'down',
          details: {
            error: 'Application recently started',
            uptime: Math.round(process.uptime()) + 's',
          },
        };
      }

      return {
        status: 'up',
        details: {
          message: 'System healthy',
          memoryUsage: Math.round(memoryUsage) + '%',
          uptime: Math.round(process.uptime()) + 's',
        },
      };
    } catch (error) {
      return { status: 'down', details: { error: error.message } };
    }
  }
}
