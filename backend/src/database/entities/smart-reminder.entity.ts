import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Habit } from './habit.entity';
import { Goal } from './goal.entity';
import {
  ReminderType,
  ReminderFrequency,
  ReminderStatus,
  ReminderPriority,
} from '../../modules/ai-enhanced/dto/smart-reminders.dto';

@Entity('smart_reminders')
export class SmartReminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ReminderType,
    default: ReminderType.HABIT_REMINDER,
  })
  reminderType: ReminderType;

  @Column({
    type: 'enum',
    enum: ReminderFrequency,
    default: ReminderFrequency.ONCE,
  })
  frequency: ReminderFrequency;

  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.SCHEDULED,
  })
  status: ReminderStatus;

  @Column({ type: 'uuid', nullable: true })
  habitId?: string;

  @Column({ type: 'uuid', nullable: true })
  goalId?: string;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({
    type: 'enum',
    enum: ReminderPriority,
    default: ReminderPriority.MEDIUM,
  })
  priority: ReminderPriority;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  actedUponAt?: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  openRate?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  actionRate?: number;

  @Column({ type: 'jsonb', nullable: true })
  aiOptimization?: Record<string, any>;

  @Column({ type: 'text', array: true, nullable: true })
  aiSuggestions?: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  aiConfidence?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.smartReminders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Habit, { nullable: true })
  @JoinColumn({ name: 'habitId' })
  habit?: Habit;

  @ManyToOne(() => Goal, { nullable: true })
  @JoinColumn({ name: 'goalId' })
  goal?: Goal;
}
