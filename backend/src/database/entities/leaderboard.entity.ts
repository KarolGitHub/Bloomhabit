import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { LeaderboardEntry } from './leaderboard-entry.entity';

export enum LeaderboardType {
  GLOBAL = 'global',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SEASONAL = 'seasonal',
  EVENT = 'event',
  CATEGORY = 'category',
}

export enum LeaderboardMetric {
  POINTS = 'points',
  STREAK = 'streak',
  COMPLETION_RATE = 'completion_rate',
  PERFECT_DAYS = 'perfect_days',
  HABIT_COUNT = 'habit_count',
  ACHIEVEMENTS = 'achievements',
  SOCIAL_ENGAGEMENT = 'social_engagement',
}

@Entity('leaderboards')
export class Leaderboard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: LeaderboardType,
  })
  type: LeaderboardType;

  @Column({
    type: 'enum',
    enum: LeaderboardMetric,
  })
  metric: LeaderboardMetric;

  @Column({ type: 'int', nullable: true })
  habitCategoryId: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'int', default: 100 })
  maxEntries: number;

  @Column({ type: 'json', nullable: true })
  rewards: {
    firstPlace?: { points: number; badge?: string };
    secondPlace?: { points: number; badge?: string };
    thirdPlace?: { points: number; badge?: string };
    participation?: { points: number; badge?: string };
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => LeaderboardEntry, (entry) => entry.leaderboard)
  entries: LeaderboardEntry[];
}

