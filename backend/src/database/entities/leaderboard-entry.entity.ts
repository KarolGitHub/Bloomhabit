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
import { Leaderboard } from './leaderboard.entity';

@Entity('leaderboard_entries')
@Index(['leaderboardId', 'userId'], { unique: true })
@Index(['leaderboardId', 'score'], { order: 'DESC' })
export class LeaderboardEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  leaderboardId: number;

  @Column()
  userId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  score: number;

  @Column({ type: 'int', default: 0 })
  rank: number;

  @Column({ type: 'json', nullable: true })
  metadata: {
    streak?: number;
    completionRate?: number;
    perfectDays?: number;
    habitCount?: number;
    achievementCount?: number;
    socialScore?: number;
    customMetrics?: Record<string, any>;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated: Date;

  @Column({ type: 'boolean', default: false })
  isFrozen: boolean; // For historical leaderboards

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Leaderboard, (leaderboard) => leaderboard.entries)
  leaderboard: Leaderboard;

  @ManyToOne(() => User, (user) => user.leaderboardEntries)
  user: User;
}

