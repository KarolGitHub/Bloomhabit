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
import { Habit } from '../../database/entities/habit.entity';

export enum CommunityGardenType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  INVITE_ONLY = 'invite_only',
}

export enum CommunityGardenStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  MODERATED = 'moderated',
}

@Entity('community_gardens')
export class CommunityGarden {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: CommunityGardenType,
    default: CommunityGardenType.PUBLIC,
  })
  type: CommunityGardenType;

  @Column({
    type: 'enum',
    enum: CommunityGardenStatus,
    default: CommunityGardenStatus.ACTIVE,
  })
  status: CommunityGardenStatus;

  @Column()
  ownerId: number;

  @Column({ default: 0 })
  memberCount: number;

  @Column({ default: 0 })
  habitCount: number;

  @Column({ default: 0 })
  totalStreak: number;

  @Column('json', { nullable: true })
  tags: string[];

  @Column('json', { nullable: true })
  rules: string[];

  @Column({ nullable: true })
  maxMembers: number;

  @Column({ default: false })
  requiresApproval: boolean;

  @Column({ default: false })
  allowGuestViewing: boolean;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ nullable: true })
  theme: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'community_garden_members',
    joinColumn: { name: 'gardenId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  members: User[];

  @OneToMany(() => Habit, (habit) => habit.communityGarden)
  habits: Habit[];
}
