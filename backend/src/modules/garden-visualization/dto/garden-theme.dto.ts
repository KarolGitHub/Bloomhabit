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
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ThemeType,
  Season,
} from '../../../database/entities/garden-theme.entity';

export class VisualConfigDto {
  @IsString()
  backgroundColor: string;

  @IsString()
  groundTexture: string;

  @IsString()
  skybox: string;

  @IsObject()
  @ValidateNested()
  @Type(() => LightingDto)
  lighting: LightingDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ParticlesDto)
  particles: ParticlesDto;

  @IsObject()
  @ValidateNested()
  @Type(() => SoundscapeDto)
  soundscape: SoundscapeDto;
}

export class LightingDto {
  @IsNumber()
  @Min(0)
  @Max(10)
  intensity: number;

  @IsString()
  color: string;

  @IsBoolean()
  shadows: boolean;
}

export class ParticlesDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  type: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  density: number;
}

export class SoundscapeDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  ambient: string;

  @IsArray()
  @IsString({ each: true })
  effects: string[];
}

export class PlantStylesDto {
  @IsArray()
  @IsString({ each: true })
  flowerColors: string[];

  @IsArray()
  @IsString({ each: true })
  leafColors: string[];

  @IsArray()
  @IsString({ each: true })
  stemStyles: string[];

  @IsArray()
  @IsString({ each: true })
  bloomEffects: string[];
}

export class DecorationsDto {
  @IsArray()
  @IsString({ each: true })
  paths: string[];

  @IsArray()
  @IsString({ each: true })
  structures: string[];

  @IsArray()
  @IsString({ each: true })
  waterFeatures: string[];

  @IsArray()
  @IsString({ each: true })
  gardenArt: string[];
}

export class CreateGardenThemeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ThemeType)
  type: ThemeType;

  @IsOptional()
  @IsEnum(Season)
  season?: Season;

  @IsOptional()
  @IsString()
  holiday?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  requiredLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  requiredPoints?: number;

  @IsOptional()
  @IsString()
  requiredAchievement?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => VisualConfigDto)
  visualConfig: VisualConfigDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PlantStylesDto)
  plantStyles: PlantStylesDto;

  @IsObject()
  @ValidateNested()
  @Type(() => DecorationsDto)
  decorations: DecorationsDto;

  @IsOptional()
  @IsString()
  previewImage?: string;

  @IsOptional()
  @IsString()
  thumbnailImage?: string;

  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @IsOptional()
  @IsDateString()
  availableUntil?: string;
}

export class UpdateGardenThemeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ThemeType)
  type?: ThemeType;

  @IsOptional()
  @IsEnum(Season)
  season?: Season;

  @IsOptional()
  @IsString()
  holiday?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  requiredLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  requiredPoints?: number;

  @IsOptional()
  @IsString()
  requiredAchievement?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => VisualConfigDto)
  visualConfig?: VisualConfigDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PlantStylesDto)
  plantStyles?: PlantStylesDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DecorationsDto)
  decorations?: DecorationsDto;

  @IsOptional()
  @IsString()
  previewImage?: string;

  @IsOptional()
  @IsString()
  thumbnailImage?: string;

  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @IsOptional()
  @IsDateString()
  availableUntil?: string;
}

export class GardenThemeDto {
  id: string;
  name: string;
  description?: string;
  type: ThemeType;
  season?: Season;
  holiday?: string;
  requiredLevel: number;
  requiredPoints: number;
  requiredAchievement?: string;
  isActive: boolean;
  isDefault: boolean;
  isHidden: boolean;
  visualConfig: VisualConfigDto;
  plantStyles: PlantStylesDto;
  decorations: DecorationsDto;
  previewImage?: string;
  thumbnailImage?: string;
  createdBy?: string;
  usageCount: number;
  rating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
  availableFrom?: Date;
  availableUntil?: Date;
}
