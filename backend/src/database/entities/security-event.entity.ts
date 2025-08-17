import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum SecurityEventType {
  // Authentication events
  MULTIPLE_FAILED_LOGINS = 'multiple_failed_logins',
  SUSPICIOUS_LOGIN_LOCATION = 'suspicious_login_location',
  UNUSUAL_ACTIVITY_PATTERN = 'unusual_activity_pattern',
  ACCOUNT_TAKEOVER_ATTEMPT = 'account_takeover_attempt',

  // Data access events
  UNAUTHORIZED_DATA_ACCESS = 'unauthorized_data_access',
  BULK_DATA_EXPORT = 'bulk_data_export',
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  DATA_LEAK_ATTEMPT = 'data_leak_attempt',

  // System security events
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_ATTEMPT = 'csrf_attempt',

  // Network security events
  SUSPICIOUS_IP_ADDRESS = 'suspicious_ip_address',
  DDoS_ATTEMPT = 'ddos_attempt',
  PORT_SCANNING = 'port_scanning',
  BRUTE_FORCE_ATTACK = 'brute_force_attack',

  // Privacy violations
  CONSENT_VIOLATION = 'consent_violation',
  DATA_RETENTION_VIOLATION = 'data_retention_violation',
  PRIVACY_SETTINGS_BYPASS = 'privacy_settings_bypass',
  UNAUTHORIZED_DATA_SHARING = 'unauthorized_data_sharing',
}

export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SecurityEventStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
  ESCALATED = 'escalated',
}

@Entity('security_events')
@Index(['userId', 'createdAt'])
@Index(['eventType', 'severity'])
@Index(['status', 'createdAt'])
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: SecurityEventType,
  })
  eventType: SecurityEventType;

  @Column({
    type: 'enum',
    enum: SecurityEventSeverity,
  })
  severity: SecurityEventSeverity;

  @Column({
    type: 'enum',
    enum: SecurityEventStatus,
    default: SecurityEventStatus.OPEN,
  })
  status: SecurityEventStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  eventData: Record<string, any>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  sourceIpAddress: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sessionId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'jsonb', nullable: true })
  geoLocation: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  threatIndicators: string;

  @Column({ type: 'jsonb', nullable: true })
  iocData: Record<string, any>; // Indicators of Compromise

  @Column({ type: 'boolean', default: false })
  isAutomated: boolean;

  @Column({ type: 'text', nullable: true })
  automatedResponse: string;

  @Column({ type: 'jsonb', nullable: true })
  responseActions: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  assignedTo: string;

  @Column({ type: 'text', nullable: true })
  investigationNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  investigationStartedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  relatedEvents: string[];

  @Column({ type: 'boolean', default: false })
  requiresEscalation: boolean;

  @Column({ type: 'timestamp', nullable: true })
  escalatedAt: Date;

  @Column({ type: 'text', nullable: true })
  escalationReason: string;

  @Column({ type: 'jsonb', nullable: true })
  riskScore: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isFalsePositive: boolean;

  @Column({ type: 'text', nullable: true })
  falsePositiveReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  retentionDate: Date;
}
