import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { CommunityGarden } from './community-garden.entity';

export enum ChallengeType {
  STREAK = 'streak',
  COMPLETION = 'completion',
  CONSISTENCY = 'consistency',
  GROWTH = 'growth',
  TEAM = 'team',
}

export enum ChallengeStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

@Entity('group_challenges')
export class GroupChallenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ChallengeType,
    default: ChallengeType.STREAK,
  })
  type: ChallengeType;

  @Column({
    type: 'enum',
    enum: ChallengeStatus,
    default: ChallengeStatus.UPCOMING,
  })
  status: ChallengeStatus;

  @Column({
    type: 'enum',
    enum: ChallengeDifficulty,
    default: ChallengeDifficulty.MEDIUM,
  })
  difficulty: ChallengeDifficulty;

  @Column()
  communityGardenId: number;

  @Column()
  creatorId: number;

  @Column()
  targetValue: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: 0 })
  participantCount: number;

  @Column({ default: 0 })
  completionCount: number;

  @Column('json', { nullable: true })
  rewards: {
    title: string;
    description: string;
    type: 'badge' | 'points' | 'recognition';
  }[];

  @Column('json', { nullable: true })
  rules: string[];

  @Column({ default: false })
  isTeamChallenge: boolean;

  @Column({ nullable: true })
  maxTeamSize: number;

  @Column({ default: false })
  requiresVerification: boolean;

  @Column({ default: false })
  allowLateJoins: boolean;

  @Column('json', { nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => CommunityGarden, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'communityGardenId' })
  communityGarden: CommunityGarden;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'challenge_participants',
    joinColumn: { name: 'challengeId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  participants: User[];
}
