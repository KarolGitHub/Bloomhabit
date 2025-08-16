import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GamificationService } from '../gamification.service';
import { User } from '../../../database/entities/user.entity';
import { Habit } from '../../../database/entities/habit.entity';
import { HabitLog } from '../../../database/entities/habit-log.entity';
import { Achievement } from '../../../database/entities/achievement.entity';
import { UserAchievement } from '../../../database/entities/user-achievement.entity';
import { Leaderboard } from '../../../database/entities/leaderboard.entity';
import { LeaderboardEntry } from '../../../database/entities/leaderboard-entry.entity';
import { Challenge } from '../../../database/entities/challenge.entity';
import { UserChallenge } from '../../../database/entities/user-challenge.entity';

describe('GamificationService', () => {
  let service: GamificationService;

  const mockUserRepository = {
    findOne: jest.fn(),
    increment: jest.fn(),
    update: jest.fn(),
  };

  const mockHabitRepository = {
    find: jest.fn(),
  };

  const mockHabitLogRepository = {
    find: jest.fn(),
  };

  const mockAchievementRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserAchievementRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockLeaderboardRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockLeaderboardEntryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockChallengeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockUserChallengeRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Habit),
          useValue: mockHabitRepository,
        },
        {
          provide: getRepositoryToken(HabitLog),
          useValue: mockHabitLogRepository,
        },
        {
          provide: getRepositoryToken(Achievement),
          useValue: mockAchievementRepository,
        },
        {
          provide: getRepositoryToken(UserAchievement),
          useValue: mockUserAchievementRepository,
        },
        {
          provide: getRepositoryToken(Leaderboard),
          useValue: mockLeaderboardRepository,
        },
        {
          provide: getRepositoryToken(LeaderboardEntry),
          useValue: mockLeaderboardEntryRepository,
        },
        {
          provide: getRepositoryToken(Challenge),
          useValue: mockChallengeRepository,
        },
        {
          provide: getRepositoryToken(UserChallenge),
          useValue: mockUserChallengeRepository,
        },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAchievement', () => {
    it('should create an achievement', async () => {
      const createAchievementDto = {
        code: 'FIRST_HABIT',
        name: 'First Steps',
        description: 'Create your first habit',
        type: 'habit_creation',
        tier: 'bronze',
        points: 100,
        criteria: { habitCount: 1 },
      };

      const mockAchievement = {
        id: 1,
        ...createAchievementDto,
        isActive: true,
        isHidden: false,
        rarity: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAchievementRepository.create.mockReturnValue(mockAchievement);
      mockAchievementRepository.save.mockResolvedValue(mockAchievement);

      const result = await service.createAchievement(createAchievementDto);

      expect(result).toBeDefined();
      expect(result.code).toBe('FIRST_HABIT');
      expect(mockAchievementRepository.create).toHaveBeenCalledWith(
        createAchievementDto
      );
      expect(mockAchievementRepository.save).toHaveBeenCalledWith(
        mockAchievement
      );
    });
  });

  describe('getUserAchievements', () => {
    it('should return user achievements', async () => {
      const userId = 1;
      const mockUserAchievements = [
        {
          id: 1,
          userId: 1,
          achievementId: 1,
          earnedAt: new Date(),
          isNotified: false,
          isShared: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          achievement: {
            id: 1,
            code: 'FIRST_HABIT',
            name: 'First Steps',
            description: 'Create your first habit',
            type: 'habit_creation',
            tier: 'bronze',
            points: 100,
            criteria: { habitCount: 1 },
            isActive: true,
            isHidden: false,
            rarity: 25,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      mockUserAchievementRepository.find.mockResolvedValue(
        mockUserAchievements
      );

      const result = await service.getUserAchievements(userId);

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(mockUserAchievementRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['achievement'],
        order: { earnedAt: 'DESC' },
      });
    });
  });

  describe('awardPoints', () => {
    it('should award points to user', async () => {
      const userId = 1;
      const points = 100;

      mockUserRepository.increment.mockResolvedValue({ affected: 1 });

      await service.awardPoints(userId, points);

      expect(mockUserRepository.increment).toHaveBeenCalledWith(
        { id: userId },
        'points',
        points
      );
    });
  });

  describe('joinChallenge', () => {
    it('should allow user to join a challenge', async () => {
      const challengeId = 1;
      const userId = 1;

      const mockChallenge = {
        id: 1,
        name: '30-Day Fitness Streak',
        status: 'active',
        currentParticipants: 45,
        maxParticipants: 100,
      };

      const mockUserChallenge = {
        id: 1,
        challengeId: 1,
        userId: 1,
        status: 'joined',
        joinedAt: new Date(),
        progress: 0,
      };

      mockChallengeRepository.findOne.mockResolvedValue(mockChallenge);
      mockUserChallengeRepository.findOne.mockResolvedValue(null);
      mockUserChallengeRepository.create.mockReturnValue(mockUserChallenge);
      mockUserChallengeRepository.save.mockResolvedValue(mockUserChallenge);
      mockChallengeRepository.save.mockResolvedValue(mockChallenge);

      const result = await service.joinChallenge(challengeId, userId);

      expect(result).toBeDefined();
      expect(result.status).toBe('joined');
      expect(mockUserChallengeRepository.create).toHaveBeenCalledWith({
        challengeId,
        userId,
        status: 'joined',
        joinedAt: expect.any(Date),
        progress: 0,
      });
    });
  });
});

