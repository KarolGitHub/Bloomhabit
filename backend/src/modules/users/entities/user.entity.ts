import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Habit } from '../../habits/entities/habit.entity';
import { JournalEntry } from '../../garden/entities/journal-entry.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  githubId?: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    theme?: 'light' | 'dark' | 'auto';
    notifications?: boolean;
    timezone?: string;
  };

  @OneToMany(() => Habit, (habit) => habit.user)
  habits: Habit[];

  @OneToMany(() => JournalEntry, (entry) => entry.user)
  journalEntries: JournalEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties for garden visualization
  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.username || this.email;
  }

  get displayName(): string {
    return this.username || this.firstName || this.email.split('@')[0];
  }
}
