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

export enum HabitShareStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export enum HabitSharePermission {
  VIEW = 'view',
  COMMENT = 'comment',
  SUPPORT = 'support',
  FULL_ACCESS = 'full_access',
}

@Entity('habit_shares')
@Index(['habitId', 'sharedWithId'], { unique: true })
export class HabitShare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'habit_id' })
  habitId: number;

  @Column({ name: 'shared_by_id' })
  sharedById: number;

  @Column({ name: 'shared_with_id' })
  sharedWithId: number;

  @Column({
    type: 'enum',
    enum: HabitShareStatus,
    default: HabitShareStatus.ACTIVE,
  })
  status: HabitShareStatus;

  @Column({
    type: 'enum',
    enum: HabitSharePermission,
    default: HabitSharePermission.VIEW,
  })
  permission: HabitSharePermission;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({
    name: 'shared_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  sharedAt: Date;

  @Column({ name: 'last_viewed_at', type: 'timestamp', nullable: true })
  lastViewedAt: Date;

  @Column({ name: 'last_interaction_at', type: 'timestamp', nullable: true })
  lastInteractionAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Habit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'habit_id' })
  habit: Habit;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_by_id' })
  sharedBy: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shared_with_id' })
  sharedWith: User;
}
