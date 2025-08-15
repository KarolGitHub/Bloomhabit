import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WearableIntegration,
  IntegrationStatus,
  SyncFrequency,
} from '../../database/entities/wearable-integration.entity';
import { WearableDevice } from '../../database/entities/wearable-device.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WearableIntegrationsService {
  constructor(
    @InjectRepository(WearableIntegration)
    private wearableIntegrationRepository: Repository<WearableIntegration>,
    @InjectRepository(WearableDevice)
    private wearableDeviceRepository: Repository<WearableDevice>,
    private configService: ConfigService
  ) {}

  async create(
    userId: number,
    provider: string,
    oauthConfig: any
  ): Promise<WearableIntegration> {
    // Check if user already has an integration with this provider
    const existingIntegration =
      await this.wearableIntegrationRepository.findOne({
        where: { userId, provider },
      });

    if (existingIntegration) {
      throw new ConflictException(
        `User already has an integration with ${provider}`
      );
    }

    const integration = this.wearableIntegrationRepository.create({
      userId,
      provider,
      oauthConfig,
      status: IntegrationStatus.PENDING_SETUP,
      syncFrequency: SyncFrequency.DAILY,
      syncSettings: {
        enabledMetrics: [
          'steps',
          'heart_rate',
          'sleep',
          'calories',
          'distance',
        ],
        syncHistory: true,
        maxHistoryDays: 30,
        autoSync: true,
        notifications: true,
        dataRetention: 365,
      },
      apiLimits: {
        rateLimit: 100,
        rateLimitWindow: 3600,
        dailyQuota: 1000,
        monthlyQuota: 10000,
        lastReset: new Date(),
      },
      syncStats: {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        lastError: null,
        lastErrorAt: null,
        dataPointsReceived: 0,
        dataPointsProcessed: 0,
      },
    });

    return this.wearableIntegrationRepository.save(integration);
  }

  async findAll(userId: number): Promise<WearableIntegration[]> {
    return this.wearableIntegrationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, id: number): Promise<WearableIntegration> {
    const integration = await this.wearableIntegrationRepository.findOne({
      where: { id, userId },
    });

    if (!integration) {
      throw new NotFoundException(
        `Wearable integration with ID ${id} not found`
      );
    }

    return integration;
  }

  async findByProvider(
    userId: number,
    provider: string
  ): Promise<WearableIntegration | null> {
    return this.wearableIntegrationRepository.findOne({
      where: { userId, provider },
    });
  }

  async update(
    userId: number,
    id: number,
    updateData: Partial<WearableIntegration>
  ): Promise<WearableIntegration> {
    const integration = await this.findOne(userId, id);

    Object.assign(integration, updateData);
    return this.wearableIntegrationRepository.save(integration);
  }

  async remove(userId: number, id: number): Promise<void> {
    const integration = await this.findOne(userId, id);
    await this.wearableIntegrationRepository.remove(integration);
  }

  async updateAccessTokens(
    userId: number,
    id: number,
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
    scope: string[]
  ): Promise<WearableIntegration> {
    const integration = await this.findOne(userId, id);

    integration.accessTokens = {
      accessToken,
      refreshToken,
      expiresAt,
      scope,
    };

    integration.status = IntegrationStatus.ACTIVE;
    integration.lastSyncAt = new Date();

    return this.wearableIntegrationRepository.save(integration);
  }

  async updateSyncSettings(
    userId: number,
    id: number,
    syncSettings: any
  ): Promise<WearableIntegration> {
    const integration = await this.findOne(userId, id);

    integration.syncSettings = { ...integration.syncSettings, ...syncSettings };

    return this.wearableIntegrationRepository.save(integration);
  }

  async updateSyncFrequency(
    userId: number,
    id: number,
    syncFrequency: SyncFrequency
  ): Promise<WearableIntegration> {
    const integration = await this.findOne(userId, id);

    integration.syncFrequency = syncFrequency;

    // Calculate next sync time based on frequency
    const now = new Date();
    switch (syncFrequency) {
      case SyncFrequency.HOURLY:
        integration.nextSyncAt = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case SyncFrequency.DAILY:
        integration.nextSyncAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case SyncFrequency.WEEKLY:
        integration.nextSyncAt = new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000
        );
        break;
      case SyncFrequency.MANUAL:
        integration.nextSyncAt = null;
        break;
      default:
        integration.nextSyncAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    return this.wearableIntegrationRepository.save(integration);
  }

  async updateStatus(
    userId: number,
    id: number,
    status: IntegrationStatus,
    errorMessage?: string
  ): Promise<WearableIntegration> {
    const integration = await this.findOne(userId, id);

    integration.status = status;

    if (errorMessage) {
      integration.syncStats.lastError = errorMessage;
      integration.syncStats.lastErrorAt = new Date();
    }

    if (status === IntegrationStatus.ACTIVE) {
      integration.lastSyncAt = new Date();
    }

    return this.wearableIntegrationRepository.save(integration);
  }

  async updateSyncStats(
    userId: number,
    id: number,
    stats: {
      successful?: boolean;
      dataPointsReceived?: number;
      dataPointsProcessed?: number;
      error?: string;
    }
  ): Promise<WearableIntegration> {
    const integration = await this.findOne(userId, id);

    integration.syncStats.totalSyncs++;

    if (stats.successful) {
      integration.syncStats.successfulSyncs++;
      integration.lastSyncAt = new Date();
      integration.status = IntegrationStatus.ACTIVE;
    } else {
      integration.syncStats.failedSyncs++;
      if (stats.error) {
        integration.syncStats.lastError = stats.error;
        integration.syncStats.lastErrorAt = new Date();
      }
    }

    if (stats.dataPointsReceived) {
      integration.syncStats.dataPointsReceived += stats.dataPointsReceived;
    }

    if (stats.dataPointsProcessed) {
      integration.syncStats.dataPointsProcessed += stats.dataPointsProcessed;
    }

    return this.wearableIntegrationRepository.save(integration);
  }

  async getIntegrationSummary(userId: number): Promise<any> {
    const integrations = await this.findAll(userId);

    const summary = {
      totalIntegrations: integrations.length,
      activeIntegrations: integrations.filter(
        (i) => i.status === IntegrationStatus.ACTIVE
      ).length,
      pendingIntegrations: integrations.filter(
        (i) => i.status === IntegrationStatus.PENDING_SETUP
      ).length,
      errorIntegrations: integrations.filter(
        (i) => i.status === IntegrationStatus.ERROR
      ).length,
      integrationsByProvider: {},
      totalDataPoints: 0,
      lastSync: null,
      syncFrequency: {},
    };

    // Group by provider and sync frequency
    integrations.forEach((integration) => {
      if (!summary.integrationsByProvider[integration.provider]) {
        summary.integrationsByProvider[integration.provider] = 0;
      }
      summary.integrationsByProvider[integration.provider]++;

      if (!summary.syncFrequency[integration.syncFrequency]) {
        summary.syncFrequency[integration.syncFrequency] = 0;
      }
      summary.syncFrequency[integration.syncFrequency]++;

      // Find most recent sync
      if (
        integration.lastSyncAt &&
        (!summary.lastSync || integration.lastSyncAt > summary.lastSync)
      ) {
        summary.lastSync = integration.lastSyncAt;
      }

      // Sum up data points
      summary.totalDataPoints += integration.syncStats?.dataPointsReceived || 0;
    });

    return summary;
  }

  async getProviderConfig(provider: string): Promise<any> {
    // In a real implementation, this would return configuration from environment variables or config files
    const providerConfigs = {
      fitbit: {
        name: 'Fitbit',
        description:
          'Connect your Fitbit device to track steps, heart rate, sleep, and more',
        logo: '/images/providers/fitbit.png',
        supportedMetrics: [
          'steps',
          'heart_rate',
          'sleep',
          'calories',
          'distance',
          'weight',
        ],
        oauthUrl: 'https://www.fitbit.com/oauth2/authorize',
        tokenUrl: 'https://api.fitbit.com/oauth2/token',
        scope: ['activity', 'heartrate', 'sleep', 'profile', 'weight'],
        rateLimit: 150,
        rateLimitWindow: 3600,
      },
      apple_health: {
        name: 'Apple Health',
        description:
          'Connect to Apple Health to access your health and fitness data',
        logo: '/images/providers/apple-health.png',
        supportedMetrics: [
          'steps',
          'heart_rate',
          'sleep',
          'calories',
          'distance',
          'weight',
          'blood_pressure',
        ],
        oauthUrl: 'https://health.apple.com/oauth/authorize',
        tokenUrl: 'https://health.apple.com/oauth/token',
        scope: ['health.read', 'health.write'],
        rateLimit: 1000,
        rateLimitWindow: 3600,
      },
      google_fit: {
        name: 'Google Fit',
        description:
          'Connect to Google Fit to sync your fitness activities and health data',
        logo: '/images/providers/google-fit.png',
        supportedMetrics: [
          'steps',
          'heart_rate',
          'sleep',
          'calories',
          'distance',
          'weight',
        ],
        oauthUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: [
          'https://www.googleapis.com/auth/fitness.activity.read',
          'https://www.googleapis.com/auth/fitness.body.read',
        ],
        rateLimit: 1000,
        rateLimitWindow: 3600,
      },
      garmin: {
        name: 'Garmin',
        description:
          'Connect your Garmin device to track activities, heart rate, and sleep',
        logo: '/images/providers/garmin.png',
        supportedMetrics: [
          'steps',
          'heart_rate',
          'sleep',
          'calories',
          'distance',
          'weight',
        ],
        oauthUrl: 'https://connect.garmin.com/oauthConfirm',
        tokenUrl: 'https://connect.garmin.com/oauth/token',
        scope: ['activity', 'heartrate', 'sleep', 'profile'],
        rateLimit: 100,
        rateLimitWindow: 3600,
      },
      oura: {
        name: 'Oura Ring',
        description:
          'Connect your Oura Ring to track sleep, recovery, and readiness',
        logo: '/images/providers/oura.png',
        supportedMetrics: ['sleep', 'heart_rate', 'temperature', 'activity'],
        oauthUrl: 'https://cloud.ouraring.com/oauth/authorize',
        tokenUrl: 'https://cloud.ouraring.com/oauth/token',
        scope: ['daily', 'heartrate', 'session'],
        rateLimit: 100,
        rateLimitWindow: 3600,
      },
    };

    return providerConfigs[provider] || null;
  }

  async getAvailableProviders(): Promise<string[]> {
    return [
      'fitbit',
      'apple_health',
      'google_fit',
      'garmin',
      'oura',
      'samsung_health',
      'withings',
      'peloton',
      'strava',
    ];
  }

  async refreshToken(userId: number, id: number): Promise<WearableIntegration> {
    const integration = await this.findOne(userId, id);

    // In a real implementation, this would call the provider's API to refresh the token
    // For now, we'll just simulate a successful refresh

    if (integration.accessTokens?.refreshToken) {
      // Simulate token refresh
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 30); // 30 days from now

      integration.accessTokens.expiresAt = newExpiresAt;
      integration.status = IntegrationStatus.ACTIVE;

      return this.wearableIntegrationRepository.save(integration);
    } else {
      throw new BadRequestException('No refresh token available');
    }
  }

  async testConnection(
    userId: number,
    id: number
  ): Promise<{ success: boolean; message: string }> {
    const integration = await this.findOne(userId, id);

    // In a real implementation, this would test the connection to the provider's API
    // For now, we'll simulate a connection test

    if (integration.status === IntegrationStatus.ACTIVE) {
      return { success: true, message: 'Connection successful' };
    } else if (integration.status === IntegrationStatus.PENDING_SETUP) {
      return { success: false, message: 'Integration not yet configured' };
    } else {
      return { success: false, message: 'Connection failed' };
    }
  }
}
