import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Habit } from './habit.entity';
import { User } from './user.entity';

export enum HabitLogStatus {
  COMPLETED = 'completed',
  PARTIAL = 'partial',
  MISSED = 'missed',
  SKIPPED = 'skipped',
}

@Entity('habit_logs')
@Index(['userId', 'habitId', 'date'], { unique: true })
export class HabitLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  habitId: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: HabitLogStatus,
    default: HabitLogStatus.MISSED,
  })
  status: HabitLogStatus;

  @Column({ type: 'int', default: 0 })
  completedCount: number;

  @Column({ type: 'int', nullable: true })
  targetCount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', default: 0 })
  streak: number;

  @Column({ type: 'boolean', default: false })
  isPerfectDay: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.habitLogs)
  user: User;

  @ManyToOne(() => Habit, (habit) => habit.habitLogs)
  habit: Habit;
}

