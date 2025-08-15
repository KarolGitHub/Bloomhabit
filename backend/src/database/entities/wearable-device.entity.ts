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

export enum WearableProvider {
  FITBIT = 'fitbit',
  APPLE_HEALTH = 'apple_health',
  GOOGLE_FIT = 'google_fit',
  GARMIN = 'garmin',
  OURA = 'oura',
  SAMSUNG_HEALTH = 'samsung_health',
  WITHINGS = 'withings',
  PELOTON = 'peloton',
  STRAVA = 'strava',
  CUSTOM = 'custom',
}

export enum WearableType {
  FITNESS_TRACKER = 'fitness_tracker',
  SMARTWATCH = 'smartwatch',
  HEART_RATE_MONITOR = 'heart_rate_monitor',
  SLEEP_TRACKER = 'sleep_tracker',
  ACTIVITY_TRACKER = 'activity_tracker',
  WEIGHT_SCALE = 'weight_scale',
  BLOOD_PRESSURE_MONITOR = 'blood_pressure_monitor',
  GLUCOSE_MONITOR = 'glucose_monitor',
  OXYGEN_SATURATION_MONITOR = 'oxygen_saturation_monitor',
  TEMPERATURE_MONITOR = 'temperature_monitor',
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending',
  ERROR = 'error',
  EXPIRED = 'expired',
}

@Entity('wearable_devices')
@Index(['userId', 'provider'], { unique: true })
@Index(['provider', 'externalDeviceId'])
export class WearableDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: WearableProvider,
  })
  provider: WearableProvider;

  @Column({
    type: 'enum',
    enum: WearableType,
  })
  type: WearableType;

  @Column()
  name: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  externalDeviceId: string;

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.PENDING,
  })
  status: ConnectionStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  capabilities: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastDataReceivedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  authTokens: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  tokenExpiresAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  syncSettings: {
    steps: boolean;
    heartRate: boolean;
    sleep: boolean;
    calories: boolean;
    distance: boolean;
    weight: boolean;
    bloodPressure: boolean;
    glucose: boolean;
    oxygenSaturation: boolean;
    temperature: boolean;
    customMetrics: string[];
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
