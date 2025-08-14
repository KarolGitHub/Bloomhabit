import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { HabitLog } from './habit-log.entity';

export enum HabitCategory {
  HEALTH = 'health',
  FITNESS = 'fitness',
  LEARNING = 'learning',
  PRODUCTIVITY = 'productivity',
  MINDFULNESS = 'mindfulness',
  CREATIVITY = 'creativity',
  SOCIAL = 'social',
  FINANCE = 'finance',
  OTHER = 'other',
}

export enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum FlowerType {
  SUNFLOWER = 'sunflower',
  ROSE = 'rose',
  TULIP = 'tulip',
  DAISY = 'daisy',
  LILY = 'lily',
  ORCHID = 'orchid',
  CACTUS = 'cactus',
  BONSAI = 'bonsai',
}

@Entity('habits')
export class Habit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

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

  @Column({
    type: 'enum',
    enum: FlowerType,
    default: FlowerType.DAISY,
  })
  flowerType: FlowerType;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.habits)
  user: User;

  @OneToMany(() => HabitLog, (habitLog) => habitLog.habit)
  habitLogs: HabitLog[];
}

