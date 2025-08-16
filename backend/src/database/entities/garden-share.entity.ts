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

export enum ShareType {
  LAYOUT = 'layout',
  THEME = 'theme',
  VIEW = 'view',
  COMPLETE_GARDEN = 'complete_garden',
}

export enum ShareStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  DELETED = 'deleted',
}

export enum SharePermission {
  VIEW = 'view',
  COMMENT = 'comment',
  DOWNLOAD = 'download',
  EDIT = 'edit',
  SHARE = 'share',
  FULL_ACCESS = 'full_access',
}

@Entity('garden_shares')
export class GardenShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ShareType,
    default: ShareType.LAYOUT,
  })
  shareType: ShareType;

  @Column({
    type: 'enum',
    enum: ShareStatus,
    default: ShareStatus.ACTIVE,
  })
  status: ShareStatus;

  @Column({ type: 'varchar', length: 255, unique: true })
  shareCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shareUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ type: 'boolean', default: false })
  isPasswordProtected: boolean;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  downloadCount: number;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'int', default: 0 })
  commentCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ type: 'json' })
  sharedContent: {
    layoutId?: string;
    themeId?: string;
    viewId?: string;
    gardenId?: string;
    metadata: {
      name: string;
      description: string;
      tags: string[];
      category: string;
      difficulty: string;
      estimatedTime: number;
      materials: string[];
      inspiration: string;
      seasonality: string[];
      maintenance: string;
    };
  };

  @Column({ type: 'json' })
  permissions: {
    canView: boolean;
    canComment: boolean;
    canDownload: boolean;
    canEdit: boolean;
    canShare: boolean;
    canRate: boolean;
    canReport: boolean;
  };

  @Column({ type: 'json' })
  accessControl: {
    allowedUsers: string[];
    allowedGroups: string[];
    allowedDomains: string[];
    maxViews: number;
    maxDownloads: number;
    requireApproval: boolean;
    moderationEnabled: boolean;
  };

  @Column({ type: 'json' })
  sharing: {
    isShared: boolean;
    sharedWith: string[];
    shareExpiry: Date;
    shareLimit: number;
    currentShares: number;
    allowResharing: boolean;
    reshareCount: number;
  };

  @Column({ type: 'json' })
  analytics: {
    lastViewed: Date;
    viewHistory: Array<{ date: Date; userId: string; ip: string }>;
    downloadHistory: Array<{ date: Date; userId: string; ip: string }>;
    interactionStats: {
      likes: number;
      comments: number;
      shares: number;
      downloads: number;
      views: number;
    };
    geographicData: Array<{ country: string; count: number }>;
    deviceData: Array<{ device: string; count: number }>;
  };

  @Column({ type: 'json' })
  moderation: {
    isModerated: boolean;
    moderationStatus: string;
    moderationNotes: string;
    reportedBy: string[];
    reportReasons: string[];
    lastModerated: Date;
    moderatedBy: string;
  };

  @Column({ type: 'json' })
  social: {
    allowComments: boolean;
    allowLikes: boolean;
    allowRatings: boolean;
    commentModeration: boolean;
    spamProtection: boolean;
    userVerification: boolean;
  };

  @Column({ type: 'varchar', length: 255, nullable: true })
  previewImage: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnailImage: string;

  @Column({ type: 'json', nullable: true })
  screenshots: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  videoUrl: string;

  @Column({ type: 'json', nullable: true })
  instructions: {
    setup: string[];
    maintenance: string[];
    tips: string[];
    troubleshooting: string[];
    customization: string[];
  };

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  difficulty: string;

  @Column({ type: 'int', nullable: true })
  estimatedTime: number;

  @Column({ type: 'json', nullable: true })
  materials: string[];

  @Column({ type: 'text', nullable: true })
  inspiration: string;

  @Column({ type: 'json', nullable: true })
  seasonality: string[];

  @Column({ type: 'text', nullable: true })
  maintenance: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  featuredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastViewed: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastDownloaded: Date;
}
