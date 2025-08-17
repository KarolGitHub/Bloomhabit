import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Habit } from './habit.entity';

export enum ChallengeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ChallengeType {
  STREAK = 'streak',
  FREQUENCY = 'frequency',
  GOAL_ACHIEVEMENT = 'goal_achievement',
  TEAM_COMPETITION = 'team_competition',
  INDIVIDUAL_IMPROVEMENT = 'individual_improvement',
  COMMUNITY_CHALLENGE = 'community_challenge',
}

export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export enum ParticipantStatus {
  INVITED = 'invited',
  JOINED = 'joined',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}

@Entity('social_challenges')
@Index(['name'], { unique: true })
@Index(['status', 'type'])
@Index(['creatorId'])
@Index(['startDate', 'endDate'])
export class SocialChallenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
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

  @Column({ name: 'creator_id' })
  creatorId: number;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ChallengeStatus,
    default: ChallengeStatus.DRAFT,
  })
  status: ChallengeStatus;

  @Column({ name: 'max_participants', default: 100 })
  maxParticipants: number;

  @Column({ name: 'current_participants', default: 0 })
  currentParticipants: number;

  @Column({ type: 'jsonb', nullable: true })
  rules: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  rewards: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  criteria: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ name: 'registration_deadline', type: 'timestamp', nullable: true })
  registrationDeadline: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToMany(() => ChallengeParticipant, (participant) => participant.challenge)
  participants: ChallengeParticipant[];

  @ManyToMany(() => Habit)
  @JoinTable({
    name: 'challenge_habits',
    joinColumn: { name: 'challenge_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'habit_id', referencedColumnName: 'id' },
  })
  habits: Habit[];
}

@Entity('challenge_participants')
@Index(['challengeId', 'userId'], { unique: true })
@Index(['userId', 'status'])
@Index(['challengeId', 'status'])
export class ChallengeParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'challenge_id' })
  challengeId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.INVITED,
  })
  status: ParticipantStatus;

  @Column({
    name: 'joined_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joinedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'score', default: 0 })
  score: number;

  @Column({ name: 'progress_percentage', default: 0 })
  progressPercentage: number;

  @Column({ type: 'jsonb', nullable: true })
  achievements: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => SocialChallenge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challenge_id' })
  challenge: SocialChallenge;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
