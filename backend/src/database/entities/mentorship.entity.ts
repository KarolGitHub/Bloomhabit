import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Habit } from './habit.entity';

export enum MentorshipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum MentorshipType {
  HABIT_COACHING = 'habit_coaching',
  GOAL_ACHIEVEMENT = 'goal_achievement',
  LIFESTYLE_CHANGE = 'lifestyle_change',
  SKILL_DEVELOPMENT = 'skill_development',
  WELLNESS_GUIDANCE = 'wellness_guidance',
  PRODUCTIVITY = 'productivity',
}

export enum MentorshipLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Entity('mentorships')
@Index(['mentorId', 'menteeId'], { unique: true })
@Index(['status', 'type'])
@Index(['mentorId'])
@Index(['menteeId'])
export class Mentorship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'mentor_id' })
  mentorId: number;

  @Column({ name: 'mentee_id' })
  menteeId: number;

  @Column({
    type: 'enum',
    enum: MentorshipStatus,
    default: MentorshipStatus.PENDING,
  })
  status: MentorshipStatus;

  @Column({
    type: 'enum',
    enum: MentorshipType,
  })
  type: MentorshipType;

  @Column({
    type: 'enum',
    enum: MentorshipLevel,
    default: MentorshipLevel.BEGINNER,
  })
  level: MentorshipLevel;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  goals: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  expectations: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  schedule: Record<string, any>;

  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ name: 'last_session_at', type: 'timestamp', nullable: true })
  lastSessionAt: Date;

  @Column({ name: 'next_session_at', type: 'timestamp', nullable: true })
  nextSessionAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentor_id' })
  mentor: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentee_id' })
  mentee: User;

  @OneToMany(() => MentorshipSession, (session) => session.mentorship)
  sessions: MentorshipSession[];
}

@Entity('mentorship_sessions')
@Index(['mentorshipId', 'scheduledAt'])
@Index(['mentorId', 'menteeId'])
export class MentorshipSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'mentorship_id' })
  mentorshipId: number;

  @Column({ name: 'mentor_id' })
  mentorId: number;

  @Column({ name: 'mentee_id' })
  menteeId: number;

  @Column({ name: 'scheduled_at', type: 'timestamp' })
  scheduledAt: Date;

  @Column({ name: 'duration_minutes', default: 60 })
  durationMinutes: number;

  @Column({ type: 'text', nullable: true })
  agenda: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  outcomes: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Mentorship, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentorship_id' })
  mentorship: Mentorship;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentor_id' })
  mentor: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentee_id' })
  mentee: User;
}
