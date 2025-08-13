import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EntryType {
  REFLECTION = 'reflection',
  GRATITUDE = 'gratitude',
  GOAL_SETTING = 'goal_setting',
  PROGRESS_UPDATE = 'progress_update',
  CHALLENGE = 'challenge',
  CELEBRATION = 'celebration',
  OTHER = 'other',
}

export enum MoodRating {
  VERY_LOW = 1,
  LOW = 2,
  NEUTRAL = 3,
  HIGH = 4,
  VERY_HIGH = 5,
}

@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: EntryType,
    default: EntryType.REFLECTION,
  })
  type: EntryType;

  @Column({
    type: 'enum',
    enum: MoodRating,
    nullable: true,
  })
  mood?: MoodRating;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    weather?: string;
    location?: string;
    timeOfDay?: string;
    energyLevel?: number; // 1-5 scale
    stressLevel?: number; // 1-5 scale
  };

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ default: false })
  isPinned: boolean;

  @ManyToOne(() => User, (user) => user.journalEntries, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  @Index()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties for garden enrichment
  get isPositive(): boolean {
    return this.mood ? this.mood >= MoodRating.HIGH : false;
  }

  get isReflective(): boolean {
    return this.type === EntryType.REFLECTION || this.type === EntryType.PROGRESS_UPDATE;
  }

  get isCelebratory(): boolean {
    return this.type === EntryType.CELEBRATION || this.type === EntryType.GRATITUDE;
  }

  get wordCount(): number {
    return this.content.split(/\s+/).length;
  }

  get readingTime(): number {
    // Average reading speed: 200 words per minute
    return Math.ceil(this.wordCount / 200);
  }
}
