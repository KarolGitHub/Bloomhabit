import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum LayoutType {
  PERSONAL = 'personal',
  SHARED = 'shared',
  TEMPLATE = 'template',
  COMMUNITY = 'community',
}

export enum LayoutStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

@Entity('garden_layouts')
export class GardenLayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: LayoutType,
    default: LayoutType.PERSONAL,
  })
  type: LayoutType;

  @Column({
    type: 'enum',
    enum: LayoutStatus,
    default: LayoutStatus.DRAFT,
  })
  status: LayoutStatus;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'int', default: 0 })
  downloadCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ type: 'json' })
  layout: {
    version: string;
    gridSize: {
      width: number;
      height: number;
    };
    zones: Array<{
      id: string;
      name: string;
      x: number;
      y: number;
      width: number;
      height: number;
      type: string;
      habitIds: string[];
      decorations: string[];
    }>;
    paths: Array<{
      id: string;
      startZone: string;
      endZone: string;
      pathType: string;
      waypoints: Array<{ x: number; y: number }>;
    }>;
    waterFeatures: Array<{
      id: string;
      x: number;
      y: number;
      type: string;
      size: number;
    }>;
    structures: Array<{
      id: string;
      x: number;
      y: number;
      type: string;
      rotation: number;
      scale: number;
    }>;
    gardenArt: Array<{
      id: string;
      x: number;
      y: number;
      type: string;
      rotation: number;
      scale: number;
    }>;
  };

  @Column({ type: 'json' })
  metadata: {
    tags: string[];
    difficulty: string;
    estimatedTime: number;
    materials: string[];
    inspiration: string;
    seasonality: string[];
    maintenance: string;
  };

  @Column({ type: 'varchar', length: 255, nullable: true })
  previewImage: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnailImage: string;

  @Column({ type: 'json', nullable: true })
  screenshots: string[];

  @Column({ type: 'json', nullable: true })
  videoUrl: string;

  @Column({ type: 'json', nullable: true })
  instructions: {
    setup: string[];
    maintenance: string[];
    tips: string[];
    troubleshooting: string[];
  };

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'json', nullable: true })
  permissions: {
    canView: string[];
    canEdit: string[];
    canShare: string[];
    canDelete: string[];
  };

  @Column({ type: 'json', nullable: true })
  sharing: {
    isShared: boolean;
    sharedWith: string[];
    shareLink: string;
    sharePassword: string;
    shareExpiry: Date;
  };

  @Column({ type: 'json', nullable: true })
  analytics: {
    lastViewed: Date;
    viewHistory: Array<{ date: Date; userId: string }>;
    interactionStats: {
      likes: number;
      comments: number;
      shares: number;
      downloads: number;
    };
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  featuredAt: Date;
}
