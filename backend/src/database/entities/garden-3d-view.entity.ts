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

export enum ViewMode {
  FIRST_PERSON = 'first_person',
  THIRD_PERSON = 'third_person',
  TOP_DOWN = 'top_down',
  ORBIT = 'orbit',
  FLYOVER = 'flyover',
  WALKTHROUGH = 'walkthrough',
}

export enum CameraPreset {
  ENTRANCE = 'entrance',
  CENTER = 'center',
  WATER_FEATURE = 'water_feature',
  MEDITATION_AREA = 'meditation_area',
  HABIT_ZONES = 'habit_zones',
  OVERVIEW = 'overview',
  CUSTOM = 'custom',
}

@Entity('garden_3d_views')
export class Garden3dView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ViewMode,
    default: ViewMode.ORBIT,
  })
  viewMode: ViewMode;

  @Column({
    type: 'enum',
    enum: CameraPreset,
    default: CameraPreset.OVERVIEW,
  })
  cameraPreset: CameraPreset;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'json' })
  camera: {
    position: {
      x: number;
      y: number;
      z: number;
    };
    target: {
      x: number;
      y: number;
      z: number;
    };
    fov: number;
    near: number;
    far: number;
    aspect: number;
  };

  @Column({ type: 'json' })
  controls: {
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    enableRotate: boolean;
    enablePan: boolean;
    maxDistance: number;
    minDistance: number;
    maxPolarAngle: number;
    minPolarAngle: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
  };

  @Column({ type: 'json' })
  lighting: {
    ambient: {
      intensity: number;
      color: string;
    };
    directional: {
      intensity: number;
      color: string;
      position: { x: number; y: number; z: number };
      castShadow: boolean;
    };
    point: Array<{
      intensity: number;
      color: string;
      position: { x: number; y: number; z: number };
      distance: number;
      decay: number;
    }>;
    spot: Array<{
      intensity: number;
      color: string;
      position: { x: number; y: number; z: number };
      target: { x: number; y: number; z: number };
      angle: number;
      penumbra: number;
      distance: number;
      decay: number;
    }>;
  };

  @Column({ type: 'json' })
  environment: {
    skybox: string;
    fog: {
      enabled: boolean;
      color: string;
      near: number;
      far: number;
    };
    ground: {
      texture: string;
      size: number;
      repeat: { x: number; y: number };
    };
    atmosphere: {
      enabled: boolean;
      rayleigh: number;
      mieCoefficient: number;
      mieDirectionalG: number;
    };
  };

  @Column({ type: 'json' })
  postProcessing: {
    bloom: {
      enabled: boolean;
      threshold: number;
      strength: number;
      radius: number;
    };
    ssao: {
      enabled: boolean;
      radius: number;
      intensity: number;
    };
    dof: {
      enabled: boolean;
      focusDistance: number;
      focalLength: number;
      bokehScale: number;
    };
    colorCorrection: {
      enabled: boolean;
      exposure: number;
      contrast: number;
      saturation: number;
      brightness: number;
    };
  };

  @Column({ type: 'json' })
  animations: {
    camera: {
      enabled: boolean;
      type: string;
      duration: number;
      easing: string;
      waypoints: Array<{
        position: { x: number; y: number; z: number };
        target: { x: number; y: number; z: number };
        time: number;
      }>;
    };
    plants: {
      enabled: boolean;
      windEffect: boolean;
      growthAnimation: boolean;
      bloomAnimation: boolean;
    };
    particles: {
      enabled: boolean;
      types: string[];
      density: number;
      lifetime: number;
    };
  };

  @Column({ type: 'json' })
  interactions: {
    hoverEffects: boolean;
    clickEffects: boolean;
    dragAndDrop: boolean;
    zoomToHabit: boolean;
    highlightZones: boolean;
    tooltips: boolean;
  };

  @Column({ type: 'json' })
  performance: {
    maxFPS: number;
    quality: string;
    shadows: boolean;
    antialiasing: boolean;
    textureQuality: string;
    particleLimit: number;
  };

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ type: 'json', nullable: true })
  metadata: {
    tags: string[];
    difficulty: string;
    estimatedTime: number;
    inspiration: string;
    notes: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsed: Date;
}
