import { registerAs } from '@nestjs/config';

export default registerAs('performance', () => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'bloomhabit:',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300, // 5 minutes default
    max: parseInt(process.env.CACHE_MAX_ITEMS, 10) || 1000,
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD, 10) || 600,
  },
  queue: {
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
    limiter: {
      max: 1000,
      duration: 5000,
    },
  },
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      port: parseInt(process.env.METRICS_PORT, 10) || 9090,
    },
    health: {
      enabled: process.env.HEALTH_CHECK_ENABLED === 'true',
      timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT, 10) || 5000,
    },
  },
  throttling: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },
  compression: {
    enabled: process.env.COMPRESSION_ENABLED !== 'false',
    level: parseInt(process.env.COMPRESSION_LEVEL, 10) || 6,
  },
}));
