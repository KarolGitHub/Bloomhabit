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

@Entity('push_subscriptions')
export class PushSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  endpoint: string;

  @Column('json')
  keys: {
    p256dh: string;
    auth: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  deviceType: string;

  @Column('json', { nullable: true })
  preferences: {
    habitReminders: boolean;
    streakMilestones: boolean;
    goalAchievements: boolean;
    aiInsights: boolean;
    systemUpdates: boolean;
    friendActivity: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
