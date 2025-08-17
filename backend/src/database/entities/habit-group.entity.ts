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

export enum GroupPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
  INVITE_ONLY = 'invite_only',
}

export enum GroupRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
}

export enum GroupCategory {
  FITNESS = 'fitness',
  WELLNESS = 'wellness',
  PRODUCTIVITY = 'productivity',
  LEARNING = 'learning',
  CREATIVITY = 'creativity',
  RELATIONSHIPS = 'relationships',
  FINANCE = 'finance',
  ENVIRONMENT = 'environment',
  OTHER = 'other',
}

@Entity('habit_groups')
@Index(['name'], { unique: true })
@Index(['category', 'privacy'])
@Index(['ownerId'])
export class HabitGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: GroupPrivacy,
    default: GroupPrivacy.PUBLIC,
  })
  privacy: GroupPrivacy;

  @Column({
    type: 'enum',
    enum: GroupCategory,
    default: GroupCategory.OTHER,
  })
  category: GroupCategory;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @Column({ name: 'max_members', default: 100 })
  maxMembers: number;

  @Column({ name: 'current_members', default: 1 })
  currentMembers: number;

  @Column({ type: 'jsonb', nullable: true })
  rules: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];

  @ManyToMany(() => Habit)
  @JoinTable({
    name: 'group_habits',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'habit_id', referencedColumnName: 'id' },
  })
  habits: Habit[];
}

@Entity('group_members')
@Index(['groupId', 'userId'], { unique: true })
@Index(['userId', 'role'])
export class GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'group_id' })
  groupId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: GroupRole,
    default: GroupRole.MEMBER,
  })
  role: GroupRole;

  @Column({
    name: 'joined_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joinedAt: Date;

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relations
  @ManyToOne(() => HabitGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: HabitGroup;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
