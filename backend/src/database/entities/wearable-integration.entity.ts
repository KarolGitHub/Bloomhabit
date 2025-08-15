import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_SETUP = 'pending_setup',
  ERROR = 'error',
  RATE_LIMITED = 'rate_limited',
  MAINTENANCE = 'maintenance',
}

export enum SyncFrequency {
  REAL_TIME = 'real_time',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MANUAL = 'manual',
}

@Entity('wearable_integrations')
@Index(['userId', 'provider'], { unique: true })
export class WearableIntegration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  provider: string;

  @Column({
    type: 'enum',
    enum: IntegrationStatus,
    default: IntegrationStatus.PENDING_SETUP,
  })
  status: IntegrationStatus;

  @Column({
    type: 'enum',
    enum: SyncFrequency,
    default: SyncFrequency.DAILY,
  })
  syncFrequency: SyncFrequency;

  @Column({ type: 'jsonb', nullable: true })
  oauthConfig: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string[];
    authUrl: string;
    tokenUrl: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  accessTokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scope: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  syncSettings: {
    enabledMetrics: string[];
    syncHistory: boolean;
    maxHistoryDays: number;
    autoSync: boolean;
    notifications: boolean;
    dataRetention: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  apiLimits: {
    rateLimit: number;
    rateLimitWindow: number;
    dailyQuota: number;
    monthlyQuota: number;
    lastReset: Date;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextSyncAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  syncStats: {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    lastError: string;
    lastErrorAt: Date;
    dataPointsReceived: number;
    dataPointsProcessed: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  webhookConfig: {
    enabled: boolean;
    url: string;
    events: string[];
    secret: string;
    lastWebhookAt: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
