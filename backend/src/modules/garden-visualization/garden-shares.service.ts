import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GardenShare,
  ShareType,
  ShareStatus,
} from '../../database/entities/garden-share.entity';
import {
  CreateGardenShareDto,
  UpdateGardenShareDto,
  GardenShareDto,
} from './dto/garden-share.dto';
import { User } from '../../database/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GardenSharesService {
  constructor(
    @InjectRepository(GardenShare)
    private readonly gardenShareRepository: Repository<GardenShare>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async createShare(
    createShareDto: CreateGardenShareDto,
    userId: string
  ): Promise<GardenShareDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate unique share code if not provided
    if (!createShareDto.shareCode) {
      createShareDto.shareCode = this.generateShareCode();
    }

    // Generate share URL
    if (!createShareDto.shareUrl) {
      createShareDto.shareUrl = `/share/${createShareDto.shareCode}`;
    }

    // Initialize analytics
    const analytics = {
      lastViewed: new Date(),
      viewHistory: [],
      downloadHistory: [],
      interactionStats: {
        likes: 0,
        comments: 0,
        shares: 0,
        downloads: 0,
        views: 0,
      },
      geographicData: [],
      deviceData: [],
    };

    const share = this.gardenShareRepository.create({
      ...createShareDto,
      user,
      user_id: userId,
      analytics,
      moderation: {
        isModerated: false,
        moderationStatus: 'pending',
        moderationNotes: '',
        reportedBy: [],
        reportReasons: [],
        lastModerated: null,
        moderatedBy: null,
      },
    });

    const savedShare = await this.gardenShareRepository.save(share);
    return this.mapToDto(savedShare);
  }

  async updateShare(
    id: string,
    updateShareDto: UpdateGardenShareDto,
    userId: string
  ): Promise<GardenShareDto> {
    const share = await this.gardenShareRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (share.user_id !== userId) {
      throw new BadRequestException('You can only update your own shares');
    }

    Object.assign(share, updateShareDto);

    // Update status timestamps
    if (
      updateShareDto.status === ShareStatus.ACTIVE &&
      share.status !== ShareStatus.ACTIVE
    ) {
      share.status = ShareStatus.ACTIVE;
    }

    const updatedShare = await this.gardenShareRepository.save(share);
    return this.mapToDto(updatedShare);
  }

  async getShare(
    id: string,
    userId?: string,
    ip?: string
  ): Promise<GardenShareDto> {
    const share = await this.gardenShareRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Check if user can view this share
    if (!this.canUserViewShare(share, userId)) {
      throw new BadRequestException(
        'You do not have permission to view this share'
      );
    }

    // Update analytics
    if (userId || ip) {
      await this.updateShareAnalytics(share, userId, ip);
    }

    return this.mapToDto(share);
  }

  async getShareByCode(
    shareCode: string,
    userId?: string,
    ip?: string
  ): Promise<GardenShareDto> {
    const share = await this.gardenShareRepository.findOne({
      where: { shareCode },
      relations: ['user'],
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Check if share is active
    if (share.status !== ShareStatus.ACTIVE) {
      throw new BadRequestException('This share is no longer active');
    }

    // Check if share has expired
    if (share.sharing?.shareExpiry && new Date() > share.sharing.shareExpiry) {
      throw new BadRequestException('This share has expired');
    }

    // Check access limits
    if (
      share.accessControl?.maxViews &&
      share.viewCount >= share.accessControl.maxViews
    ) {
      throw new BadRequestException('This share has reached its view limit');
    }

    // Update analytics
    if (userId || ip) {
      await this.updateShareAnalytics(share, userId, ip);
    }

    return this.mapToDto(share);
  }

  async getShares(filters?: {
    shareType?: ShareType;
    status?: ShareStatus;
    isPublic?: boolean;
    isFeatured?: boolean;
    userId?: string;
    tags?: string[];
    category?: string;
  }): Promise<GardenShareDto[]> {
    const queryBuilder = this.gardenShareRepository
      .createQueryBuilder('share')
      .leftJoinAndSelect('share.user', 'user');

    if (filters?.shareType) {
      queryBuilder.andWhere('share.shareType = :shareType', {
        shareType: filters.shareType,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('share.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.isPublic !== undefined) {
      queryBuilder.andWhere('share.isPublic = :isPublic', {
        isPublic: filters.isPublic,
      });
    }

    if (filters?.isFeatured !== undefined) {
      queryBuilder.andWhere('share.isFeatured = :isFeatured', {
        isFeatured: filters.isFeatured,
      });
    }

    if (filters?.userId) {
      queryBuilder.andWhere('share.user_id = :userId', {
        userId: filters.userId,
      });
    }

    if (filters?.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags
        .map((_, index) => `share.tags ILIKE :tag${index}`)
        .join(' OR ');

      queryBuilder.andWhere(`(${tagConditions})`);

      filters.tags.forEach((tag, index) => {
        queryBuilder.setParameter(`tag${index}`, `%${tag}%`);
      });
    }

    if (filters?.category) {
      queryBuilder.andWhere('share.category = :category', {
        category: filters.category,
      });
    }

    const shares = await queryBuilder
      .orderBy('share.isFeatured', 'DESC')
      .addOrderBy('share.rating', 'DESC')
      .addOrderBy('share.viewCount', 'DESC')
      .addOrderBy('share.createdAt', 'DESC')
      .getMany();

    return shares.map((share) => this.mapToDto(share));
  }

  async getPublicShares(
    page: number = 1,
    limit: number = 20,
    filters?: {
      shareType?: ShareType;
      tags?: string[];
      category?: string;
      difficulty?: string;
    }
  ): Promise<{
    shares: GardenShareDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.gardenShareRepository
      .createQueryBuilder('share')
      .leftJoinAndSelect('share.user', 'user')
      .where('share.status = :status', { status: ShareStatus.ACTIVE })
      .andWhere('share.isPublic = :isPublic', { isPublic: true });

    if (filters?.shareType) {
      queryBuilder.andWhere('share.shareType = :shareType', {
        shareType: filters.shareType,
      });
    }

    if (filters?.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags
        .map((_, index) => `share.tags ILIKE :tag${index}`)
        .join(' OR ');

      queryBuilder.andWhere(`(${tagConditions})`);

      filters.tags.forEach((tag, index) => {
        queryBuilder.setParameter(`tag${index}`, `%${tag}%`);
      });
    }

    if (filters?.category) {
      queryBuilder.andWhere('share.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.difficulty) {
      queryBuilder.andWhere('share.difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    const total = await queryBuilder.getCount();

    const shares = await queryBuilder
      .orderBy('share.isFeatured', 'DESC')
      .addOrderBy('share.rating', 'DESC')
      .addOrderBy('share.viewCount', 'DESC')
      .addOrderBy('share.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      shares: shares.map((share) => this.mapToDto(share)),
      total,
      page,
      totalPages,
    };
  }

  async getUserShares(
    userId: string,
    includePrivate: boolean = true
  ): Promise<GardenShareDto[]> {
    const queryBuilder = this.gardenShareRepository
      .createQueryBuilder('share')
      .leftJoinAndSelect('share.user', 'user')
      .where('share.user_id = :userId', { userId });

    if (!includePrivate) {
      queryBuilder.andWhere('share.isPublic = :isPublic', { isPublic: true });
    }

    const shares = await queryBuilder
      .orderBy('share.updatedAt', 'DESC')
      .getMany();

    return shares.map((share) => this.mapToDto(share));
  }

  async deleteShare(id: string, userId: string): Promise<void> {
    const share = await this.gardenShareRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (share.user_id !== userId) {
      throw new BadRequestException('You can only delete your own shares');
    }

    await this.gardenShareRepository.remove(share);
  }

  async likeShare(id: string, userId: string): Promise<GardenShareDto> {
    const share = await this.gardenShareRepository.findOne({ where: { id } });
    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (!share.social?.allowLikes) {
      throw new BadRequestException('Likes are not allowed for this share');
    }

    share.likeCount += 1;
    const updatedShare = await this.gardenShareRepository.save(share);
    return this.mapToDto(updatedShare);
  }

  async downloadShare(
    id: string,
    userId: string,
    ip?: string
  ): Promise<GardenShareDto> {
    const share = await this.gardenShareRepository.findOne({ where: { id } });
    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (!share.permissions?.canDownload) {
      throw new BadRequestException('Downloads are not allowed for this share');
    }

    // Check download limits
    if (
      share.accessControl?.maxDownloads &&
      share.downloadCount >= share.accessControl.maxDownloads
    ) {
      throw new BadRequestException(
        'This share has reached its download limit'
      );
    }

    share.downloadCount += 1;
    share.lastDownloaded = new Date();

    // Add to download history
    if (!share.analytics) {
      share.analytics = {
        lastViewed: new Date(),
        viewHistory: [],
        downloadHistory: [],
        interactionStats: {
          likes: 0,
          comments: 0,
          shares: 0,
          downloads: 0,
          views: 0,
        },
        geographicData: [],
        deviceData: [],
      };
    }

    share.analytics.downloadHistory.push({
      date: new Date().toISOString(),
      userId,
      ip: ip || 'unknown',
    });

    const updatedShare = await this.gardenShareRepository.save(share);
    return this.mapToDto(updatedShare);
  }

  async rateShare(
    id: string,
    rating: number,
    userId: string
  ): Promise<GardenShareDto> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const share = await this.gardenShareRepository.findOne({ where: { id } });
    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (!share.social?.allowRatings) {
      throw new BadRequestException('Ratings are not allowed for this share');
    }

    // Update rating
    const currentTotal = share.rating * share.ratingCount;
    share.ratingCount += 1;
    share.rating = (currentTotal + rating) / share.ratingCount;

    const updatedShare = await this.gardenShareRepository.save(share);
    return this.mapToDto(updatedShare);
  }

  async reportShare(id: string, userId: string, reason: string): Promise<void> {
    const share = await this.gardenShareRepository.findOne({ where: { id } });
    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (!share.moderation) {
      share.moderation = {
        isModerated: false,
        moderationStatus: 'pending',
        moderationNotes: '',
        reportedBy: [],
        reportReasons: [],
        lastModerated: null,
        moderatedBy: null,
      };
    }

    // Add report
    if (!share.moderation.reportedBy.includes(userId)) {
      share.moderation.reportedBy.push(userId);
      share.moderation.reportReasons.push(reason);
    }

    await this.gardenShareRepository.save(share);
  }

  async searchShares(
    query: string,
    filters?: {
      shareType?: ShareType;
      tags?: string[];
      category?: string;
      difficulty?: string;
      maxTime?: number;
    }
  ): Promise<GardenShareDto[]> {
    const queryBuilder = this.gardenShareRepository
      .createQueryBuilder('share')
      .leftJoinAndSelect('share.user', 'user')
      .where('share.status = :status', { status: ShareStatus.ACTIVE })
      .andWhere('share.isPublic = :isPublic', { isPublic: true });

    if (query) {
      queryBuilder.andWhere(
        '(share.title ILIKE :query OR share.description ILIKE :query OR share.sharedContent->>name ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (filters?.shareType) {
      queryBuilder.andWhere('share.shareType = :shareType', {
        shareType: filters.shareType,
      });
    }

    if (filters?.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags
        .map((_, index) => `share.tags ILIKE :tag${index}`)
        .join(' OR ');

      queryBuilder.andWhere(`(${tagConditions})`);

      filters.tags.forEach((tag, index) => {
        queryBuilder.setParameter(`tag${index}`, `%${tag}%`);
      });
    }

    if (filters?.category) {
      queryBuilder.andWhere('share.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.difficulty) {
      queryBuilder.andWhere('share.difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    if (filters?.maxTime) {
      queryBuilder.andWhere(
        '(share.sharedContent->metadata->>estimatedTime)::int <= :maxTime',
        { maxTime: filters.maxTime }
      );
    }

    const shares = await queryBuilder
      .orderBy('share.rating', 'DESC')
      .addOrderBy('share.viewCount', 'DESC')
      .getMany();

    return shares.map((share) => this.mapToDto(share));
  }

  async getFeaturedShares(): Promise<GardenShareDto[]> {
    const shares = await this.gardenShareRepository.find({
      where: {
        isFeatured: true,
        status: ShareStatus.ACTIVE,
        isPublic: true,
      },
      relations: ['user'],
      order: {
        rating: 'DESC',
        viewCount: 'DESC',
      },
      take: 10,
    });

    return shares.map((share) => this.mapToDto(share));
  }

  private generateShareCode(): string {
    return uuidv4().replace(/-/g, '').substring(0, 12);
  }

  private canUserViewShare(share: GardenShare, userId?: string): boolean {
    // Public shares can be viewed by anyone
    if (share.isPublic && share.status === ShareStatus.ACTIVE) {
      return true;
    }

    // Private shares can only be viewed by the owner
    if (userId && share.user_id === userId) {
      return true;
    }

    // Check if user is in the allowed users list
    if (userId && share.accessControl?.allowedUsers?.includes(userId)) {
      return true;
    }

    return false;
  }

  private async updateShareAnalytics(
    share: GardenShare,
    userId?: string,
    ip?: string
  ): Promise<void> {
    const now = new Date();

    // Update last viewed
    share.lastViewed = now;

    // Add to view history
    if (!share.analytics) {
      share.analytics = {
        lastViewed: now,
        viewHistory: [],
        downloadHistory: [],
        interactionStats: {
          likes: 0,
          comments: 0,
          shares: 0,
          downloads: 0,
          views: 0,
        },
        geographicData: [],
        deviceData: [],
      };
    }

    // Add view to history (limit to last 100 views)
    share.analytics.viewHistory.push({
      date: now.toISOString(),
      userId: userId || 'anonymous',
      ip: ip || 'unknown',
    });

    if (share.analytics.viewHistory.length > 100) {
      share.analytics.viewHistory = share.analytics.viewHistory.slice(-100);
    }

    // Increment view count
    share.viewCount += 1;

    await this.gardenShareRepository.save(share);
  }

  private mapToDto(share: GardenShare): GardenShareDto {
    return {
      id: share.id,
      title: share.title,
      description: share.description,
      shareType: share.shareType,
      status: share.status,
      shareCode: share.shareCode,
      shareUrl: share.shareUrl,
      password: share.password,
      isPasswordProtected: share.isPasswordProtected,
      isPublic: share.isPublic,
      isFeatured: share.isFeatured,
      viewCount: share.viewCount,
      downloadCount: share.downloadCount,
      likeCount: share.likeCount,
      commentCount: share.commentCount,
      rating: share.rating,
      ratingCount: share.ratingCount,
      sharedContent: share.sharedContent,
      permissions: share.permissions,
      accessControl: share.accessControl,
      sharing: share.sharing,
      analytics: share.analytics,
      moderation: share.moderation,
      social: share.social,
      previewImage: share.previewImage,
      thumbnailImage: share.thumbnailImage,
      screenshots: share.screenshots,
      videoUrl: share.videoUrl,
      instructions: share.instructions,
      user: share.user?.id,
      tags: share.tags,
      category: share.category,
      difficulty: share.difficulty,
      estimatedTime: share.estimatedTime,
      materials: share.materials,
      inspiration: share.inspiration,
      seasonality: share.seasonality,
      maintenance: share.maintenance,
      createdAt: share.createdAt,
      updatedAt: share.updatedAt,
      publishedAt: share.publishedAt,
      featuredAt: share.featuredAt,
      lastViewed: share.lastViewed,
      lastDownloaded: share.lastDownloaded,
    };
  }
}
