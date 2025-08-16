import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsObject,
  IsDateString,
  IsNumber,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ShareType,
  ShareStatus,
  SharePermission,
} from '../../../database/entities/garden-share.entity';

export class SharedContentDto {
  @IsOptional()
  @IsString()
  layoutId?: string;

  @IsOptional()
  @IsString()
  themeId?: string;

  @IsOptional()
  @IsString()
  viewId?: string;

  @IsOptional()
  @IsString()
  gardenId?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ContentMetadataDto)
  metadata: ContentMetadataDto;
}

export class ContentMetadataDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  category: string;

  @IsString()
  difficulty: string;

  @IsNumber()
  @Min(1)
  @Max(1000)
  estimatedTime: number;

  @IsArray()
  @IsString({ each: true })
  materials: string[];

  @IsString()
  inspiration: string;

  @IsArray()
  @IsString({ each: true })
  seasonality: string[];

  @IsString()
  maintenance: string;
}

export class PermissionsDto {
  @IsBoolean()
  canView: boolean;

  @IsBoolean()
  canComment: boolean;

  @IsBoolean()
  canDownload: boolean;

  @IsBoolean()
  canEdit: boolean;

  @IsBoolean()
  canShare: boolean;

  @IsBoolean()
  canRate: boolean;

  @IsBoolean()
  canReport: boolean;
}

export class AccessControlDto {
  @IsArray()
  @IsString({ each: true })
  allowedUsers: string[];

  @IsArray()
  @IsString({ each: true })
  allowedGroups: string[];

  @IsArray()
  @IsString({ each: true })
  allowedDomains: string[];

  @IsNumber()
  @Min(0)
  maxViews: number;

  @IsNumber()
  @Min(0)
  maxDownloads: number;

  @IsBoolean()
  requireApproval: boolean;

  @IsBoolean()
  moderationEnabled: boolean;
}

export class SharingDto {
  @IsBoolean()
  isShared: boolean;

  @IsArray()
  @IsString({ each: true })
  sharedWith: string[];

  @IsOptional()
  @IsDateString()
  shareExpiry?: string;

  @IsNumber()
  @Min(0)
  shareLimit: number;

  @IsNumber()
  @Min(0)
  currentShares: number;

  @IsBoolean()
  allowResharing: boolean;

  @IsNumber()
  @Min(0)
  reshareCount: number;
}

export class ViewHistoryDto {
  @IsString()
  date: string;

  @IsString()
  userId: string;

  @IsString()
  ip: string;
}

export class DownloadHistoryDto {
  @IsString()
  date: string;

  @IsString()
  userId: string;

  @IsString()
  ip: string;
}

export class InteractionStatsDto {
  @IsNumber()
  @Min(0)
  likes: number;

  @IsNumber()
  @Min(0)
  comments: number;

  @IsNumber()
  @Min(0)
  shares: number;

  @IsNumber()
  @Min(0)
  downloads: number;

  @IsNumber()
  @Min(0)
  views: number;
}

export class GeographicDataDto {
  @IsString()
  country: string;

  @IsNumber()
  @Min(0)
  count: number;
}

export class DeviceDataDto {
  @IsString()
  device: string;

  @IsNumber()
  @Min(0)
  count: number;
}

export class AnalyticsDto {
  @IsOptional()
  @IsDateString()
  lastViewed?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ViewHistoryDto)
  viewHistory: ViewHistoryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DownloadHistoryDto)
  downloadHistory: DownloadHistoryDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => InteractionStatsDto)
  interactionStats: InteractionStatsDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeographicDataDto)
  geographicData: GeographicDataDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeviceDataDto)
  deviceData: DeviceDataDto[];
}

export class ModerationDto {
  @IsBoolean()
  isModerated: boolean;

  @IsString()
  moderationStatus: string;

  @IsString()
  moderationNotes: string;

  @IsArray()
  @IsString({ each: true })
  reportedBy: string[];

  @IsArray()
  @IsString({ each: true })
  reportReasons: string[];

  @IsOptional()
  @IsDateString()
  lastModerated?: string;

  @IsOptional()
  @IsString()
  moderatedBy?: string;
}

export class SocialDto {
  @IsBoolean()
  allowComments: boolean;

  @IsBoolean()
  allowLikes: boolean;

  @IsBoolean()
  allowRatings: boolean;

  @IsBoolean()
  commentModeration: boolean;

  @IsBoolean()
  spamProtection: boolean;

  @IsBoolean()
  userVerification: boolean;
}

export class InstructionsDto {
  @IsArray()
  @IsString({ each: true })
  setup: string[];

  @IsArray()
  @IsString({ each: true })
  maintenance: string[];

  @IsArray()
  @IsString({ each: true })
  tips: string[];

  @IsArray()
  @IsString({ each: true })
  troubleshooting: string[];

  @IsArray()
  @IsString({ each: true })
  customization: string[];
}

export class CreateGardenShareDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ShareType)
  shareType: ShareType;

  @IsOptional()
  @IsEnum(ShareStatus)
  status?: ShareStatus;

  @IsOptional()
  @IsString()
  shareCode?: string;

  @IsOptional()
  @IsString()
  shareUrl?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  isPasswordProtected?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => SharedContentDto)
  sharedContent: SharedContentDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PermissionsDto)
  permissions: PermissionsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => AccessControlDto)
  accessControl: AccessControlDto;

  @IsObject()
  @ValidateNested()
  @Type(() => SharingDto)
  sharing: SharingDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AnalyticsDto)
  analytics?: AnalyticsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ModerationDto)
  moderation?: ModerationDto;

  @IsObject()
  @ValidateNested()
  @Type(() => SocialDto)
  social: SocialDto;

  @IsOptional()
  @IsString()
  previewImage?: string;

  @IsOptional()
  @IsString()
  thumbnailImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  screenshots?: string[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => InstructionsDto)
  instructions?: InstructionsDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  estimatedTime?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @IsOptional()
  @IsString()
  inspiration?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seasonality?: string[];

  @IsOptional()
  @IsString()
  maintenance?: string;
}

export class UpdateGardenShareDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ShareType)
  shareType?: ShareType;

  @IsOptional()
  @IsEnum(ShareStatus)
  status?: ShareStatus;

  @IsOptional()
  @IsString()
  shareCode?: string;

  @IsOptional()
  @IsString()
  shareUrl?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  isPasswordProtected?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SharedContentDto)
  sharedContent?: SharedContentDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PermissionsDto)
  permissions?: PermissionsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AccessControlDto)
  accessControl?: AccessControlDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SharingDto)
  sharing?: SharingDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AnalyticsDto)
  analytics?: AnalyticsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ModerationDto)
  moderation?: ModerationDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialDto)
  social?: SocialDto;

  @IsOptional()
  @IsString()
  previewImage?: string;

  @IsOptional()
  @IsString()
  thumbnailImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  screenshots?: string[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => InstructionsDto)
  instructions?: InstructionsDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  estimatedTime?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @IsOptional()
  @IsString()
  inspiration?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seasonality?: string[];

  @IsOptional()
  @IsString()
  maintenance?: string;
}

export class GardenShareDto {
  id: string;
  title: string;
  description?: string;
  shareType: ShareType;
  status: ShareStatus;
  shareCode: string;
  shareUrl?: string;
  password?: string;
  isPasswordProtected: boolean;
  isPublic: boolean;
  isFeatured: boolean;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  commentCount: number;
  rating: number;
  ratingCount: number;
  sharedContent: SharedContentDto;
  permissions: PermissionsDto;
  accessControl: AccessControlDto;
  sharing: SharingDto;
  analytics?: AnalyticsDto;
  moderation?: ModerationDto;
  social: SocialDto;
  previewImage?: string;
  thumbnailImage?: string;
  screenshots?: string[];
  videoUrl?: string;
  instructions?: InstructionsDto;
  user: string;
  tags?: string[];
  category?: string;
  difficulty?: string;
  estimatedTime?: number;
  materials?: string[];
  inspiration?: string;
  seasonality?: string[];
  maintenance?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  featuredAt?: Date;
  lastViewed?: Date;
  lastDownloaded?: Date;
}
