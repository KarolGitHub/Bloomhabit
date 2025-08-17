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

export enum CalendarProvider {
  GOOGLE = 'google',
  OUTLOOK = 'outlook',
  APPLE = 'apple',
  CALDAV = 'caldav',
  ICS = 'ics',
}

export enum CalendarSyncStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ERROR = 'error',
  DISCONNECTED = 'disconnected',
}

export enum CalendarEventType {
  HABIT_REMINDER = 'habit_reminder',
  HABIT_SESSION = 'habit_session',
  GOAL_DEADLINE = 'goal_deadline',
  MILESTONE = 'milestone',
  CUSTOM = 'custom',
}

@Entity('calendar_integrations')
@Index(['userId', 'provider'])
@Index(['provider', 'externalCalendarId'])
export class CalendarIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: CalendarProvider,
  })
  provider: CalendarProvider;

  @Column()
  externalCalendarId: string;

  @Column()
  calendarName: string;

  @Column({ nullable: true })
  calendarDescription?: string;

  @Column({ nullable: true })
  calendarColor?: string;

  @Column({ nullable: true })
  timezone?: string;

  @Column({
    type: 'enum',
    enum: CalendarSyncStatus,
    default: CalendarSyncStatus.ACTIVE,
  })
  syncStatus: CalendarSyncStatus;

  @Column({ type: 'jsonb', nullable: true })
  syncSettings: {
    syncHabits: boolean;
    syncGoals: boolean;
    syncMilestones: boolean;
    syncReminders: boolean;
    autoCreateEvents: boolean;
    eventDuration: number; // minutes
    bufferTime: number; // minutes before/after
    workingHours: {
      start: string; // HH:mm
      end: string; // HH:mm
      days: number[]; // 0-6 (Sunday-Saturday)
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  credentials: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    scope?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    lastSyncAt?: Date;
    syncErrors?: string[];
    eventCount?: number;
    calendarUrl?: string;
    permissions?: string[];
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
