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

export enum TaskProvider {
  TODOIST = 'todoist',
  ASANA = 'asana',
  TRELLO = 'trello',
  NOTION = 'notion',
  MICROSOFT_TODO = 'microsoft_todo',
  CLICKUP = 'clickup',
  JIRA = 'jira',
  LINEAR = 'linear',
}

export enum TaskSyncStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ERROR = 'error',
  DISCONNECTED = 'disconnected',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

@Entity('task_integrations')
@Index(['userId', 'provider'])
@Index(['provider', 'externalProjectId'])
export class TaskIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: TaskProvider,
  })
  provider: TaskProvider;

  @Column()
  externalProjectId: string;

  @Column()
  projectName: string;

  @Column({ nullable: true })
  projectDescription?: string;

  @Column({ nullable: true })
  projectColor?: string;

  @Column({
    type: 'enum',
    enum: TaskSyncStatus,
    default: TaskSyncStatus.ACTIVE,
  })
  syncStatus: TaskSyncStatus;

  @Column({ type: 'jsonb', nullable: true })
  syncSettings: {
    syncTasks: boolean;
    syncSubtasks: boolean;
    syncComments: boolean;
    syncAttachments: boolean;
    autoCreateHabits: boolean;
    habitCreationRules: {
      taskDuration: number; // minutes
      frequency: string; // daily, weekly, monthly
      priorityThreshold: TaskPriority;
      tags: string[];
    };
    taskMapping: {
      statusMapping: Record<TaskStatus, string>;
      priorityMapping: Record<TaskPriority, number>;
      tagMapping: Record<string, string>;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  credentials: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    scope?: string[];
    apiKey?: string;
    workspaceId?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    lastSyncAt?: Date;
    syncErrors?: string[];
    taskCount?: number;
    projectUrl?: string;
    permissions?: string[];
    availableFields?: string[];
    customFields?: Record<string, any>;
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
