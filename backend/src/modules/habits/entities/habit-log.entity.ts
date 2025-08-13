import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Habit } from './habit.entity';

export enum LogType {
  COMPLETED = 'completed',
  MISSED = 'missed',
  PARTIAL = 'partial',
  SKIPPED = 'skipped',
}

@Entity('habit_logs')
export class HabitLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: LogType,
    default: LogType.COMPLETED,
  })
  type: LogType;

  @Column({ type: 'date' })
  @Index()
  logDate: Date;

  @Column({ type: 'int', default: 1 })
  count: number; // How many times the habit was completed on this date

  @Column({ nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    timeOfDay?: string;
    location?: string;
    mood?: string;
    difficulty?: number; // 1-5 scale
  };

  @ManyToOne(() => Habit, (habit) => habit.logs, { onDelete: 'CASCADE' })
  habit: Habit;

  @Column()
  @Index()
  habitId: string;

  @CreateDateColumn()
  createdAt: Date;

  // Virtual properties
  get isCompleted(): boolean {
    return this.type === LogType.COMPLETED;
  }

  get isMissed(): boolean {
    return this.type === LogType.MISSED;
  }

  get isPartial(): boolean {
    return this.type === LogType.PARTIAL;
  }

  get isSkipped(): boolean {
    return this.type === LogType.SKIPPED;
  }
}
