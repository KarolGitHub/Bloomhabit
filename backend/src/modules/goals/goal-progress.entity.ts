import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Goal } from './goal.entity';
import { User } from '../../users/user.entity';

@Entity('goal_progress')
export class GoalProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  goalId: number;

  @ManyToOne(() => Goal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goalId' })
  goal: Goal;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Progress Data
  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  previousValue: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  change: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  percentageChange: number;

  // Progress Context
  @Column('date')
  date: Date;

  @Column('text', { nullable: true })
  notes: string;

  @Column('int', { nullable: true })
  mood: number; // 1-10 scale

  @Column({ nullable: true })
  weather: string;

  @Column({ nullable: true })
  location: string;

  @Column('json', { nullable: true })
  context: {
    timeOfDay?: string;
    energyLevel?: number;
    stressLevel?: number;
    sleepQuality?: number;
    nutrition?: string;
    socialSupport?: boolean;
    distractions?: string[];
  };

  // Progress Validation
  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedBy: number;

  @Column('timestamp', { nullable: true })
  verifiedAt: Date;

  @Column('text', { nullable: true })
  verificationNotes: string;

  // Progress Type
  @Column({
    type: 'enum',
    enum: ['manual', 'automatic', 'habit_sync', 'milestone'],
    default: 'manual',
  })
  progressType: 'manual' | 'automatic' | 'habit_sync' | 'milestone';

  // Metadata
  @Column('json', { nullable: true })
  metadata: {
    source?: string;
    confidence?: number;
    tags?: string[];
    attachments?: string[];
  };

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
