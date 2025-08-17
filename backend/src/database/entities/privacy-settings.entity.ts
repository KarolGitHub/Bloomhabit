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

export enum DataSharingLevel {
  NONE = 'none',
  ANONYMOUS = 'anonymous',
  AGGREGATED = 'aggregated',
  PERSONAL = 'personal',
}

export enum ConsentStatus {
  PENDING = 'pending',
  GRANTED = 'granted',
  DENIED = 'denied',
  WITHDRAWN = 'withdrawn',
}

@Entity('privacy_settings')
export class PrivacySettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: DataSharingLevel,
    default: DataSharingLevel.NONE,
  })
  dataSharingLevel: DataSharingLevel;

  @Column({ type: 'boolean', default: false })
  allowAnalytics: boolean;

  @Column({ type: 'boolean', default: false })
  allowMarketing: boolean;

  @Column({ type: 'boolean', default: false })
  allowThirdParty: boolean;

  @Column({ type: 'boolean', default: false })
  allowLocationData: boolean;

  @Column({ type: 'boolean', default: false })
  allowHealthData: boolean;

  @Column({ type: 'boolean', default: false })
  allowSocialFeatures: boolean;

  @Column({ type: 'boolean', default: true })
  allowEssentialCookies: boolean;

  @Column({ type: 'boolean', default: false })
  allowPerformanceCookies: boolean;

  @Column({ type: 'boolean', default: false })
  allowTargetingCookies: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customPreferences: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastConsentUpdate: Date;

  @Column({ type: 'timestamp', nullable: true })
  gdprConsentDate: Date;

  @Column({ type: 'boolean', default: false })
  dataPortabilityEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  rightToBeForgotten: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
