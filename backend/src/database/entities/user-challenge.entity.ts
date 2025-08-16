import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Challenge } from './challenge.entity';

export enum UserChallengeStatus {
  JOINED = 'joined',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ABANDONED = 'abandoned',
}

@Entity('user_challenges')
@Index(['userId', 'challengeId'], { unique: true })
export class UserChallenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  challengeId: number;

  @Column({
    type: 'enum',
    enum: UserChallengeStatus,
    default: UserChallengeStatus.JOINED,
  })
  status: UserChallengeStatus;

  @Column({ type: 'timestamp' })
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number; // 0.00 to 1.00

  @Column({ type: 'json', nullable: true })
  progressData: {
    currentStreak?: number;
    totalCompletions?: number;
    perfectDays?: number;
    habitCount?: number;
    socialScore?: number;
    customMetrics?: Record<string, any>;
  };

  @Column({ type: 'boolean', default: false })
  isRewarded: boolean;

  @Column({ type: 'timestamp', nullable: true })
  rewardedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.userChallenges)
  user: User;

  @ManyToOne(() => Challenge, (challenge) => challenge.userChallenges)
  challenge: Challenge;
}

