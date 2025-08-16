import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GardenLayout,
  LayoutType,
  LayoutStatus,
} from '../../database/entities/garden-layout.entity';
import {
  CreateGardenLayoutDto,
  UpdateGardenLayoutDto,
  GardenLayoutDto,
} from './dto/garden-layout.dto';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class GardenLayoutsService {
  constructor(
    @InjectRepository(GardenLayout)
    private readonly gardenLayoutRepository: Repository<GardenLayout>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async createLayout(
    createLayoutDto: CreateGardenLayoutDto,
    userId: string
  ): Promise<GardenLayoutDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate layout data
    this.validateLayoutData(createLayoutDto.layout);

    const layout = this.gardenLayoutRepository.create({
      ...createLayoutDto,
      user,
      user_id: userId,
      analytics: {
        lastViewed: new Date(),
        viewHistory: [],
        interactionStats: {
          likes: 0,
          comments: 0,
          shares: 0,
          downloads: 0,
        },
      },
    });

    const savedLayout = await this.gardenLayoutRepository.save(layout);
    return this.mapToDto(savedLayout);
  }

  async updateLayout(
    id: string,
    updateLayoutDto: UpdateGardenLayoutDto,
    userId: string
  ): Promise<GardenLayoutDto> {
    const layout = await this.gardenLayoutRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!layout) {
      throw new NotFoundException('Layout not found');
    }

    if (layout.user_id !== userId) {
      throw new BadRequestException('You can only update your own layouts');
    }

    // Validate layout data if it's being updated
    if (updateLayoutDto.layout) {
      this.validateLayoutData(updateLayoutDto.layout);
    }

    Object.assign(layout, updateLayoutDto);

    // Update status timestamps
    if (
      updateLayoutDto.status === LayoutStatus.PUBLISHED &&
      layout.status !== LayoutStatus.PUBLISHED
    ) {
      layout.publishedAt = new Date();
    }

    const updatedLayout = await this.gardenLayoutRepository.save(layout);
    return this.mapToDto(updatedLayout);
  }

  async getLayout(id: string, userId?: string): Promise<GardenLayoutDto> {
    const layout = await this.gardenLayoutRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!layout) {
      throw new NotFoundException('Layout not found');
    }

    // Check if user can view this layout
    if (!this.canUserViewLayout(layout, userId)) {
      throw new BadRequestException(
        'You do not have permission to view this layout'
      );
    }

    // Update view count and analytics
    if (userId) {
      await this.updateLayoutAnalytics(layout, userId);
    }

    return this.mapToDto(layout);
  }

  async getLayouts(filters?: {
    type?: LayoutType;
    status?: LayoutStatus;
    isPublic?: boolean;
    isFeatured?: boolean;
    userId?: string;
    tags?: string[];
    difficulty?: string;
  }): Promise<GardenLayoutDto[]> {
    const queryBuilder = this.gardenLayoutRepository
      .createQueryBuilder('layout')
      .leftJoinAndSelect('layout.user', 'user');

    if (filters?.type) {
      queryBuilder.andWhere('layout.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      queryBuilder.andWhere('layout.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.isPublic !== undefined) {
      queryBuilder.andWhere('layout.isPublic = :isPublic', {
        isPublic: filters.isPublic,
      });
    }

    if (filters?.isFeatured !== undefined) {
      queryBuilder.andWhere('layout.isFeatured = :isFeatured', {
        isFeatured: filters.isFeatured,
      });
    }

    if (filters?.userId) {
      queryBuilder.andWhere('layout.user_id = :userId', {
        userId: filters.userId,
      });
    }

    if (filters?.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags
        .map((_, index) => `layout.metadata->>'tags' ILIKE :tag${index}`)
        .join(' OR ');

      queryBuilder.andWhere(`(${tagConditions})`);

      filters.tags.forEach((tag, index) => {
        queryBuilder.setParameter(`tag${index}`, `%${tag}%`);
      });
    }

    if (filters?.difficulty) {
      queryBuilder.andWhere('layout.metadata->>difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    const layouts = await queryBuilder
      .orderBy('layout.isFeatured', 'DESC')
      .addOrderBy('layout.rating', 'DESC')
      .addOrderBy('layout.viewCount', 'DESC')
      .addOrderBy('layout.createdAt', 'DESC')
      .getMany();

    return layouts.map((layout) => this.mapToDto(layout));
  }

  async getPublicLayouts(
    page: number = 1,
    limit: number = 20,
    filters?: {
      type?: LayoutType;
      tags?: string[];
      difficulty?: string;
      category?: string;
    }
  ): Promise<{
    layouts: GardenLayoutDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.gardenLayoutRepository
      .createQueryBuilder('layout')
      .leftJoinAndSelect('layout.user', 'user')
      .where('layout.status = :status', { status: LayoutStatus.PUBLISHED })
      .andWhere('layout.isPublic = :isPublic', { isPublic: true });

    if (filters?.type) {
      queryBuilder.andWhere('layout.type = :type', { type: filters.type });
    }

    if (filters?.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags
        .map((_, index) => `layout.metadata->>'tags' ILIKE :tag${index}`)
        .join(' OR ');

      queryBuilder.andWhere(`(${tagConditions})`);

      filters.tags.forEach((tag, index) => {
        queryBuilder.setParameter(`tag${index}`, `%${tag}%`);
      });
    }

    if (filters?.difficulty) {
      queryBuilder.andWhere('layout.metadata->>difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    if (filters?.category) {
      queryBuilder.andWhere('layout.metadata->>category = :category', {
        category: filters.category,
      });
    }

    const total = await queryBuilder.getCount();

    const layouts = await queryBuilder
      .orderBy('layout.isFeatured', 'DESC')
      .addOrderBy('layout.rating', 'DESC')
      .addOrderBy('layout.viewCount', 'DESC')
      .addOrderBy('layout.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      layouts: layouts.map((layout) => this.mapToDto(layout)),
      total,
      page,
      totalPages,
    };
  }

  async getUserLayouts(
    userId: string,
    includePrivate: boolean = true
  ): Promise<GardenLayoutDto[]> {
    const queryBuilder = this.gardenLayoutRepository
      .createQueryBuilder('layout')
      .leftJoinAndSelect('layout.user', 'user')
      .where('layout.user_id = :userId', { userId });

    if (!includePrivate) {
      queryBuilder.andWhere('layout.isPublic = :isPublic', { isPublic: true });
    }

    const layouts = await queryBuilder
      .orderBy('layout.updatedAt', 'DESC')
      .getMany();

    return layouts.map((layout) => this.mapToDto(layout));
  }

  async deleteLayout(id: string, userId: string): Promise<void> {
    const layout = await this.gardenLayoutRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!layout) {
      throw new NotFoundException('Layout not found');
    }

    if (layout.user_id !== userId) {
      throw new BadRequestException('You can only delete your own layouts');
    }

    await this.gardenLayoutRepository.remove(layout);
  }

  async publishLayout(id: string, userId: string): Promise<GardenLayoutDto> {
    const layout = await this.gardenLayoutRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!layout) {
      throw new NotFoundException('Layout not found');
    }

    if (layout.user_id !== userId) {
      throw new BadRequestException('You can only publish your own layouts');
    }

    layout.status = LayoutStatus.PUBLISHED;
    layout.publishedAt = new Date();

    const updatedLayout = await this.gardenLayoutRepository.save(layout);
    return this.mapToDto(updatedLayout);
  }

  async archiveLayout(id: string, userId: string): Promise<GardenLayoutDto> {
    const layout = await this.gardenLayoutRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!layout) {
      throw new NotFoundException('Layout not found');
    }

    if (layout.user_id !== userId) {
      throw new BadRequestException('You can only archive your own layouts');
    }

    layout.status = LayoutStatus.ARCHIVED;

    const updatedLayout = await this.gardenLayoutRepository.save(layout);
    return this.mapToDto(updatedLayout);
  }

  async likeLayout(id: string, userId: string): Promise<GardenLayoutDto> {
    const layout = await this.gardenLayoutRepository.findOne({ where: { id } });
    if (!layout) {
      throw new NotFoundException('Layout not found');
    }

    layout.likeCount += 1;
    const updatedLayout = await this.gardenLayoutRepository.save(layout);
    return this.mapToDto(updatedLayout);
  }

  async downloadLayout(id: string, userId: string): Promise<GardenLayoutDto> {
    const layout = await this.gardenLayoutRepository.findOne({ where: { id } });
    if (!layout) {
      throw new NotFoundException('Layout not found');
    }

    layout.downloadCount += 1;
    const updatedLayout = await this.gardenLayoutRepository.save(layout);
    return this.mapToDto(updatedLayout);
  }

  async rateLayout(
    id: string,
    rating: number,
    userId: string
  ): Promise<GardenLayoutDto> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const layout = await this.gardenLayoutRepository.findOne({ where: { id } });
    if (!layout) {
      throw new NotFoundException('Layout not found');
    }

    // Update rating
    const currentTotal = layout.rating * layout.ratingCount;
    layout.ratingCount += 1;
    layout.rating = (currentTotal + rating) / layout.ratingCount;

    const updatedLayout = await this.gardenLayoutRepository.save(layout);
    return this.mapToDto(updatedLayout);
  }

  async searchLayouts(
    query: string,
    filters?: {
      type?: LayoutType;
      tags?: string[];
      difficulty?: string;
      category?: string;
      maxTime?: number;
    }
  ): Promise<GardenLayoutDto[]> {
    const queryBuilder = this.gardenLayoutRepository
      .createQueryBuilder('layout')
      .leftJoinAndSelect('layout.user', 'user')
      .where('layout.status = :status', { status: LayoutStatus.PUBLISHED })
      .andWhere('layout.isPublic = :isPublic', { isPublic: true });

    if (query) {
      queryBuilder.andWhere(
        '(layout.name ILIKE :query OR layout.description ILIKE :query OR layout.metadata->>inspiration ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (filters?.type) {
      queryBuilder.andWhere('layout.type = :type', { type: filters.type });
    }

    if (filters?.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags
        .map((_, index) => `layout.metadata->>'tags' ILIKE :tag${index}`)
        .join(' OR ');

      queryBuilder.andWhere(`(${tagConditions})`);

      filters.tags.forEach((tag, index) => {
        queryBuilder.setParameter(`tag${index}`, `%${tag}%`);
      });
    }

    if (filters?.difficulty) {
      queryBuilder.andWhere('layout.metadata->>difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    if (filters?.category) {
      queryBuilder.andWhere('layout.metadata->>category = :category', {
        category: filters.category,
      });
    }

    if (filters?.maxTime) {
      queryBuilder.andWhere(
        '(layout.metadata->>estimatedTime)::int <= :maxTime',
        { maxTime: filters.maxTime }
      );
    }

    const layouts = await queryBuilder
      .orderBy('layout.rating', 'DESC')
      .addOrderBy('layout.viewCount', 'DESC')
      .getMany();

    return layouts.map((layout) => this.mapToDto(layout));
  }

  async getFeaturedLayouts(): Promise<GardenLayoutDto[]> {
    const layouts = await this.gardenLayoutRepository.find({
      where: {
        isFeatured: true,
        status: LayoutStatus.PUBLISHED,
        isPublic: true,
      },
      relations: ['user'],
      order: {
        rating: 'DESC',
        viewCount: 'DESC',
      },
      take: 10,
    });

    return layouts.map((layout) => this.mapToDto(layout));
  }

  private validateLayoutData(layout: any): void {
    if (!layout.gridSize || !layout.gridSize.width || !layout.gridSize.height) {
      throw new BadRequestException('Layout must have valid grid size');
    }

    if (layout.gridSize.width < 1 || layout.gridSize.height < 1) {
      throw new BadRequestException('Grid dimensions must be positive');
    }

    if (layout.zones && !Array.isArray(layout.zones)) {
      throw new BadRequestException('Zones must be an array');
    }

    if (layout.paths && !Array.isArray(layout.paths)) {
      throw new BadRequestException('Paths must be an array');
    }
  }

  private canUserViewLayout(layout: GardenLayout, userId?: string): boolean {
    // Public layouts can be viewed by anyone
    if (layout.isPublic && layout.status === LayoutStatus.PUBLISHED) {
      return true;
    }

    // Private layouts can only be viewed by the owner
    if (userId && layout.user_id === userId) {
      return true;
    }

    // Check if user is in the permissions list
    if (userId && layout.permissions?.canView?.includes(userId)) {
      return true;
    }

    return false;
  }

  private async updateLayoutAnalytics(
    layout: GardenLayout,
    userId: string
  ): Promise<void> {
    const now = new Date();

    // Update last viewed
    layout.lastViewed = now;

    // Add to view history
    if (!layout.analytics) {
      layout.analytics = {
        lastViewed: now,
        viewHistory: [],
        interactionStats: {
          likes: 0,
          comments: 0,
          shares: 0,
          downloads: 0,
        },
      };
    }

    // Add view to history (limit to last 100 views)
    layout.analytics.viewHistory.push({
      date: now.toISOString(),
      userId,
    });

    if (layout.analytics.viewHistory.length > 100) {
      layout.analytics.viewHistory = layout.analytics.viewHistory.slice(-100);
    }

    // Increment view count
    layout.viewCount += 1;

    await this.gardenLayoutRepository.save(layout);
  }

  private mapToDto(layout: GardenLayout): GardenLayoutDto {
    return {
      id: layout.id,
      name: layout.name,
      description: layout.description,
      type: layout.type,
      status: layout.status,
      isPublic: layout.isPublic,
      isFeatured: layout.isFeatured,
      viewCount: layout.viewCount,
      likeCount: layout.likeCount,
      downloadCount: layout.downloadCount,
      rating: layout.rating,
      ratingCount: layout.ratingCount,
      layout: layout.layout,
      metadata: layout.metadata,
      previewImage: layout.previewImage,
      thumbnailImage: layout.thumbnailImage,
      screenshots: layout.screenshots,
      videoUrl: layout.videoUrl,
      instructions: layout.instructions,
      user: layout.user?.id,
      permissions: layout.permissions,
      sharing: layout.sharing,
      analytics: layout.analytics,
      createdAt: layout.createdAt,
      updatedAt: layout.updatedAt,
      publishedAt: layout.publishedAt,
      featuredAt: layout.featuredAt,
    };
  }
}
