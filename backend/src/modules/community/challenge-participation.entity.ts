import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { GroupChallenge } from './group-challenge.entity';

export enum ParticipationStatus {
  JOINED = 'joined',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  WITHDRAWN = 'withdrawn',
}

@Entity('challenge_participations')
export class ChallengeParticipation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  challengeId: number;

  @Column({
    type: 'enum',
    enum: ParticipationStatus,
    default: ParticipationStatus.JOINED,
  })
  status: ParticipationStatus;

  @Column({ default: 0 })
  currentValue: number;

  @Column({ default: 0 })
  bestValue: number;

  @Column({ default: 0 })
  streak: number;

  @Column({ default: 0 })
  longestStreak: number;

  @Column({ default: 0 })
  completionRate: number;

  @Column({ nullable: true })
  joinedAt: Date;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  lastActivityAt: Date;

  @Column('json', { nullable: true })
  milestones: {
    title: string;
    description: string;
    achievedAt: Date;
    value: number;
  }[];

  @Column('json', { nullable: true })
  notes: string[];

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedBy: number;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column('json', { nullable: true })
  achievements: {
    title: string;
    description: string;
    type: string;
    achievedAt: Date;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => GroupChallenge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challengeId' })
  challenge: GroupChallenge;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'verifiedBy' })
  verifier: User;
}
