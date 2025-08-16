import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GardenTheme,
  ThemeType,
  Season,
} from '../../database/entities/garden-theme.entity';
import {
  CreateGardenThemeDto,
  UpdateGardenThemeDto,
  GardenThemeDto,
} from './dto/garden-theme.dto';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class GardenThemesService {
  constructor(
    @InjectRepository(GardenTheme)
    private readonly gardenThemeRepository: Repository<GardenTheme>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async createTheme(
    createThemeDto: CreateGardenThemeDto,
    userId: string
  ): Promise<GardenThemeDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user meets requirements for the theme
    if (
      createThemeDto.requiredLevel &&
      user.level < createThemeDto.requiredLevel
    ) {
      throw new BadRequestException(
        `User level ${user.level} is below required level ${createThemeDto.requiredLevel}`
      );
    }

    if (
      createThemeDto.requiredPoints &&
      user.points < createThemeDto.requiredPoints
    ) {
      throw new BadRequestException(
        `User points ${user.points} are below required points ${createThemeDto.requiredPoints}`
      );
    }

    if (createThemeDto.requiredAchievement) {
      // Check if user has the required achievement
      const hasAchievement = user.achievementsUnlocked.includes(
        createThemeDto.requiredAchievement
      );
      if (!hasAchievement) {
        throw new BadRequestException(
          `User does not have the required achievement: ${createThemeDto.requiredAchievement}`
        );
      }
    }

    const theme = this.gardenThemeRepository.create({
      ...createThemeDto,
      createdBy: user,
      created_by: userId,
    });

    const savedTheme = await this.gardenThemeRepository.save(theme);
    return this.mapToDto(savedTheme);
  }

  async updateTheme(
    id: string,
    updateThemeDto: UpdateGardenThemeDto,
    userId: string
  ): Promise<GardenThemeDto> {
    const theme = await this.gardenThemeRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    if (theme.created_by !== userId) {
      throw new BadRequestException('You can only update your own themes');
    }

    // Check if user meets new requirements
    if (
      updateThemeDto.requiredLevel ||
      updateThemeDto.requiredPoints ||
      updateThemeDto.requiredAchievement
    ) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const newRequiredLevel =
        updateThemeDto.requiredLevel ?? theme.requiredLevel;
      const newRequiredPoints =
        updateThemeDto.requiredPoints ?? theme.requiredPoints;
      const newRequiredAchievement =
        updateThemeDto.requiredAchievement ?? theme.requiredAchievement;

      if (newRequiredLevel && user.level < newRequiredLevel) {
        throw new BadRequestException(
          `User level ${user.level} is below required level ${newRequiredLevel}`
        );
      }

      if (newRequiredPoints && user.points < newRequiredPoints) {
        throw new BadRequestException(
          `User points ${user.points} are below required points ${newRequiredPoints}`
        );
      }

      if (
        newRequiredAchievement &&
        !user.achievementsUnlocked.includes(newRequiredAchievement)
      ) {
        throw new BadRequestException(
          `User does not have the required achievement: ${newRequiredAchievement}`
        );
      }
    }

    Object.assign(theme, updateThemeDto);
    const updatedTheme = await this.gardenThemeRepository.save(theme);
    return this.mapToDto(updatedTheme);
  }

  async getTheme(id: string): Promise<GardenThemeDto> {
    const theme = await this.gardenThemeRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    return this.mapToDto(theme);
  }

  async getThemes(filters?: {
    type?: ThemeType;
    season?: Season;
    isActive?: boolean;
    isPublic?: boolean;
    userId?: string;
  }): Promise<GardenThemeDto[]> {
    const queryBuilder = this.gardenThemeRepository
      .createQueryBuilder('theme')
      .leftJoinAndSelect('theme.createdBy', 'createdBy');

    if (filters?.type) {
      queryBuilder.andWhere('theme.type = :type', { type: filters.type });
    }

    if (filters?.season) {
      queryBuilder.andWhere('theme.season = :season', {
        season: filters.season,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('theme.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.isPublic !== undefined) {
      queryBuilder.andWhere('theme.isPublic = :isPublic', {
        isPublic: filters.isPublic,
      });
    }

    if (filters?.userId) {
      queryBuilder.andWhere('theme.created_by = :userId', {
        userId: filters.userId,
      });
    }

    const themes = await queryBuilder
      .orderBy('theme.createdAt', 'DESC')
      .getMany();

    return themes.map((theme) => this.mapToDto(theme));
  }

  async getAvailableThemes(userId: string): Promise<GardenThemeDto[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.gardenThemeRepository
      .createQueryBuilder('theme')
      .leftJoinAndSelect('theme.createdBy', 'createdBy')
      .where('theme.isActive = :isActive', { isActive: true })
      .andWhere('theme.isHidden = :isHidden', { isHidden: false });

    // Get themes that user meets requirements for
    queryBuilder.andWhere(
      '(theme.requiredLevel <= :userLevel OR theme.requiredLevel = 0)',
      { userLevel: user.level }
    );

    queryBuilder.andWhere(
      '(theme.requiredPoints <= :userPoints OR theme.requiredPoints = 0)',
      { userPoints: user.points }
    );

    // Get themes that don't require specific achievements or user has them
    if (user.achievementsUnlocked.length > 0) {
      queryBuilder.andWhere(
        '(theme.requiredAchievement IS NULL OR theme.requiredAchievement IN (:...userAchievements))',
        { userAchievements: user.achievementsUnlocked }
      );
    } else {
      queryBuilder.andWhere('theme.requiredAchievement IS NULL');
    }

    // Check seasonal availability
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    let currentSeason: Season;

    if (currentMonth >= 2 && currentMonth <= 4) {
      currentSeason = Season.SPRING;
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      currentSeason = Season.SUMMER;
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      currentSeason = Season.AUTUMN;
    } else {
      currentSeason = Season.WINTER;
    }

    // Include seasonal themes and non-seasonal themes
    queryBuilder.andWhere(
      '(theme.season = :currentSeason OR theme.season IS NULL)',
      { currentSeason }
    );

    // Check time-based availability
    queryBuilder.andWhere(
      '(theme.availableFrom IS NULL OR theme.availableFrom <= :currentDate)',
      { currentDate }
    );

    queryBuilder.andWhere(
      '(theme.availableUntil IS NULL OR theme.availableUntil >= :currentDate)',
      { currentDate }
    );

    const themes = await queryBuilder
      .orderBy('theme.isDefault', 'DESC')
      .addOrderBy('theme.rating', 'DESC')
      .addOrderBy('theme.usageCount', 'DESC')
      .getMany();

    return themes.map((theme) => this.mapToDto(theme));
  }

  async getSeasonalThemes(season?: Season): Promise<GardenThemeDto[]> {
    const currentSeason = season || this.getCurrentSeason();

    const themes = await this.gardenThemeRepository.find({
      where: {
        season: currentSeason,
        isActive: true,
        isHidden: false,
      },
      relations: ['createdBy'],
      order: {
        isDefault: 'DESC',
        rating: 'DESC',
        usageCount: 'DESC',
      },
    });

    return themes.map((theme) => this.mapToDto(theme));
  }

  async getDefaultThemes(): Promise<GardenThemeDto[]> {
    const themes = await this.gardenThemeRepository.find({
      where: {
        isDefault: true,
        isActive: true,
      },
      relations: ['createdBy'],
      order: {
        rating: 'DESC',
        usageCount: 'DESC',
      },
    });

    return themes.map((theme) => this.mapToDto(theme));
  }

  async deleteTheme(id: string, userId: string): Promise<void> {
    const theme = await this.gardenThemeRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    if (theme.created_by !== userId) {
      throw new BadRequestException('You can only delete your own themes');
    }

    if (theme.isDefault) {
      throw new BadRequestException('Cannot delete default themes');
    }

    await this.gardenThemeRepository.remove(theme);
  }

  async rateTheme(
    id: string,
    rating: number,
    userId: string
  ): Promise<GardenThemeDto> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const theme = await this.gardenThemeRepository.findOne({ where: { id } });
    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    // Update rating
    const currentTotal = theme.rating * theme.ratingCount;
    theme.ratingCount += 1;
    theme.rating = (currentTotal + rating) / theme.ratingCount;

    const updatedTheme = await this.gardenThemeRepository.save(theme);
    return this.mapToDto(updatedTheme);
  }

  async incrementUsage(id: string): Promise<void> {
    const theme = await this.gardenThemeRepository.findOne({ where: { id } });
    if (theme) {
      theme.usageCount += 1;
      await this.gardenThemeRepository.save(theme);
    }
  }

  async searchThemes(
    query: string,
    filters?: {
      type?: ThemeType;
      season?: Season;
      tags?: string[];
    }
  ): Promise<GardenThemeDto[]> {
    const queryBuilder = this.gardenThemeRepository
      .createQueryBuilder('theme')
      .leftJoinAndSelect('theme.createdBy', 'createdBy')
      .where('theme.isActive = :isActive', { isActive: true })
      .andWhere('theme.isHidden = :isHidden', { isHidden: false });

    if (query) {
      queryBuilder.andWhere(
        '(theme.name ILIKE :query OR theme.description ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (filters?.type) {
      queryBuilder.andWhere('theme.type = :type', { type: filters.type });
    }

    if (filters?.season) {
      queryBuilder.andWhere('theme.season = :season', {
        season: filters.season,
      });
    }

    if (filters?.tags && filters.tags.length > 0) {
      // Search for themes that contain any of the specified tags
      const tagConditions = filters.tags
        .map((_, index) => `theme.visualConfig->>'tags' ILIKE :tag${index}`)
        .join(' OR ');

      queryBuilder.andWhere(`(${tagConditions})`);

      filters.tags.forEach((tag, index) => {
        queryBuilder.setParameter(`tag${index}`, `%${tag}%`);
      });
    }

    const themes = await queryBuilder
      .orderBy('theme.rating', 'DESC')
      .addOrderBy('theme.usageCount', 'DESC')
      .getMany();

    return themes.map((theme) => this.mapToDto(theme));
  }

  private getCurrentSeason(): Season {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    if (currentMonth >= 2 && currentMonth <= 4) {
      return Season.SPRING;
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      return Season.SUMMER;
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      return Season.AUTUMN;
    } else {
      return Season.WINTER;
    }
  }

  private mapToDto(theme: GardenTheme): GardenThemeDto {
    return {
      id: theme.id,
      name: theme.name,
      description: theme.description,
      type: theme.type,
      season: theme.season,
      holiday: theme.holiday,
      requiredLevel: theme.requiredLevel,
      requiredPoints: theme.requiredPoints,
      requiredAchievement: theme.requiredAchievement,
      isActive: theme.isActive,
      isDefault: theme.isDefault,
      isHidden: theme.isHidden,
      visualConfig: theme.visualConfig,
      plantStyles: theme.plantStyles,
      decorations: theme.decorations,
      previewImage: theme.previewImage,
      thumbnailImage: theme.thumbnailImage,
      createdBy: theme.createdBy?.id,
      usageCount: theme.usageCount,
      rating: theme.rating,
      ratingCount: theme.ratingCount,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
      availableFrom: theme.availableFrom,
      availableUntil: theme.availableUntil,
    };
  }
}
