import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  MonitoringService,
  SystemMetrics,
  HealthCheckResult,
} from '../../common/services/monitoring.service';
import { CacheService } from '../../common/services/cache.service';
import { QueueService } from '../../common/services/queue.service';

@ApiTags('Performance & Monitoring')
@Controller('performance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PerformanceController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly cacheService: CacheService,
    private readonly queueService: QueueService
  ) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({
    status: 200,
    description: 'System health check completed',
    type: Object,
  })
  async getHealth(): Promise<HealthCheckResult> {
    return this.monitoringService.performHealthCheck();
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current system metrics' })
  @ApiResponse({
    status: 200,
    description: 'Current system metrics',
    type: Object,
  })
  async getMetrics(): Promise<SystemMetrics> {
    return this.monitoringService.getSystemMetrics();
  }

  @Get('metrics/history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get metrics history' })
  @ApiQuery({
    name: 'limit',
    description: 'Number of metrics to return',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics history',
    type: [Object],
  })
  async getMetricsHistory(
    @Query('limit') limit?: number
  ): Promise<SystemMetrics[]> {
    return this.monitoringService.getMetricsHistory(limit);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get comprehensive performance statistics' })
  @ApiResponse({
    status: 200,
    description: 'Performance statistics',
    type: Object,
  })
  async getPerformanceStats(): Promise<any> {
    return this.monitoringService.getPerformanceStats();
  }

  @Get('cache/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics',
    type: Object,
  })
  async getCacheStats(): Promise<any> {
    return this.cacheService.getStats();
  }

  @Get('cache/keys')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get cache keys by pattern' })
  @ApiQuery({
    name: 'pattern',
    description: 'Redis key pattern (e.g., "*", "user:*")',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Cache keys matching pattern',
    type: [String],
  })
  async getCacheKeys(
    @Query('pattern') pattern: string = '*'
  ): Promise<string[]> {
    return this.cacheService.getKeys(pattern);
  }

  @Delete('cache/keys/:pattern')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete cache keys by pattern' })
  @ApiParam({
    name: 'pattern',
    description: 'Redis key pattern to delete',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Number of keys deleted',
    type: Number,
  })
  async deleteCacheKeys(
    @Param('pattern') pattern: string
  ): Promise<{ deleted: number }> {
    const deleted = await this.cacheService.delByPattern(pattern);
    return { deleted };
  }

  @Post('cache/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset entire cache' })
  @ApiResponse({
    status: 200,
    description: 'Cache reset completed',
    type: Object,
  })
  async resetCache(): Promise<{ message: string }> {
    await this.cacheService.reset();
    return { message: 'Cache reset completed' };
  }

  @Get('queues/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all queues statistics' })
  @ApiResponse({
    status: 200,
    description: 'Queue statistics',
    type: [Object],
  })
  async getQueuesStats(): Promise<any[]> {
    return this.queueService.getAllQueuesStats();
  }

  @Get('queues/:name/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get specific queue statistics' })
  @ApiParam({
    name: 'name',
    description: 'Queue name',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Queue statistics',
    type: Object,
  })
  async getQueueStats(@Param('name') name: string): Promise<any> {
    return this.queueService.getQueueStats(name);
  }

  @Get('queues/:name/jobs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get jobs from specific queue' })
  @ApiParam({
    name: 'name',
    description: 'Queue name',
    type: String,
  })
  @ApiQuery({
    name: 'status',
    description: 'Job status filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'start',
    description: 'Start index',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'end',
    description: 'End index',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Queue jobs',
    type: [Object],
  })
  async getQueueJobs(
    @Param('name') name: string,
    @Query('status') status?: string,
    @Query('start') start?: number,
    @Query('end') end?: number
  ): Promise<any[]> {
    return this.queueService.getJobs(name, status, start, end);
  }

  @Post('queues/:name/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause specific queue' })
  @ApiParam({
    name: 'name',
    description: 'Queue name',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Queue paused',
    type: Object,
  })
  async pauseQueue(@Param('name') name: string): Promise<{ message: string }> {
    await this.queueService.pauseQueue(name);
    return { message: `Queue ${name} paused` };
  }

  @Post('queues/:name/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume specific queue' })
  @ApiParam({
    name: 'name',
    description: 'Queue name',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Queue resumed',
    type: Object,
  })
  async resumeQueue(@Param('name') name: string): Promise<{ message: string }> {
    await this.queueService.resumeQueue(name);
    return { message: `Queue ${name} resumed` };
  }

  @Delete('queues/:name/jobs/completed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean completed jobs from queue' })
  @ApiParam({
    name: 'name',
    description: 'Queue name',
    type: String,
  })
  @ApiQuery({
    name: 'olderThan',
    description: 'Age in milliseconds',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Number of jobs cleaned',
    type: Object,
  })
  async cleanCompletedJobs(
    @Param('name') name: string,
    @Query('olderThan') olderThan?: number
  ): Promise<{ cleaned: number }> {
    const cleaned = await this.queueService.cleanCompletedJobs(name, olderThan);
    return { cleaned };
  }

  @Delete('queues/:name/jobs/failed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean failed jobs from queue' })
  @ApiParam({
    name: 'name',
    description: 'Queue name',
    type: String,
  })
  @ApiQuery({
    name: 'olderThan',
    description: 'Age in milliseconds',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Number of jobs cleaned',
    type: Object,
  })
  async cleanFailedJobs(
    @Param('name') name: string,
    @Query('olderThan') olderThan?: number
  ): Promise<{ cleaned: number }> {
    const cleaned = await this.queueService.cleanFailedJobs(name, olderThan);
    return { cleaned };
  }

  @Get('system/info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get system information' })
  @ApiResponse({
    status: 200,
    description: 'System information',
    type: Object,
  })
  async getSystemInfo(): Promise<any> {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
      },
      cpu: {
        user: Math.round(cpuUsage.user / 1000), // ms
        system: Math.round(cpuUsage.system / 1000), // ms
      },
      pid: process.pid,
      title: process.title,
      argv: process.argv,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
      },
    };
  }
}
