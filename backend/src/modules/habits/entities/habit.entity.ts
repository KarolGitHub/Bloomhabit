import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { HabitLog } from './habit-log.entity';

export enum HabitCategory {
  HEALTH = 'health',
  FITNESS = 'fitness',
  PRODUCTIVITY = 'productivity',
  LEARNING = 'learning',
  RELATIONSHIPS = 'relationships',
  FINANCE = 'finance',
  CREATIVITY = 'creativity',
  MINDFULNESS = 'mindfulness',
  OTHER = 'other',
}

export enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum FlowerType {
  ROSE = 'rose',
  SUNFLOWER = 'sunflower',
  TULIP = 'tulip',
  DAISY = 'daisy',
  LILY = 'lily',
  ORCHID = 'orchid',
  CACTUS = 'cactus',
  BAMBOO = 'bamboo',
}

@Entity('habits')
export class Habit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: HabitCategory,
    default: HabitCategory.OTHER,
  })
  category: HabitCategory;

  @Column({
    type: 'enum',
    enum: HabitFrequency,
    default: HabitFrequency.DAILY,
  })
  frequency: HabitFrequency;

  @Column({ type: 'int', default: 1 })
  targetCount: number;

  @Column({ type: 'int', default: 0 })
  currentStreak: number;

  @Column({ type: 'int', default: 0 })
  longestStreak: number;

  @Column({ type: 'int', default: 0 })
  totalCompletions: number;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublic: boolean;

  // Garden metaphor properties
  @Column({
    type: 'enum',
    enum: FlowerType,
    default: FlowerType.ROSE,
  })
  flowerType: FlowerType;

  @Column({ type: 'int', default: 1 })
  growthStage: number; // 1-5: seed, sprout, growing, blooming, fully bloomed

  @Column({ type: 'int', default: 100 })
  healthPoints: number; // 0-100, decreases when missed

  @Column({ type: 'int', default: 0 })
  waterLevel: number; // 0-100, increases with completions

  @Column({ type: 'jsonb', nullable: true })
  customSchedule?: {
    daysOfWeek?: number[];
    customInterval?: number;
    timeOfDay?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  reminders?: {
    enabled: boolean;
    time?: string;
    days?: number[];
  };

  @ManyToOne(() => User, (user) => user.habits, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  @Index()
  userId: string;

  @OneToMany(() => HabitLog, (log) => log.habit)
  logs: HabitLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties for garden visualization
  get isBlooming(): boolean {
    return this.growthStage >= 4 && this.healthPoints > 80;
  }

  get isGrowing(): boolean {
    return this.growthStage >= 2 && this.growthStage < 4;
  }

  get isWilting(): boolean {
    return this.healthPoints < 50;
  }

  get needsWater(): boolean {
    return this.waterLevel < 30;
  }

  get progressPercentage(): number {
    if (!this.startDate) return 0;
    const totalDays = this.endDate
      ? Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 30; // Default to 30 days if no end date
    return Math.min((this.totalCompletions / (totalDays * this.targetCount)) * 100, 100);
  }
}
