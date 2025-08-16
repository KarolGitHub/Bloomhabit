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
  ImageType,
  RecognitionStatus,
  RecognitionConfidence,
} from '../../modules/ai-enhanced/dto/image-recognition.dto';

@Entity('image_recognitions')
export class ImageRecognition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: ImageType,
    default: ImageType.GENERAL,
  })
  imageType: ImageType;

  @Column({
    type: 'enum',
    enum: RecognitionStatus,
    default: RecognitionStatus.PENDING,
  })
  status: RecognitionStatus;

  @Column({ type: 'uuid', nullable: true })
  habitId?: string;

  @Column({ type: 'uuid', nullable: true })
  goalId?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  aiAnalysis?: string;

  @Column({ type: 'text', array: true, nullable: true })
  detectedObjects?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  detectedActivities?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  detectedEmotions?: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidence?: number;

  @Column({
    type: 'enum',
    enum: RecognitionConfidence,
    nullable: true,
  })
  confidenceLevel?: RecognitionConfidence;

  @Column({ type: 'jsonb', nullable: true })
  tags?: Array<{ name: string; confidence: number }>;

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
  @ManyToOne(() => User, (user) => user.imageRecognitions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Habit, { nullable: true })
  @JoinColumn({ name: 'habitId' })
  habit?: Habit;

  @ManyToOne(() => Goal, { nullable: true })
  @JoinColumn({ name: 'goalId' })
  goal?: Goal;
}
