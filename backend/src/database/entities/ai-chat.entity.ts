import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Habit } from './habit.entity';
import { Goal } from './goal.entity';
import {
  ChatMessageType,
  ChatContextType,
} from '../../modules/ai-enhanced/dto/ai-chat.dto';

@Entity('ai_chats')
export class AiChat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ChatMessageType,
    default: ChatMessageType.USER,
  })
  messageType: ChatMessageType;

  @Column({
    type: 'enum',
    enum: ChatContextType,
    default: ChatContextType.GENERAL,
  })
  contextType: ChatContextType;

  @Column({ type: 'uuid', nullable: true })
  habitId?: string;

  @Column({ type: 'uuid', nullable: true })
  goalId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  aiResponse?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidence?: number;

  @Column({ type: 'text', array: true, nullable: true })
  suggestions?: string[];

  @Column({ type: 'boolean', default: false })
  isHelpful?: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.aiChats)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Habit, { nullable: true })
  @JoinColumn({ name: 'habitId' })
  habit?: Habit;

  @ManyToOne(() => Goal, { nullable: true })
  @JoinColumn({ name: 'goalId' })
  goal?: Goal;
}

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    type: 'enum',
    enum: ChatContextType,
    default: ChatContextType.GENERAL,
  })
  primaryContext: ChatContextType;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.chatSessions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => AiChat, (chat) => chat.session, { cascade: true })
  messages: AiChat[];
}
