import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsObject, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ViewMode, CameraPreset } from '../../../database/entities/garden-3d-view.entity';

export class PositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  z: number;
}

export class CameraDto {
  @IsObject()
  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PositionDto)
  target: PositionDto;

  @IsNumber()
  @Min(10)
  @Max(120)
  fov: number;

  @IsNumber()
  @Min(0.1)
  near: number;

  @IsNumber()
  @Min(100)
  far: number;

  @IsNumber()
  @Min(0.5)
  @Max(2)
  aspect: number;
}

export class ControlsDto {
  @IsBoolean()
  enableDamping: boolean;

  @IsNumber()
  @Min(0)
  @Max(1)
  dampingFactor: number;

  @IsBoolean()
  enableZoom: boolean;

  @IsBoolean()
  enableRotate: boolean;

  @IsBoolean()
  enablePan: boolean;

  @IsNumber()
  @Min(1)
  @Max(1000)
  maxDistance: number;

  @IsNumber()
  @Min(0.1)
  @Max(100)
  minDistance: number;

  @IsNumber()
  @Min(0)
  @Max(180)
  maxPolarAngle: number;

  @IsNumber()
  @Min(0)
  @Max(180)
  minPolarAngle: number;

  @IsBoolean()
  autoRotate: boolean;

  @IsNumber()
  @Min(-10)
  @Max(10)
  autoRotateSpeed: number;
}

export class AmbientLightDto {
  @IsNumber()
  @Min(0)
  @Max(10)
  intensity: number;

  @IsString()
  color: string;
}

export class DirectionalLightDto {
  @IsNumber()
  @Min(0)
  @Max(10)
  intensity: number;

  @IsString()
  color: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;

  @IsBoolean()
  castShadow: boolean;
}

export class PointLightDto {
  @IsNumber()
  @Min(0)
  @Max(10)
  intensity: number;

  @IsString()
  color: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;

  @IsNumber()
  @Min(0)
  @Max(1000)
  distance: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  decay: number;
}

export class SpotLightDto {
  @IsNumber()
  @Min(0)
  @Max(10)
  intensity: number;

  @IsString()
  color: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PositionDto)
  target: PositionDto;

  @IsNumber()
  @Min(0)
  @Max(90)
  angle: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  penumbra: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  distance: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  decay: number;
}

export class LightingDto {
  @IsObject()
  @ValidateNested()
  @Type(() => AmbientLightDto)
  ambient: AmbientLightDto;

  @IsObject()
  @ValidateNested()
  @Type(() => DirectionalLightDto)
  directional: DirectionalLightDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PointLightDto)
  point: PointLightDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpotLightDto)
  spot: SpotLightDto[];
}

export class FogDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  color: string;

  @IsNumber()
  @Min(0)
  near: number;

  @IsNumber()
  @Min(0)
  far: number;
}

export class GroundDto {
  @IsString()
  texture: string;

  @IsNumber()
  @Min(1)
  @Max(1000)
  size: number;

  @IsObject()
  repeat: {
    @IsNumber()
    @Min(0.1)
    @Max(100)
    x: number;

    @IsNumber()
    @Min(0.1)
    @Max(100)
    y: number;
  };
}

export class AtmosphereDto {
  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  @Min(0)
  @Max(10)
  rayleigh: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  mieCoefficient: number;

  @IsNumber()
  @Min(-1)
  @Max(1)
  mieDirectionalG: number;
}

export class EnvironmentDto {
  @IsString()
  skybox: string;

  @IsObject()
  @ValidateNested()
  @Type(() => FogDto)
  fog: FogDto;

  @IsObject()
  @ValidateNested()
  @Type(() => GroundDto)
  ground: GroundDto;

  @IsObject()
  @ValidateNested()
  @Type(() => AtmosphereDto)
  atmosphere: AtmosphereDto;
}

export class BloomDto {
  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  @Min(0)
  @Max(3)
  threshold: number;

  @IsNumber()
  @Min(0)
  @Max(3)
  strength: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  radius: number;
}

export class SSAODto {
  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  @Min(0)
  @Max(10)
  radius: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  intensity: number;
}

export class DOFDto {
  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  @Min(0)
  @Max(1000)
  focusDistance: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  focalLength: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  bokehScale: number;
}

export class ColorCorrectionDto {
  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  @Min(-5)
  @Max(5)
  exposure: number;

  @IsNumber()
  @Min(-5)
  @Max(5)
  contrast: number;

  @IsNumber()
  @Min(-5)
  @Max(5)
  saturation: number;

  @IsNumber()
  @Min(-5)
  @Max(5)
  brightness: number;
}

export class PostProcessingDto {
  @IsObject()
  @ValidateNested()
  @Type(() => BloomDto)
  bloom: BloomDto;

  @IsObject()
  @ValidateNested()
  @Type(() => SSAODto)
  ssao: SSAODto;

  @IsObject()
  @ValidateNested()
  @Type(() => DOFDto)
  dof: DOFDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ColorCorrectionDto)
  colorCorrection: ColorCorrectionDto;
}

export class CameraAnimationDto {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  type: string;

  @IsNumber()
  @Min(0.1)
  @Max(60)
  duration: number;

  @IsString()
  easing: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CameraWaypointDto)
  waypoints: CameraWaypointDto[];
}

export class CameraWaypointDto {
  @IsObject()
  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PositionDto)
  target: PositionDto;

  @IsNumber()
  @Min(0)
  @Max(60)
  time: number;
}

export class PlantAnimationsDto {
  @IsBoolean()
  enabled: boolean;

  @IsBoolean()
  windEffect: boolean;

  @IsBoolean()
  growthAnimation: boolean;

  @IsBoolean()
  bloomAnimation: boolean;
}

export class ParticleAnimationsDto {
  @IsBoolean()
  enabled: boolean;

  @IsArray()
  @IsString({ each: true })
  types: string[];

  @IsNumber()
  @Min(0)
  @Max(1000)
  density: number;

  @IsNumber()
  @Min(0.1)
  @Max(60)
  lifetime: number;
}

export class AnimationsDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CameraAnimationDto)
  camera: CameraAnimationDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PlantAnimationsDto)
  plants: PlantAnimationsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ParticleAnimationsDto)
  particles: ParticleAnimationsDto;
}

export class InteractionsDto {
  @IsBoolean()
  hoverEffects: boolean;

  @IsBoolean()
  clickEffects: boolean;

  @IsBoolean()
  dragAndDrop: boolean;

  @IsBoolean()
  zoomToHabit: boolean;

  @IsBoolean()
  highlightZones: boolean;

  @IsBoolean()
  tooltips: boolean;
}

export class PerformanceDto {
  @IsNumber()
  @Min(30)
  @Max(144)
  maxFPS: number;

  @IsString()
  quality: string;

  @IsBoolean()
  shadows: boolean;

  @IsBoolean()
  antialiasing: boolean;

  @IsString()
  textureQuality: string;

  @IsNumber()
  @Min(100)
  @Max(10000)
  particleLimit: number;
}

export class MetadataDto {
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  difficulty: string;

  @IsNumber()
  @Min(1)
  @Max(1000)
  estimatedTime: number;

  @IsString()
  inspiration: string;

  @IsString()
  notes: string;
}

export class CreateGarden3dViewDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ViewMode)
  viewMode: ViewMode;

  @IsEnum(CameraPreset)
  cameraPreset: CameraPreset;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => CameraDto)
  camera: CameraDto;

  @IsObject()
  @ValidateNested()
  @Type(() => ControlsDto)
  controls: ControlsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => LightingDto)
  lighting: LightingDto;

  @IsObject()
  @ValidateNested()
  @Type(() => EnvironmentDto)
  environment: EnvironmentDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PostProcessingDto)
  postProcessing: PostProcessingDto;

  @IsObject()
  @ValidateNested()
  @Type(() => AnimationsDto)
  animations: AnimationsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => InteractionsDto)
  interactions: InteractionsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PerformanceDto)
  performance: PerformanceDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;
}

export class UpdateGarden3dViewDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ViewMode)
  viewMode?: ViewMode;

  @IsOptional()
  @IsEnum(CameraPreset)
  cameraPreset?: CameraPreset;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CameraDto)
  camera?: CameraDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ControlsDto)
  controls?: ControlsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LightingDto)
  lighting?: LightingDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EnvironmentDto)
  environment?: EnvironmentDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PostProcessingDto)
  postProcessing?: PostProcessingDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AnimationsDto)
  animations?: AnimationsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => InteractionsDto)
  interactions?: InteractionsDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PerformanceDto)
  performance?: PerformanceDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;
}

export class Garden3dViewDto {
  id: string;
  name: string;
  description?: string;
  viewMode: ViewMode;
  cameraPreset: CameraPreset;
  isDefault: boolean;
  isPublic: boolean;
  camera: CameraDto;
  controls: ControlsDto;
  lighting: LightingDto;
  environment: EnvironmentDto;
  postProcessing: PostProcessingDto;
  animations: AnimationsDto;
  interactions: InteractionsDto;
  performance: PerformanceDto;
  user: string;
  usageCount: number;
  rating: number;
  ratingCount: number;
  metadata?: MetadataDto;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}
