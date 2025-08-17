import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum SmartHomeProvider {
  PHILIPS_HUE = 'philips_hue',
  SMART_THINGS = 'smart_things',
  HOME_ASSISTANT = 'home_assistant',
  IFTTT = 'ifttt',
  ZAPIER = 'zapier',
  ALEXA = 'alexa',
  GOOGLE_HOME = 'google_home',
  APPLE_HOMEKIT = 'apple_homekit',
}

export enum SmartHomeDeviceType {
  LIGHT = 'light',
  SWITCH = 'switch',
  SENSOR = 'sensor',
  THERMOSTAT = 'thermostat',
  LOCK = 'lock',
  CAMERA = 'camera',
  SPEAKER = 'speaker',
  APPLIANCE = 'appliance',
  WEARABLE = 'wearable',
}

export enum SmartHomeTriggerType {
  HABIT_START = 'habit_start',
  HABIT_COMPLETE = 'habit_complete',
  HABIT_MISSED = 'habit_missed',
  GOAL_ACHIEVED = 'goal_achieved',
  STREAK_MILESTONE = 'streak_milestone',
  TIME_BASED = 'time_based',
  LOCATION_BASED = 'location_based',
  CONDITION_BASED = 'condition_based',
}

export enum SmartHomeActionType {
  TURN_ON = 'turn_on',
  TURN_OFF = 'turn_off',
  TOGGLE = 'toggle',
  SET_COLOR = 'set_color',
  SET_BRIGHTNESS = 'set_brightness',
  SET_TEMPERATURE = 'set_temperature',
  PLAY_SOUND = 'play_sound',
  SEND_NOTIFICATION = 'send_notification',
  RECORD_VIDEO = 'record_video',
  LOCK_UNLOCK = 'lock_unlock',
}

@Entity('smart_home_integrations')
@Index(['userId', 'provider'])
@Index(['provider', 'externalAccountId'])
export class SmartHomeIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: SmartHomeProvider,
  })
  provider: SmartHomeProvider;

  @Column()
  externalAccountId: string;

  @Column()
  accountName: string;

  @Column({ nullable: true })
  accountDescription?: string;

  @Column({ nullable: true })
  accountIcon?: string;

  @Column({ type: 'jsonb', nullable: true })
  credentials: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    scope?: string[];
    apiKey?: string;
    webhookUrl?: string;
    deviceToken?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  devices: {
    id: string;
    name: string;
    type: SmartHomeDeviceType;
    capabilities: string[];
    room?: string;
    isOnline: boolean;
    lastSeen?: Date;
    metadata?: Record<string, any>;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  automationRules: {
    id: string;
    name: string;
    description?: string;
    triggerType: SmartHomeTriggerType;
    triggerConditions: {
      habitId?: string;
      goalId?: string;
      time?: string;
      location?: string;
      conditions?: Record<string, any>;
    };
    actions: {
      deviceId: string;
      actionType: SmartHomeActionType;
      parameters?: Record<string, any>;
      delay?: number; // seconds
    }[];
    isActive: boolean;
    priority: number;
    lastTriggered?: Date;
    triggerCount: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    lastSyncAt?: Date;
    syncErrors?: string[];
    deviceCount?: number;
    automationCount?: number;
    accountUrl?: string;
    permissions?: string[];
    webhookEndpoint?: string;
    supportedFeatures?: string[];
  };

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextSyncAt?: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
