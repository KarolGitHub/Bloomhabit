import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserAchievement } from './user-achievement.entity';

export enum AchievementType {
  STREAK = 'streak',
  COMPLETION = 'completion',
  PERFECT_DAY = 'perfect_day',
  HABIT_CREATION = 'habit_creation',
  MILESTONE = 'milestone',
  SOCIAL = 'social',
  SPECIAL = 'special',
}

export enum AchievementTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: AchievementType,
  })
  type: AchievementType;

  @Column({
    type: 'enum',
    enum: AchievementTier,
    default: AchievementTier.BRONZE,
  })
  tier: AchievementTier;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'text', nullable: true })
  icon: string;

  @Column({ type: 'text', nullable: true })
  badgeImage: string;

  @Column({ type: 'json', nullable: true })
  criteria: {
    habitId?: number;
    habitCategory?: string;
    streakDays?: number;
    completionCount?: number;
    perfectDays?: number;
    habitCount?: number;
    socialConnections?: number;
    customCondition?: string;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isHidden: boolean;

  @Column({ type: 'int', default: 0 })
  rarity: number; // Percentage of users who have this achievement

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(
    () => UserAchievement,
    (userAchievement) => userAchievement.achievement
  )
  userAchievements: UserAchievement[];
}

