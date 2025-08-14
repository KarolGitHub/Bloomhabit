import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Habit } from '../../habits/habit.entity';

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

export enum GoalType {
  HABIT_BASED = 'habit_based',
  NUMERIC = 'numeric',
  TIME_BASED = 'time_based',
  MILESTONE = 'milestone',
  COMPOSITE = 'composite',
}

export enum GoalDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: GoalType,
    default: GoalType.HABIT_BASED,
  })
  type: GoalType;

  @Column({
    type: 'enum',
    enum: GoalStatus,
    default: GoalStatus.ACTIVE,
  })
  status: GoalStatus;

  @Column({
    type: 'enum',
    enum: GoalDifficulty,
    default: GoalDifficulty.MEDIUM,
  })
  difficulty: GoalDifficulty;

  @Column({
    type: 'enum',
    enum: GoalPriority,
    default: GoalPriority.MEDIUM,
  })
  priority: GoalPriority;

  // SMART Goal Attributes
  @Column('text', { nullable: true })
  specific: string; // Specific - What exactly do you want to achieve?

  @Column('text', { nullable: true })
  measurable: string; // Measurable - How will you measure progress?

  @Column('text', { nullable: true })
  achievable: string; // Achievable - Is this goal realistic?

  @Column('text', { nullable: true })
  relevant: string; // Relevant - Why is this goal important?

  @Column('text', { nullable: true })
  timeBound: string; // Time-bound - When do you want to achieve this?

  // Goal Configuration
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  targetValue: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  currentValue: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @Column('date')
  startDate: Date;

  @Column('date')
  targetDate: Date;

  @Column('date', { nullable: true })
  completedDate: Date;

  // Milestones and Sub-goals
  @Column('json', { nullable: true })
  milestones: {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    achievedValue: number;
    achievedAt?: Date;
    isCompleted: boolean;
  }[];

  @Column('json', { nullable: true })
  subGoals: {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    isCompleted: boolean;
    weight: number; // Percentage contribution to main goal
  }[];

  // Progress Tracking
  @Column('json', { nullable: true })
  progressHistory: {
    date: string;
    value: number;
    notes?: string;
    mood?: number;
    weather?: string;
  }[];

  @Column('json', { nullable: true })
  achievements: {
    id: string;
    title: string;
    description: string;
    type: string;
    achievedAt: Date;
    badge?: string;
  }[];

  // Relationships
  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToMany(() => Habit)
  @JoinTable({
    name: 'goal_habits',
    joinColumn: { name: 'goalId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'habitId', referencedColumnName: 'id' },
  })
  habits: Habit[];

  // Goal Settings
  @Column('json', { nullable: true })
  settings: {
    allowPartialProgress: boolean;
    requireVerification: boolean;
    autoAdjustTarget: boolean;
    reminderFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
    reminderTime?: string;
    showProgress: boolean;
    shareProgress: boolean;
  };

  // Tags and Categories
  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  category: string;

  // Motivation and Notes
  @Column('text', { nullable: true })
  motivation: string; // Why this goal matters

  @Column('text', { nullable: true })
  obstacles: string; // Potential challenges

  @Column('text', { nullable: true })
  strategies: string; // How to overcome obstacles

  @Column('text', { nullable: true })
  notes: string;

  // Statistics
  @Column('int', { default: 0 })
  streakDays: number;

  @Column('int', { default: 0 })
  longestStreak: number;

  @Column('int', { default: 0 })
  totalSessions: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  averageDailyProgress: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  consistencyScore: number;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('timestamp', { nullable: true })
  lastActivityAt: Date;
}
