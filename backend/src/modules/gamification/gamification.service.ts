import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  In,
} from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Habit } from '../../database/entities/habit.entity';
import { HabitLog } from '../../database/entities/habit-log.entity';
import { Achievement } from '../../database/entities/achievement.entity';
import { UserAchievement } from '../../database/entities/user-achievement.entity';
import { Leaderboard } from '../../database/entities/leaderboard.entity';
import { LeaderboardEntry } from '../../database/entities/leaderboard-entry.entity';
import { Challenge } from '../../database/entities/challenge.entity';
import { UserChallenge } from '../../database/entities/user-challenge.entity';
import {
  CreateAchievementDto,
  UpdateAchievementDto,
  AchievementDto,
  UserAchievementDto,
} from './dto/achievement.dto';
import {
  CreateLeaderboardDto,
  UpdateLeaderboardDto,
  LeaderboardDto,
  LeaderboardEntryDto,
} from './dto/leaderboard.dto';
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  ChallengeDto,
  UserChallengeDto,
} from './dto/challenge.dto';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Habit)
    private habitsRepository: Repository<Habit>,
    @InjectRepository(HabitLog)
    private habitLogsRepository: Repository<HabitLog>,
    @InjectRepository(Achievement)
    private achievementsRepository: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private userAchievementsRepository: Repository<UserAchievement>,
    @InjectRepository(Leaderboard)
    private leaderboardsRepository: Repository<Leaderboard>,
    @InjectRepository(LeaderboardEntry)
    private leaderboardEntriesRepository: Repository<LeaderboardEntry>,
    @InjectRepository(Challenge)
    private challengesRepository: Repository<Challenge>,
    @InjectRepository(UserChallenge)
    private userChallengesRepository: Repository<UserChallenge>
  ) {}

  // ==================== ACHIEVEMENTS ====================

  async createAchievement(
    createAchievementDto: CreateAchievementDto
  ): Promise<AchievementDto> {
    const achievement =
      this.achievementsRepository.create(createAchievementDto);
    const savedAchievement =
      await this.achievementsRepository.save(achievement);

    return this.mapAchievementToDto(savedAchievement);
  }

  async updateAchievement(
    id: number,
    updateAchievementDto: UpdateAchievementDto
  ): Promise<AchievementDto> {
    const achievement = await this.achievementsRepository.findOne({
      where: { id },
    });
    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }

    Object.assign(achievement, updateAchievementDto);
    const updatedAchievement =
      await this.achievementsRepository.save(achievement);

    return this.mapAchievementToDto(updatedAchievement);
  }

  async getAchievement(id: number): Promise<AchievementDto> {
    const achievement = await this.achievementsRepository.findOne({
      where: { id },
    });
    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }

    return this.mapAchievementToDto(achievement);
  }

  async getAchievements(
    type?: string,
    tier?: string,
    isActive?: boolean,
    limit: number = 50,
    offset: number = 0
  ): Promise<AchievementDto[]> {
    const queryBuilder =
      this.achievementsRepository.createQueryBuilder('achievement');

    if (type) {
      queryBuilder.andWhere('achievement.type = :type', { type });
    }
    if (tier) {
      queryBuilder.andWhere('achievement.tier = :tier', { tier });
    }
    if (isActive !== undefined) {
      queryBuilder.andWhere('achievement.isActive = :isActive', { isActive });
    }

    const achievements = await queryBuilder
      .orderBy('achievement.points', 'DESC')
      .addOrderBy('achievement.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return achievements.map((achievement) =>
      this.mapAchievementToDto(achievement)
    );
  }

  async getUserAchievements(userId: number): Promise<UserAchievementDto[]> {
    const userAchievements = await this.userAchievementsRepository.find({
      where: { userId },
      relations: ['achievement'],
      order: { earnedAt: 'DESC' },
    });

    return userAchievements.map((ua) => this.mapUserAchievementToDto(ua));
  }

  async checkAndAwardAchievements(
    userId: number
  ): Promise<UserAchievementDto[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['habits', 'habitLogs'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const allAchievements = await this.achievementsRepository.find({
      where: { isActive: true },
    });

    const earnedAchievements: UserAchievementDto[] = [];

    for (const achievement of allAchievements) {
      // Check if user already has this achievement
      const existingUserAchievement =
        await this.userAchievementsRepository.findOne({
          where: { userId, achievementId: achievement.id },
        });

      if (existingUserAchievement) {
        continue;
      }

      // Check if user meets the criteria
      if (await this.checkAchievementCriteria(user, achievement)) {
        const userAchievement = this.userAchievementsRepository.create({
          userId,
          achievementId: achievement.id,
          earnedAt: new Date(),
          progress: JSON.stringify(
            await this.getAchievementProgress(user, achievement)
          ),
        });

        const savedUserAchievement =
          await this.userAchievementsRepository.save(userAchievement);

        // Award points to user
        await this.awardPoints(userId, achievement.points);

        // Update user stats
        await this.updateUserStats(userId);

        earnedAchievements.push(
          this.mapUserAchievementToDto(savedUserAchievement)
        );
      }
    }

    return earnedAchievements;
  }

  private async checkAchievementCriteria(
    user: User,
    achievement: Achievement
  ): Promise<boolean> {
    const criteria = achievement.criteria;

    if (criteria.habitCount && user.habits.length < criteria.habitCount) {
      return false;
    }

    if (criteria.streakDays && user.currentStreak < criteria.streakDays) {
      return false;
    }

    if (criteria.perfectDays && user.perfectDays < criteria.perfectDays) {
      return false;
    }

    if (criteria.habitCategory) {
      const categoryHabits = user.habits.filter(
        (h) => h.category === criteria.habitCategory
      );
      if (categoryHabits.length === 0) {
        return false;
      }
    }

    if (criteria.completionCount) {
      const totalCompletions = user.habitLogs.filter(
        (log) => log.status === 'completed'
      ).length;
      if (totalCompletions < criteria.completionCount) {
        return false;
      }
    }

    return true;
  }

  private async getAchievementProgress(
    user: User,
    achievement: Achievement
  ): Promise<any> {
    const progress: any = {};

    if (achievement.criteria.habitCount) {
      progress.habitCount = user.habits.length;
    }

    if (achievement.criteria.streakDays) {
      progress.currentStreak = user.currentStreak;
    }

    if (achievement.criteria.perfectDays) {
      progress.perfectDays = user.perfectDays;
    }

    if (achievement.criteria.completionCount) {
      progress.totalCompletions = user.habitLogs.filter(
        (log) => log.status === 'completed'
      ).length;
    }

    return progress;
  }

  // ==================== LEADERBOARDS ====================

  async createLeaderboard(
    createLeaderboardDto: CreateLeaderboardDto
  ): Promise<LeaderboardDto> {
    const leaderboard =
      this.leaderboardsRepository.create(createLeaderboardDto);
    const savedLeaderboard =
      await this.leaderboardsRepository.save(leaderboard);

    return this.mapLeaderboardToDto(savedLeaderboard);
  }

  async updateLeaderboard(
    id: number,
    updateLeaderboardDto: UpdateLeaderboardDto
  ): Promise<LeaderboardDto> {
    const leaderboard = await this.leaderboardsRepository.findOne({
      where: { id },
    });
    if (!leaderboard) {
      throw new NotFoundException(`Leaderboard with ID ${id} not found`);
    }

    Object.assign(leaderboard, updateLeaderboardDto);
    const updatedLeaderboard =
      await this.leaderboardsRepository.save(leaderboard);

    return this.mapLeaderboardToDto(updatedLeaderboard);
  }

  async getLeaderboard(id: number): Promise<LeaderboardDto> {
    const leaderboard = await this.leaderboardsRepository.findOne({
      where: { id },
    });
    if (!leaderboard) {
      throw new NotFoundException(`Leaderboard with ID ${id} not found`);
    }

    return this.mapLeaderboardToDto(leaderboard);
  }

  async getLeaderboards(
    type?: string,
    isActive?: boolean,
    limit: number = 20,
    offset: number = 0
  ): Promise<LeaderboardDto[]> {
    const queryBuilder =
      this.leaderboardsRepository.createQueryBuilder('leaderboard');

    if (type) {
      queryBuilder.andWhere('leaderboard.type = :type', { type });
    }
    if (isActive !== undefined) {
      queryBuilder.andWhere('leaderboard.isActive = :isActive', { isActive });
    }

    const leaderboards = await queryBuilder
      .orderBy('leaderboard.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return leaderboards.map((leaderboard) =>
      this.mapLeaderboardToDto(leaderboard)
    );
  }

  async getLeaderboardEntries(
    leaderboardId: number,
    limit: number = 100,
    offset: number = 0
  ): Promise<LeaderboardEntryDto[]> {
    const entries = await this.leaderboardEntriesRepository.find({
      where: { leaderboardId },
      relations: ['user'],
      order: { rank: 'ASC' },
      limit,
      offset,
    });

    return entries.map((entry) => this.mapLeaderboardEntryToDto(entry));
  }

  async updateLeaderboardScore(
    leaderboardId: number,
    userId: number,
    score: number,
    metadata?: any
  ): Promise<LeaderboardEntryDto> {
    let entry = await this.leaderboardEntriesRepository.findOne({
      where: { leaderboardId, userId },
    });

    if (!entry) {
      entry = this.leaderboardEntriesRepository.create({
        leaderboardId,
        userId,
        score,
        metadata,
        lastUpdated: new Date(),
      });
    } else {
      entry.score = score;
      entry.metadata = metadata;
      entry.lastUpdated = new Date();
    }

    const savedEntry = await this.leaderboardEntriesRepository.save(entry);

    // Recalculate ranks for this leaderboard
    await this.recalculateLeaderboardRanks(leaderboardId);

    return this.mapLeaderboardEntryToDto(savedEntry);
  }

  private async recalculateLeaderboardRanks(
    leaderboardId: number
  ): Promise<void> {
    const entries = await this.leaderboardEntriesRepository.find({
      where: { leaderboardId },
      order: { score: 'DESC' },
    });

    for (let i = 0; i < entries.length; i++) {
      entries[i].rank = i + 1;
    }

    await this.leaderboardEntriesRepository.save(entries);
  }

  // ==================== CHALLENGES ====================

  async createChallenge(
    createChallengeDto: CreateChallengeDto
  ): Promise<ChallengeDto> {
    const challenge = this.challengesRepository.create(createChallengeDto);
    const savedChallenge = await this.challengesRepository.save(challenge);

    return this.mapChallengeToDto(savedChallenge);
  }

  async updateChallenge(
    id: number,
    updateChallengeDto: UpdateChallengeDto
  ): Promise<ChallengeDto> {
    const challenge = await this.challengesRepository.findOne({
      where: { id },
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }

    Object.assign(challenge, updateChallengeDto);
    const updatedChallenge = await this.challengesRepository.save(challenge);

    return this.mapChallengeToDto(updatedChallenge);
  }

  async getChallenge(id: number): Promise<ChallengeDto> {
    const challenge = await this.challengesRepository.findOne({
      where: { id },
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }

    return this.mapChallengeToDto(challenge);
  }

  async getChallenges(
    type?: string,
    difficulty?: string,
    status?: string,
    isPublic?: boolean,
    limit: number = 20,
    offset: number = 0
  ): Promise<ChallengeDto[]> {
    const queryBuilder =
      this.challengesRepository.createQueryBuilder('challenge');

    if (type) {
      queryBuilder.andWhere('challenge.type = :type', { type });
    }
    if (difficulty) {
      queryBuilder.andWhere('challenge.difficulty = :difficulty', {
        difficulty,
      });
    }
    if (status) {
      queryBuilder.andWhere('challenge.status = :status', { status });
    }
    if (isPublic !== undefined) {
      queryBuilder.andWhere('challenge.isPublic = :isPublic', { isPublic });
    }

    const challenges = await queryBuilder
      .orderBy('challenge.startDate', 'ASC')
      .limit(limit)
      .offset(offset)
      .getMany();

    return challenges.map((challenge) => this.mapChallengeToDto(challenge));
  }

  async joinChallenge(
    challengeId: number,
    userId: number
  ): Promise<UserChallengeDto> {
    const challenge = await this.challengesRepository.findOne({
      where: { id: challengeId },
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${challengeId} not found`);
    }

    if (challenge.status !== 'upcoming' && challenge.status !== 'active') {
      throw new BadRequestException('Challenge is not open for joining');
    }

    if (challenge.currentParticipants >= challenge.maxParticipants) {
      throw new BadRequestException('Challenge is full');
    }

    const existingUserChallenge = await this.userChallengesRepository.findOne({
      where: { challengeId, userId },
    });

    if (existingUserChallenge) {
      throw new BadRequestException(
        'User is already participating in this challenge'
      );
    }

    const userChallenge = this.userChallengesRepository.create({
      challengeId,
      userId,
      status: 'joined',
      joinedAt: new Date(),
      progress: 0,
    });

    const savedUserChallenge =
      await this.userChallengesRepository.save(userChallenge);

    // Update challenge participant count
    challenge.currentParticipants += 1;
    await this.challengesRepository.save(challenge);

    return this.mapUserChallengeToDto(savedUserChallenge);
  }

  async getUserChallenges(userId: number): Promise<UserChallengeDto[]> {
    const userChallenges = await this.userChallengesRepository.find({
      where: { userId },
      relations: ['challenge'],
      order: { joinedAt: 'DESC' },
    });

    return userChallenges.map((uc) => this.mapUserChallengeToDto(uc));
  }

  async updateChallengeProgress(
    challengeId: number,
    userId: number,
    progress: number,
    progressData?: any
  ): Promise<UserChallengeDto> {
    const userChallenge = await this.userChallengesRepository.findOne({
      where: { challengeId, userId },
    });

    if (!userChallenge) {
      throw new NotFoundException(
        'User is not participating in this challenge'
      );
    }

    userChallenge.progress = Math.min(1, Math.max(0, progress));
    userChallenge.progressData = progressData;

    if (progress >= 1 && userChallenge.status !== 'completed') {
      userChallenge.status = 'completed';
      userChallenge.completedAt = new Date();

      // Award challenge completion rewards
      const challenge = await this.challengesRepository.findOne({
        where: { id: challengeId },
      });
      if (challenge) {
        await this.awardPoints(userId, challenge.rewards.points);
        if (challenge.rewards.achievement) {
          // Award achievement if specified
          await this.awardAchievement(userId, challenge.rewards.achievement);
        }
      }
    }

    const updatedUserChallenge =
      await this.userChallengesRepository.save(userChallenge);

    return this.mapUserChallengeToDto(updatedUserChallenge);
  }

  // ==================== USER PROGRESSION ====================

  async awardPoints(userId: number, points: number): Promise<void> {
    await this.usersRepository.increment({ id: userId }, 'points', points);

    // Check for level up
    await this.checkLevelUp(userId);
  }

  async checkLevelUp(
    userId: number
  ): Promise<{ leveledUp: boolean; newLevel?: number }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) return { leveledUp: false };

    const currentLevel = user.level;
    const requiredExperience = this.calculateRequiredExperience(
      currentLevel + 1
    );

    if (user.experience >= requiredExperience) {
      const newLevel = currentLevel + 1;
      await this.usersRepository.update(userId, { level: newLevel });

      // Award bonus points for leveling up
      const bonusPoints = newLevel * 10;
      await this.awardPoints(userId, bonusPoints);

      return { leveledUp: true, newLevel };
    }

    return { leveledUp: false };
  }

  private calculateRequiredExperience(level: number): number {
    // Simple exponential formula: 100 * level^1.5
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  async updateUserStats(userId: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['habits', 'habitLogs'],
    });

    if (!user) return;

    // Calculate current streak
    const currentStreak = this.calculateCurrentStreak(user.habitLogs);

    // Calculate perfect days
    const perfectDays = this.calculatePerfectDays(user.habitLogs);

    // Calculate total streak
    const totalStreak = Math.max(user.totalStreak, currentStreak);

    // Count achievements
    const achievementsUnlocked = user.userAchievements?.length || 0;

    await this.usersRepository.update(userId, {
      currentStreak,
      totalStreak,
      perfectDays,
      achievementsUnlocked,
    });
  }

  private calculateCurrentStreak(habitLogs: HabitLog[]): number {
    if (!habitLogs || habitLogs.length === 0) return 0;

    const sortedLogs = habitLogs
      .filter((log) => log.status === 'completed')
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (sortedLogs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].date);
      logDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (i === 0 && daysDiff === 0) {
        // Today
        streak = 1;
      } else if (i === 0 && daysDiff === 1) {
        // Yesterday
        streak = 1;
      } else if (i > 0) {
        const prevLogDate = new Date(sortedLogs[i - 1].date);
        prevLogDate.setHours(0, 0, 0, 0);

        const daysBetween = Math.floor(
          (prevLogDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysBetween === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  }

  private calculatePerfectDays(habitLogs: HabitLog[]): number {
    if (!habitLogs || habitLogs.length === 0) return 0;

    const dailyStats = new Map<string, { total: number; completed: number }>();

    habitLogs.forEach((log) => {
      const dateKey = log.date.toISOString().split('T')[0];
      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, { total: 0, completed: 0 });
      }

      const stats = dailyStats.get(dateKey)!;
      stats.total++;
      if (log.status === 'completed') {
        stats.completed++;
      }
    });

    let perfectDays = 0;
    dailyStats.forEach((stats) => {
      if (stats.completed === stats.total && stats.total > 0) {
        perfectDays++;
      }
    });

    return perfectDays;
  }

  async awardAchievement(
    userId: number,
    achievementCode: string
  ): Promise<UserAchievementDto | null> {
    const achievement = await this.achievementsRepository.findOne({
      where: { code: achievementCode, isActive: true },
    });

    if (!achievement) {
      return null;
    }

    const existingUserAchievement =
      await this.userAchievementsRepository.findOne({
        where: { userId, achievementId: achievement.id },
      });

    if (existingUserAchievement) {
      return null; // Already earned
    }

    const userAchievement = this.userAchievementsRepository.create({
      userId,
      achievementId: achievement.id,
      earnedAt: new Date(),
      progress: JSON.stringify(
        await this.getAchievementProgress(
          await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['habits', 'habitLogs'],
          })!,
          achievement
        )
      ),
    });

    const savedUserAchievement =
      await this.userAchievementsRepository.save(userAchievement);

    // Award points
    await this.awardPoints(userId, achievement.points);

    // Update user stats
    await this.updateUserStats(userId);

    return this.mapUserAchievementToDto(savedUserAchievement);
  }

  // ==================== UTILITY METHODS ====================

  private mapAchievementToDto(achievement: Achievement): AchievementDto {
    return {
      id: achievement.id,
      code: achievement.code,
      name: achievement.name,
      description: achievement.description,
      type: achievement.type,
      tier: achievement.tier,
      points: achievement.points,
      icon: achievement.icon,
      badgeImage: achievement.badgeImage,
      criteria: achievement.criteria,
      isActive: achievement.isActive,
      isHidden: achievement.isHidden,
      rarity: achievement.rarity,
      createdAt: achievement.createdAt.toISOString(),
      updatedAt: achievement.updatedAt.toISOString(),
    };
  }

  private mapUserAchievementToDto(
    userAchievement: UserAchievement
  ): UserAchievementDto {
    return {
      id: userAchievement.id,
      userId: userAchievement.userId,
      achievementId: userAchievement.achievementId,
      earnedAt: userAchievement.earnedAt.toISOString(),
      progress: userAchievement.progress,
      isNotified: userAchievement.isNotified,
      isShared: userAchievement.isShared,
      createdAt: userAchievement.createdAt.toISOString(),
      updatedAt: userAchievement.updatedAt.toISOString(),
      achievement: this.mapAchievementToDto(userAchievement.achievement),
    };
  }

  private mapLeaderboardToDto(leaderboard: Leaderboard): LeaderboardDto {
    return {
      id: leaderboard.id,
      name: leaderboard.name,
      description: leaderboard.description,
      type: leaderboard.type,
      metric: leaderboard.metric,
      habitCategoryId: leaderboard.habitCategoryId,
      startDate: leaderboard.startDate?.toISOString(),
      endDate: leaderboard.endDate?.toISOString(),
      currentParticipants: leaderboard.currentParticipants,
      maxEntries: leaderboard.maxEntries,
      isActive: leaderboard.isActive,
      isPublic: leaderboard.isPublic,
      rewards: leaderboard.rewards,
      createdAt: leaderboard.createdAt.toISOString(),
      updatedAt: leaderboard.updatedAt.toISOString(),
    };
  }

  private mapLeaderboardEntryToDto(
    entry: LeaderboardEntry
  ): LeaderboardEntryDto {
    return {
      id: entry.id,
      leaderboardId: entry.leaderboardId,
      userId: entry.userId,
      score: entry.score,
      rank: entry.rank,
      metadata: entry.metadata,
      lastUpdated: entry.lastUpdated?.toISOString(),
      isFrozen: entry.isFrozen,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      user: {
        id: entry.user.id,
        username: entry.user.username,
        avatar: entry.user.avatar,
        firstName: entry.user.firstName,
        lastName: entry.user.lastName,
      },
    };
  }

  private mapChallengeToDto(challenge: Challenge): ChallengeDto {
    return {
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      type: challenge.type,
      difficulty: challenge.difficulty,
      startDate: challenge.startDate.toISOString(),
      endDate: challenge.endDate.toISOString(),
      maxParticipants: challenge.maxParticipants,
      currentParticipants: challenge.currentParticipants,
      status: challenge.status,
      requirements: challenge.requirements,
      rewards: challenge.rewards,
      icon: challenge.icon,
      bannerImage: challenge.bannerImage,
      isPublic: challenge.isPublic,
      isRecurring: challenge.isRecurring,
      recurrencePattern: challenge.recurrencePattern,
      createdAt: challenge.createdAt.toISOString(),
      updatedAt: challenge.updatedAt.toISOString(),
    };
  }

  private mapUserChallengeToDto(
    userChallenge: UserChallenge
  ): UserChallengeDto {
    return {
      id: userChallenge.id,
      userId: userChallenge.userId,
      challengeId: userChallenge.challengeId,
      status: userChallenge.status,
      joinedAt: userChallenge.joinedAt.toISOString(),
      startedAt: userChallenge.startedAt?.toISOString(),
      completedAt: userChallenge.completedAt?.toISOString(),
      failedAt: userChallenge.failedAt?.toISOString(),
      progress: userChallenge.progress,
      progressData: userChallenge.progressData,
      isRewarded: userChallenge.isRewarded,
      rewardedAt: userChallenge.rewardedAt?.toISOString(),
      notes: userChallenge.notes,
      createdAt: userChallenge.createdAt.toISOString(),
      updatedAt: userChallenge.updatedAt.toISOString(),
      challenge: this.mapChallengeToDto(userChallenge.challenge),
    };
  }
}

