import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
}

export enum FriendshipType {
  FRIEND = 'friend',
  FAMILY = 'family',
  COLLEAGUE = 'colleague',
  MENTOR = 'mentor',
  MENTEE = 'mentee',
}

@Entity('friendships')
@Index(['requesterId', 'addresseeId'], { unique: true })
@Index(['addresseeId', 'requesterId'], { unique: true })
export class Friendship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'requester_id' })
  requesterId: number;

  @Column({ name: 'addressee_id' })
  addresseeId: number;

  @Column({
    type: 'enum',
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;

  @Column({
    type: 'enum',
    enum: FriendshipType,
    default: FriendshipType.FRIEND,
  })
  type: FriendshipType;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'accepted_at', type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @Column({ name: 'blocked_at', type: 'timestamp', nullable: true })
  blockedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'addressee_id' })
  addressee: User;
}
