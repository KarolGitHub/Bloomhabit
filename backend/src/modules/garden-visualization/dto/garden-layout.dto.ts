import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  IsDateString,
  Min,
  Max,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  LayoutType,
  LayoutStatus,
} from '../../../database/entities/garden-layout.entity';

export class GridSizeDto {
  @IsNumber()
  @Min(1)
  @Max(100)
  width: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  height: number;
}

export class ZoneDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  x: number;

  @IsNumber()
  @Min(0)
  y: number;

  @IsNumber()
  @Min(1)
  width: number;

  @IsNumber()
  @Min(1)
  height: number;

  @IsString()
  type: string;

  @IsArray()
  @IsUUID('4', { each: true })
  habitIds: string[];

  @IsArray()
  @IsString({ each: true })
  decorations: string[];
}

export class PathDto {
  @IsString()
  id: string;

  @IsString()
  startZone: string;

  @IsString()
  endZone: string;

  @IsString()
  pathType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaypointDto)
  waypoints: WaypointDto[];
}

export class WaypointDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}

export class WaterFeatureDto {
  @IsString()
  id: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsString()
  type: string;

  @IsNumber()
  @Min(0.1)
  @Max(10)
  size: number;
}

export class StructureDto {
  @IsString()
  id: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsString()
  type: string;

  @IsNumber()
  @Min(0)
  @Max(360)
  rotation: number;

  @IsNumber()
  @Min(0.1)
  @Max(5)
  scale: number;
}

export class GardenArtDto {
  @IsString()
  id: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsString()
  type: string;

  @IsNumber()
  @Min(0)
  @Max(360)
  rotation: number;

  @IsNumber()
  @Min(0.1)
  @Max(5)
  scale: number;
}

export class LayoutDto {
  @IsString()
  version: string;

  @IsObject()
  @ValidateNested()
  @Type(() => GridSizeDto)
  gridSize: GridSizeDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ZoneDto)
  zones: ZoneDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PathDto)
  paths: PathDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaterFeatureDto)
  waterFeatures: WaterFeatureDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StructureDto)
  structures: StructureDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GardenArtDto)
  gardenArt: GardenArtDto[];
}

export class MetadataDto {
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  difficulty: string;

  @IsNumber()
  @Min(1)
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
}

export class PermissionsDto {
  @IsArray()
  @IsString({ each: true })
  canView: string[];

  @IsArray()
  @IsString({ each: true })
  canEdit: string[];

  @IsArray()
  @IsString({ each: true })
  canShare: string[];

  @IsArray()
  @IsString({ each: true })
  canDelete: string[];
}

export class SharingDto {
  @IsBoolean()
  isShared: boolean;

  @IsArray()
  @IsString({ each: true })
  sharedWith: string[];

  @IsOptional()
  @IsString()
  shareLink?: string;

  @IsOptional()
  @IsString()
  sharePassword?: string;

  @IsOptional()
  @IsDateString()
  shareExpiry?: string;
}

export class AnalyticsDto {
  @IsOptional()
  @IsDateString()
  lastViewed?: string;

  @IsArray()
  viewHistory: Array<{ date: string; userId: string }>;

  @IsObject()
  interactionStats: {
    likes: number;
    comments: number;
    shares: number;
    downloads: number;
  };
}

export class CreateGardenLayoutDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(LayoutType)
  type: LayoutType;

  @IsOptional()
  @IsEnum(LayoutStatus)
  status?: LayoutStatus;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => LayoutDto)
  layout: LayoutDto;

  @IsObject()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata: MetadataDto;

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
  @IsObject()
  @ValidateNested()
  @Type(() => PermissionsDto)
  permissions?: PermissionsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SharingDto)
  sharing?: SharingDto;
}

export class UpdateGardenLayoutDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(LayoutType)
  type?: LayoutType;

  @IsOptional()
  @IsEnum(LayoutStatus)
  status?: LayoutStatus;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LayoutDto)
  layout?: LayoutDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;

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
  @IsObject()
  @ValidateNested()
  @Type(() => PermissionsDto)
  permissions?: PermissionsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SharingDto)
  sharing?: SharingDto;
}

export class GardenLayoutDto {
  id: string;
  name: string;
  description?: string;
  type: LayoutType;
  status: LayoutStatus;
  isPublic: boolean;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  downloadCount: number;
  rating: number;
  ratingCount: number;
  layout: LayoutDto;
  metadata: MetadataDto;
  previewImage?: string;
  thumbnailImage?: string;
  screenshots?: string[];
  videoUrl?: string;
  instructions?: InstructionsDto;
  user: string;
  permissions?: PermissionsDto;
  sharing?: SharingDto;
  analytics?: AnalyticsDto;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  featuredAt?: Date;
}
