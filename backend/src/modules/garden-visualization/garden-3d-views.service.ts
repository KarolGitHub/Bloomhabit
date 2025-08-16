import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Garden3dView,
  ViewMode,
  CameraPreset,
} from '../../database/entities/garden-3d-view.entity';
import {
  CreateGarden3dViewDto,
  UpdateGarden3dViewDto,
  Garden3dViewDto,
} from './dto/garden-3d-view.dto';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class Garden3dViewsService {
  constructor(
    @InjectRepository(Garden3dView)
    private readonly garden3dViewRepository: Repository<Garden3dView>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create3dView(
    create3dViewDto: CreateGarden3dViewDto,
    userId: string
  ): Promise<Garden3dViewDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate 3D view data
    this.validate3dViewData(create3dViewDto);

    const view = this.garden3dViewRepository.create({
      ...create3dViewDto,
      user,
      user_id: userId,
    });

    const savedView = await this.garden3dViewRepository.save(view);
    return this.mapToDto(savedView);
  }

  async update3dView(
    id: string,
    update3dViewDto: UpdateGarden3dViewDto,
    userId: string
  ): Promise<Garden3dViewDto> {
    const view = await this.garden3dViewRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!view) {
      throw new NotFoundException('3D view not found');
    }

    if (view.user_id !== userId) {
      throw new BadRequestException('You can only update your own 3D views');
    }

    // Validate 3D view data if it's being updated
    if (
      update3dViewDto.camera ||
      update3dViewDto.controls ||
      update3dViewDto.lighting
    ) {
      this.validate3dViewData({ ...view, ...update3dViewDto });
    }

    Object.assign(view, update3dViewDto);
    const updatedView = await this.garden3dViewRepository.save(view);
    return this.mapToDto(updatedView);
  }

  async get3dView(id: string, userId?: string): Promise<Garden3dViewDto> {
    const view = await this.garden3dViewRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!view) {
      throw new NotFoundException('3D view not found');
    }

    // Check if user can view this 3D view
    if (!this.canUserView3dView(view, userId)) {
      throw new BadRequestException(
        'You do not have permission to view this 3D view'
      );
    }

    // Update usage count and last used
    if (userId) {
      await this.update3dViewUsage(view);
    }

    return this.mapToDto(view);
  }

  async get3dViews(filters?: {
    viewMode?: ViewMode;
    cameraPreset?: CameraPreset;
    isDefault?: boolean;
    isPublic?: boolean;
    userId?: string;
  }): Promise<Garden3dViewDto[]> {
    const queryBuilder = this.garden3dViewRepository
      .createQueryBuilder('view')
      .leftJoinAndSelect('view.user', 'user');

    if (filters?.viewMode) {
      queryBuilder.andWhere('view.viewMode = :viewMode', {
        viewMode: filters.viewMode,
      });
    }

    if (filters?.cameraPreset) {
      queryBuilder.andWhere('view.cameraPreset = :cameraPreset', {
        cameraPreset: filters.cameraPreset,
      });
    }

    if (filters?.isDefault !== undefined) {
      queryBuilder.andWhere('view.isDefault = :isDefault', {
        isDefault: filters.isDefault,
      });
    }

    if (filters?.isPublic !== undefined) {
      queryBuilder.andWhere('view.isPublic = :isPublic', {
        isPublic: filters.isPublic,
      });
    }

    if (filters?.userId) {
      queryBuilder.andWhere('view.user_id = :userId', {
        userId: filters.userId,
      });
    }

    const views = await queryBuilder
      .orderBy('view.isDefault', 'DESC')
      .addOrderBy('view.rating', 'DESC')
      .addOrderBy('view.usageCount', 'DESC')
      .addOrderBy('view.createdAt', 'DESC')
      .getMany();

    return views.map((view) => this.mapToDto(view));
  }

  async getPublic3dViews(): Promise<Garden3dViewDto[]> {
    const views = await this.garden3dViewRepository.find({
      where: {
        isPublic: true,
      },
      relations: ['user'],
      order: {
        isDefault: 'DESC',
        rating: 'DESC',
        usageCount: 'DESC',
      },
    });

    return views.map((view) => this.mapToDto(view));
  }

  async getUser3dViews(
    userId: string,
    includePrivate: boolean = true
  ): Promise<Garden3dViewDto[]> {
    const queryBuilder = this.garden3dViewRepository
      .createQueryBuilder('view')
      .leftJoinAndSelect('view.user', 'user')
      .where('view.user_id = :userId', { userId });

    if (!includePrivate) {
      queryBuilder.andWhere('view.isPublic = :isPublic', { isPublic: true });
    }

    const views = await queryBuilder
      .orderBy('view.updatedAt', 'DESC')
      .getMany();

    return views.map((view) => this.mapToDto(view));
  }

  async delete3dView(id: string, userId: string): Promise<void> {
    const view = await this.garden3dViewRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!view) {
      throw new NotFoundException('3D view not found');
    }

    if (view.user_id !== userId) {
      throw new BadRequestException('You can only delete your own 3D views');
    }

    if (view.isDefault) {
      throw new BadRequestException('Cannot delete default 3D views');
    }

    await this.garden3dViewRepository.remove(view);
  }

  async getCameraPresets(): Promise<Garden3dViewDto[]> {
    const presets = await this.garden3dViewRepository.find({
      where: {
        isDefault: true,
        isPublic: true,
      },
      relations: ['user'],
      order: {
        cameraPreset: 'ASC',
        rating: 'DESC',
      },
    });

    return presets.map((preset) => this.mapToDto(preset));
  }

  async getViewModePresets(viewMode: ViewMode): Promise<Garden3dViewDto[]> {
    const presets = await this.garden3dViewRepository.find({
      where: {
        viewMode,
        isDefault: true,
        isPublic: true,
      },
      relations: ['user'],
      order: {
        rating: 'DESC',
        usageCount: 'DESC',
      },
    });

    return presets.map((preset) => this.mapToDto(preset));
  }

  async createDefaultPresets(): Promise<void> {
    const defaultPresets = [
      {
        name: 'Overview Camera',
        description: 'Default overview camera for garden exploration',
        viewMode: ViewMode.ORBIT,
        cameraPreset: CameraPreset.OVERVIEW,
        isDefault: true,
        isPublic: true,
        camera: {
          position: { x: 0, y: 50, z: 100 },
          target: { x: 0, y: 0, z: 0 },
          fov: 60,
          near: 0.1,
          far: 1000,
          aspect: 16 / 9,
        },
        controls: {
          enableDamping: true,
          dampingFactor: 0.05,
          enableZoom: true,
          enableRotate: true,
          enablePan: true,
          maxDistance: 200,
          minDistance: 10,
          maxPolarAngle: Math.PI,
          minPolarAngle: 0,
          autoRotate: false,
          autoRotateSpeed: 2.0,
        },
        lighting: {
          ambient: { intensity: 0.4, color: '#ffffff' },
          directional: {
            intensity: 0.8,
            color: '#ffffff',
            position: { x: 50, y: 100, z: 50 },
            castShadow: true,
          },
          point: [],
          spot: [],
        },
        environment: {
          skybox: 'default_skybox',
          fog: { enabled: false, color: '#ffffff', near: 1, far: 1000 },
          ground: { texture: 'grass', size: 200, repeat: { x: 10, y: 10 } },
          atmosphere: {
            enabled: false,
            rayleigh: 2,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.8,
          },
        },
        postProcessing: {
          bloom: { enabled: true, threshold: 0.8, strength: 1.5, radius: 0.8 },
          ssao: { enabled: true, radius: 8, intensity: 0.5 },
          dof: {
            enabled: false,
            focusDistance: 50,
            focalLength: 24,
            bokehScale: 2,
          },
          colorCorrection: {
            enabled: true,
            exposure: 0,
            contrast: 0,
            saturation: 0,
            brightness: 0,
          },
        },
        animations: {
          camera: {
            enabled: false,
            type: 'orbit',
            duration: 10,
            easing: 'easeInOutCubic',
            waypoints: [],
          },
          plants: {
            enabled: true,
            windEffect: true,
            growthAnimation: true,
            bloomAnimation: true,
          },
          particles: {
            enabled: true,
            types: ['leaves', 'petals'],
            density: 100,
            lifetime: 5,
          },
        },
        interactions: {
          hoverEffects: true,
          clickEffects: true,
          dragAndDrop: false,
          zoomToHabit: true,
          highlightZones: true,
          tooltips: true,
        },
        performance: {
          maxFPS: 60,
          quality: 'high',
          shadows: true,
          antialiasing: true,
          textureQuality: 'high',
          particleLimit: 1000,
        },
      },
      {
        name: 'First Person Walk',
        description: 'First-person walking experience through the garden',
        viewMode: ViewMode.FIRST_PERSON,
        cameraPreset: CameraPreset.WALKTHROUGH,
        isDefault: true,
        isPublic: true,
        camera: {
          position: { x: 0, y: 1.7, z: 0 },
          target: { x: 0, y: 1.7, z: -1 },
          fov: 75,
          near: 0.1,
          far: 1000,
          aspect: 16 / 9,
        },
        controls: {
          enableDamping: true,
          dampingFactor: 0.1,
          enableZoom: false,
          enableRotate: true,
          enablePan: false,
          maxDistance: 10,
          minDistance: 0.1,
          maxPolarAngle: Math.PI * 0.8,
          minPolarAngle: Math.PI * 0.2,
          autoRotate: false,
          autoRotateSpeed: 2.0,
        },
        lighting: {
          ambient: { intensity: 0.6, color: '#ffffff' },
          directional: {
            intensity: 0.6,
            color: '#ffffff',
            position: { x: 50, y: 100, z: 50 },
            castShadow: true,
          },
          point: [
            {
              intensity: 0.3,
              color: '#ffffff',
              position: { x: 0, y: 2, z: 0 },
              distance: 20,
              decay: 2,
            },
          ],
          spot: [],
        },
        environment: {
          skybox: 'default_skybox',
          fog: { enabled: true, color: '#87CEEB', near: 5, far: 100 },
          ground: { texture: 'path', size: 200, repeat: { x: 5, y: 5 } },
          atmosphere: {
            enabled: true,
            rayleigh: 1,
            mieCoefficient: 0.003,
            mieDirectionalG: 0.8,
          },
        },
        postProcessing: {
          bloom: { enabled: false, threshold: 0.8, strength: 1.5, radius: 0.8 },
          ssao: { enabled: true, radius: 4, intensity: 0.3 },
          dof: {
            enabled: true,
            focusDistance: 5,
            focalLength: 50,
            bokehScale: 1,
          },
          colorCorrection: {
            enabled: true,
            exposure: 0.2,
            contrast: 0.1,
            saturation: 0.1,
            brightness: 0,
          },
        },
        animations: {
          camera: {
            enabled: false,
            type: 'walk',
            duration: 10,
            easing: 'easeInOutCubic',
            waypoints: [],
          },
          plants: {
            enabled: true,
            windEffect: true,
            growthAnimation: false,
            bloomAnimation: false,
          },
          particles: {
            enabled: true,
            types: ['dust', 'leaves'],
            density: 50,
            lifetime: 3,
          },
        },
        interactions: {
          hoverEffects: true,
          clickEffects: true,
          dragAndDrop: false,
          zoomToHabit: false,
          highlightZones: true,
          tooltips: true,
        },
        performance: {
          maxFPS: 60,
          quality: 'medium',
          shadows: true,
          antialiasing: true,
          textureQuality: 'medium',
          particleLimit: 500,
        },
      },
    ];

    for (const preset of defaultPresets) {
      const existingPreset = await this.garden3dViewRepository.findOne({
        where: { name: preset.name, isDefault: true },
      });

      if (!existingPreset) {
        await this.garden3dViewRepository.save(preset);
      }
    }
  }

  async rate3dView(
    id: string,
    rating: number,
    userId: string
  ): Promise<Garden3dViewDto> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const view = await this.garden3dViewRepository.findOne({ where: { id } });
    if (!view) {
      throw new NotFoundException('3D view not found');
    }

    // Update rating
    const currentTotal = view.rating * view.ratingCount;
    view.ratingCount += 1;
    view.rating = (currentTotal + rating) / view.ratingCount;

    const updatedView = await this.garden3dViewRepository.save(view);
    return this.mapToDto(updatedView);
  }

  async search3dViews(
    query: string,
    filters?: {
      viewMode?: ViewMode;
      cameraPreset?: CameraPreset;
      tags?: string[];
      difficulty?: string;
    }
  ): Promise<Garden3dViewDto[]> {
    const queryBuilder = this.garden3dViewRepository
      .createQueryBuilder('view')
      .leftJoinAndSelect('view.user', 'user')
      .where('view.isPublic = :isPublic', { isPublic: true });

    if (query) {
      queryBuilder.andWhere(
        '(view.name ILIKE :query OR view.description ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (filters?.viewMode) {
      queryBuilder.andWhere('view.viewMode = :viewMode', {
        viewMode: filters.viewMode,
      });
    }

    if (filters?.cameraPreset) {
      queryBuilder.andWhere('view.cameraPreset = :cameraPreset', {
        cameraPreset: filters.cameraPreset,
      });
    }

    if (filters?.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags
        .map((_, index) => `view.metadata->>'tags' ILIKE :tag${index}`)
        .join(' OR ');

      queryBuilder.andWhere(`(${tagConditions})`);

      filters.tags.forEach((tag, index) => {
        queryBuilder.setParameter(`tag${index}`, `%${tag}%`);
      });
    }

    if (filters?.difficulty) {
      queryBuilder.andWhere('view.metadata->>difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    const views = await queryBuilder
      .orderBy('view.rating', 'DESC')
      .addOrderBy('view.usageCount', 'DESC')
      .getMany();

    return views.map((view) => this.mapToDto(view));
  }

  private validate3dViewData(viewData: any): void {
    if (
      !viewData.camera ||
      !viewData.camera.position ||
      !viewData.camera.target
    ) {
      throw new BadRequestException(
        '3D view must have valid camera configuration'
      );
    }

    if (!viewData.controls) {
      throw new BadRequestException('3D view must have controls configuration');
    }

    if (!viewData.lighting) {
      throw new BadRequestException('3D view must have lighting configuration');
    }

    if (!viewData.environment) {
      throw new BadRequestException(
        '3D view must have environment configuration'
      );
    }

    if (!viewData.postProcessing) {
      throw new BadRequestException(
        '3D view must have post-processing configuration'
      );
    }

    if (!viewData.animations) {
      throw new BadRequestException(
        '3D view must have animations configuration'
      );
    }

    if (!viewData.interactions) {
      throw new BadRequestException(
        '3D view must have interactions configuration'
      );
    }

    if (!viewData.performance) {
      throw new BadRequestException(
        '3D view must have performance configuration'
      );
    }
  }

  private canUserView3dView(view: Garden3dView, userId?: string): boolean {
    // Public views can be viewed by anyone
    if (view.isPublic) {
      return true;
    }

    // Private views can only be viewed by the owner
    if (userId && view.user_id === userId) {
      return true;
    }

    return false;
  }

  private async update3dViewUsage(view: Garden3dView): Promise<void> {
    view.usageCount += 1;
    view.lastUsed = new Date();
    await this.garden3dViewRepository.save(view);
  }

  private mapToDto(view: Garden3dView): Garden3dViewDto {
    return {
      id: view.id,
      name: view.name,
      description: view.description,
      viewMode: view.viewMode,
      cameraPreset: view.cameraPreset,
      isDefault: view.isDefault,
      isPublic: view.isPublic,
      camera: view.camera,
      controls: view.controls,
      lighting: view.lighting,
      environment: view.environment,
      postProcessing: view.postProcessing,
      animations: view.animations,
      interactions: view.interactions,
      performance: view.performance,
      user: view.user?.id,
      usageCount: view.usageCount,
      rating: view.rating,
      ratingCount: view.ratingCount,
      metadata: view.metadata,
      createdAt: view.createdAt,
      updatedAt: view.updatedAt,
      lastUsed: view.lastUsed,
    };
  }
}
