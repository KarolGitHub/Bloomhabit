import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserChallenge } from './user-challenge.entity';

export enum ChallengeType {
  STREAK = 'streak',
  COMPLETION = 'completion',
  PERFECT_DAYS = 'perfect_days',
  HABIT_CREATION = 'habit_creation',
  SOCIAL = 'social',
  TIME_BASED = 'time_based',
  MILESTONE = 'milestone',
}

export enum ChallengeStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ChallengeType,
  })
  type: ChallengeType;

  @Column({
    type: 'enum',
    enum: ChallengeDifficulty,
    default: ChallengeDifficulty.MEDIUM,
  })
  difficulty: ChallengeDifficulty;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'int', default: 0 })
  maxParticipants: number;

  @Column({ type: 'int', default: 0 })
  currentParticipants: number;

  @Column({
    type: 'enum',
    enum: ChallengeStatus,
    default: ChallengeStatus.UPCOMING,
  })
  status: ChallengeStatus;

  @Column({ type: 'json' })
  requirements: {
    habitId?: number;
    habitCategory?: string;
    streakDays?: number;
    completionCount?: number;
    perfectDays?: number;
    habitCount?: number;
    socialConnections?: number;
    customCondition?: string;
  };

  @Column({ type: 'json' })
  rewards: {
    points: number;
    badge?: string;
    achievement?: string;
    specialReward?: string;
  };

  @Column({ type: 'text', nullable: true })
  icon: string;

  @Column({ type: 'text', nullable: true })
  bannerImage: string;

  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'text', nullable: true })
  recurrencePattern: string; // Cron-like pattern for recurring challenges

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => UserChallenge, (userChallenge) => userChallenge.challenge)
  userChallenges: UserChallenge[];
}

