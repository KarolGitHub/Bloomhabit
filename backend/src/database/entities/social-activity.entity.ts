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
import { Habit } from './habit.entity';
import { HabitLog } from './habit-log.entity';

export enum ActivityType {
  LIKE = 'like',
  COMMENT = 'comment',
  SUPPORT = 'support',
  CHEER = 'cheer',
  MILESTONE = 'milestone',
  STREAK = 'streak',
  GOAL_ACHIEVEMENT = 'goal_achievement',
}

export enum ActivityStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  HIDDEN = 'hidden',
}

@Entity('social_activities')
@Index(['userId', 'targetType', 'targetId'])
@Index(['targetType', 'targetId'])
export class SocialActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type: ActivityType;

  @Column({ name: 'target_type' })
  targetType: string; // 'habit', 'habit_log', 'goal', etc.

  @Column({ name: 'target_id' })
  targetId: number;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.ACTIVE,
  })
  status: ActivityStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'interaction_count', default: 0 })
  interactionCount: number;

  @Column({ name: 'last_interaction_at', type: 'timestamp', nullable: true })
  lastInteractionAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Habit, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'target_id' })
  habit: Habit;

  @ManyToOne(() => HabitLog, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'target_id' })
  habitLog: HabitLog;
}
