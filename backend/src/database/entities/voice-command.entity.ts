import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Habit } from './habit.entity';
import { Goal } from './goal.entity';
import {
  VoiceCommandType,
  VoiceCommandStatus,
  VoiceQuality,
} from '../../modules/ai-enhanced/dto/voice-commands.dto';

@Entity('voice_commands')
export class VoiceCommand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  audioUrl: string;

  @Column({ type: 'text', nullable: true })
  transcript?: string;

  @Column({
    type: 'enum',
    enum: VoiceCommandType,
    default: VoiceCommandType.GENERAL_QUERY,
  })
  commandType: VoiceCommandType;

  @Column({
    type: 'enum',
    enum: VoiceCommandStatus,
    default: VoiceCommandStatus.PENDING,
  })
  status: VoiceCommandStatus;

  @Column({ type: 'uuid', nullable: true })
  habitId?: string;

  @Column({ type: 'uuid', nullable: true })
  goalId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  aiInterpretation?: string;

  @Column({ type: 'text', array: true, nullable: true })
  extractedEntities?: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidence?: number;

  @Column({
    type: 'enum',
    enum: VoiceQuality,
    nullable: true,
  })
  voiceQuality?: VoiceQuality;

  @Column({ type: 'integer', nullable: true })
  duration?: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  language?: string;

  @Column({ type: 'text', array: true, nullable: true })
  suggestedActions?: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.voiceCommands)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Habit, { nullable: true })
  @JoinColumn({ name: 'habitId' })
  habit?: Habit;

  @ManyToOne(() => Goal, { nullable: true })
  @JoinColumn({ name: 'goalId' })
  goal?: Goal;
}
