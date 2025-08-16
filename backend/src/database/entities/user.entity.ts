import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Habit } from './habit.entity';
import { HabitLog } from './habit-log.entity';
import { UserAchievement } from './user-achievement.entity';
import { LeaderboardEntry } from './leaderboard-entry.entity';
import { UserChallenge } from './user-challenge.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  oauthProvider: string;

  @Column({ nullable: true })
  oauthProviderId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  // Gamification fields
  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ type: 'int', default: 0 })
  experience: number;

  @Column({ type: 'int', default: 0 })
  totalStreak: number;

  @Column({ type: 'int', default: 0 })
  currentStreak: number;

  @Column({ type: 'int', default: 0 })
  perfectDays: number;

  @Column({ type: 'int', default: 0 })
  achievementsUnlocked: number;

  @Column({ type: 'text', nullable: true })
  title: string; // Custom title earned through achievements

  @Column({ type: 'text', nullable: true })
  avatarFrame: string; // Special avatar frame earned through achievements

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Habit, (habit) => habit.user)
  habits: Habit[];

  @OneToMany(() => HabitLog, (habitLog) => habitLog.user)
  habitLogs: HabitLog[];

  @OneToMany(() => UserAchievement, (userAchievement) => userAchievement.user)
  userAchievements: UserAchievement[];

  @OneToMany(
    () => LeaderboardEntry,
    (leaderboardEntry) => leaderboardEntry.user
  )
  leaderboardEntries: LeaderboardEntry[];

  @OneToMany(() => UserChallenge, (userChallenge) => userChallenge.user)
  userChallenges: UserChallenge[];
}
