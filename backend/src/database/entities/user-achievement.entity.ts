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
import { Achievement } from './achievement.entity';

@Entity('user_achievements')
@Index(['userId', 'achievementId'], { unique: true })
export class UserAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  achievementId: number;

  @Column({ type: 'timestamp' })
  earnedAt: Date;

  @Column({ type: 'text', nullable: true })
  progress: string; // JSON string of progress data when earned

  @Column({ type: 'boolean', default: false })
  isNotified: boolean;

  @Column({ type: 'boolean', default: false })
  isShared: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.userAchievements)
  user: User;

  @ManyToOne(() => Achievement, (achievement) => achievement.userAchievements)
  achievement: Achievement;
}

