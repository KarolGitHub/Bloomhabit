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

export enum DataRequestType {
  DATA_PORTABILITY = 'data_portability',
  RIGHT_TO_BE_FORGOTTEN = 'right_to_be_forgotten',
  DATA_CORRECTION = 'data_correction',
  DATA_DELETION = 'data_deletion',
  CONSENT_WITHDRAWAL = 'consent_withdrawal',
}

export enum DataRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum DataFormat {
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml',
  PDF = 'pdf',
}

@Entity('data_requests')
export class DataRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: DataRequestType,
  })
  requestType: DataRequestType;

  @Column({
    type: 'enum',
    enum: DataRequestStatus,
    default: DataRequestStatus.PENDING,
  })
  status: DataRequestStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  requestedData: Record<string, any>;

  @Column({
    type: 'enum',
    enum: DataFormat,
    default: DataFormat.JSON,
  })
  preferredFormat: DataFormat;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'boolean', default: false })
  isUrgent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  requestedCompletionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedProcessingAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  resultUrl: string;

  @Column({ type: 'text', nullable: true })
  resultChecksum: string;

  @Column({ type: 'integer', nullable: true })
  resultSizeBytes: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  processingMetadata: Record<string, any>;

  @Column({ type: 'integer', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt: Date;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @Column({ type: 'uuid', nullable: true })
  assignedTo: string;

  @Column({ type: 'jsonb', nullable: true })
  verificationData: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
