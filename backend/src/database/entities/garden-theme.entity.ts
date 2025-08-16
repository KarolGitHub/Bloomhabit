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

export enum ThemeType {
  SEASONAL = 'seasonal',
  CUSTOM = 'custom',
  ACHIEVEMENT = 'achievement',
  HOLIDAY = 'holiday',
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
}

@Entity('garden_themes')
export class GardenTheme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ThemeType,
    default: ThemeType.CUSTOM,
  })
  type: ThemeType;

  @Column({
    type: 'enum',
    enum: Season,
    nullable: true,
  })
  season: Season;

  @Column({ type: 'varchar', length: 50, nullable: true })
  holiday: string;

  @Column({ type: 'int', default: 0 })
  requiredLevel: number;

  @Column({ type: 'int', default: 0 })
  requiredPoints: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  requiredAchievement: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: false })
  isHidden: boolean;

  @Column({ type: 'json' })
  visualConfig: {
    backgroundColor: string;
    groundTexture: string;
    skybox: string;
    lighting: {
      intensity: number;
      color: string;
      shadows: boolean;
    };
    particles: {
      enabled: boolean;
      type: string;
      density: number;
    };
    soundscape: {
      enabled: boolean;
      ambient: string;
      effects: string[];
    };
  };

  @Column({ type: 'json' })
  plantStyles: {
    flowerColors: string[];
    leafColors: string[];
    stemStyles: string[];
    bloomEffects: string[];
  };

  @Column({ type: 'json' })
  decorations: {
    paths: string[];
    structures: string[];
    waterFeatures: string[];
    gardenArt: string[];
  };

  @Column({ type: 'varchar', length: 255, nullable: true })
  previewImage: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnailImage: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  availableFrom: Date;

  @Column({ type: 'timestamp', nullable: true })
  availableUntil: Date;
}
