import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { WearableDevice } from './wearable-device.entity';

export enum HealthDataType {
  STEPS = 'steps',
  HEART_RATE = 'heart_rate',
  SLEEP = 'sleep',
  CALORIES = 'calories',
  DISTANCE = 'distance',
  WEIGHT = 'weight',
  BLOOD_PRESSURE = 'blood_pressure',
  GLUCOSE = 'glucose',
  OXYGEN_SATURATION = 'oxygen_saturation',
  TEMPERATURE = 'temperature',
  ACTIVE_MINUTES = 'active_minutes',
  RESTING_HEART_RATE = 'resting_heart_rate',
  SLEEP_DURATION = 'sleep_duration',
  SLEEP_QUALITY = 'sleep_quality',
  SLEEP_STAGES = 'sleep_stages',
  EXERCISE = 'exercise',
  WORKOUT = 'workout',
  STRESS = 'stress',
  MOOD = 'mood',
  HYDRATION = 'hydration',
  NUTRITION = 'nutrition',
  CUSTOM = 'custom',
}

export enum DataQuality {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  UNKNOWN = 'unknown',
}

@Entity('health_data')
@Index(['userId', 'type', 'timestamp'])
@Index(['deviceId', 'timestamp'])
@Index(['type', 'timestamp'])
export class HealthData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  deviceId: number;

  @ManyToOne(() => WearableDevice, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deviceId' })
  device: WearableDevice;

  @Column({
    type: 'enum',
    enum: HealthDataType,
  })
  type: HealthDataType;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'jsonb' })
  value: any;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string;

  @Column({
    type: 'enum',
    enum: DataQuality,
    default: DataQuality.UNKNOWN,
  })
  quality: DataQuality;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  sourceData: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  externalId: string;

  @Column({ default: false })
  isProcessed: boolean;

  @Column({ type: 'jsonb', nullable: true })
  processedData: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
