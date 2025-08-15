import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { User } from '../../database/entities/user.entity';
import { Habit } from '../../database/entities/habit.entity';
import { HabitLog } from '../../database/entities/habit-log.entity';
import { HabitCorrelationQueryDto } from './dto/habit-correlation.dto';
import { PredictiveAnalyticsQueryDto } from './dto/predictive-analytics.dto';

describe('AdvancedAnalyticsService', () => {
  let service: AdvancedAnalyticsService;
  let userRepository: Repository<User>;
  let habitRepository: Repository<Habit>;
  let habitLogRepository: Repository<HabitLog>;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  const mockHabitRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  const mockHabitLogRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdvancedAnalyticsService,
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
      ],
    }).compile();

    service = module.get<AdvancedAnalyticsService>(AdvancedAnalyticsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    habitRepository = module.get<Repository<Habit>>(getRepositoryToken(Habit));
    habitLogRepository = module.get<Repository<HabitLog>>(
      getRepositoryToken(HabitLog)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeHabitCorrelations', () => {
    it('should return empty array when user has less than 2 habits', async () => {
      const mockHabits = [
        {
          id: 1,
          title: 'Exercise',
          userId: 1,
          habitLogs: [],
        },
      ];

      mockHabitRepository.find.mockResolvedValue(mockHabits);

      const result = await service.analyzeHabitCorrelations(
        1,
        {} as HabitCorrelationQueryDto
      );

      expect(result).toEqual([]);
      expect(mockHabitRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['habitLogs'],
      });
    });

    it('should return correlations when user has sufficient habit data', async () => {
      const mockHabits = [
        {
          id: 1,
          title: 'Exercise',
          userId: 1,
          habitLogs: [
            { date: new Date('2024-01-01'), status: 'completed' },
            { date: new Date('2024-01-02'), status: 'completed' },
            { date: new Date('2024-01-03'), status: 'completed' },
            { date: new Date('2024-01-04'), status: 'completed' },
            { date: new Date('2024-01-05'), status: 'completed' },
            { date: new Date('2024-01-06'), status: 'completed' },
            { date: new Date('2024-01-07'), status: 'completed' },
            { date: new Date('2024-01-08'), status: 'completed' },
            { date: new Date('2024-01-09'), status: 'completed' },
            { date: new Date('2024-01-10'), status: 'completed' },
          ],
        },
        {
          id: 2,
          title: 'Reading',
          userId: 1,
          habitLogs: [
            { date: new Date('2024-01-01'), status: 'completed' },
            { date: new Date('2024-01-02'), status: 'completed' },
            { date: new Date('2024-01-03'), status: 'completed' },
            { date: new Date('2024-01-04'), status: 'completed' },
            { date: new Date('2024-01-05'), status: 'completed' },
            { date: new Date('2024-01-06'), status: 'completed' },
            { date: new Date('2024-01-07'), status: 'completed' },
            { date: new Date('2024-01-08'), status: 'completed' },
            { date: new Date('2024-01-09'), status: 'completed' },
            { date: new Date('2024-01-10'), status: 'completed' },
          ],
        },
      ];

      mockHabitRepository.find.mockResolvedValue(mockHabits);

      const result = await service.analyzeHabitCorrelations(
        1,
        {} as HabitCorrelationQueryDto
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('habitId1');
      expect(result[0]).toHaveProperty('habitId2');
      expect(result[0]).toHaveProperty('correlationCoefficient');
    });
  });

  describe('generateHabitPredictions', () => {
    it('should return predictions for user habits', async () => {
      const mockHabits = [
        {
          id: 1,
          title: 'Exercise',
          userId: 1,
          habitLogs: [
            { date: new Date('2024-01-01'), status: 'completed' },
            { date: new Date('2024-01-02'), status: 'completed' },
            { date: new Date('2024-01-03'), status: 'completed' },
            { date: new Date('2024-01-04'), status: 'completed' },
            { date: new Date('2024-01-05'), status: 'completed' },
            { date: new Date('2024-01-06'), status: 'completed' },
            { date: new Date('2024-01-07'), status: 'completed' },
            { date: new Date('2024-01-08'), status: 'completed' },
            { date: new Date('2024-01-09'), status: 'completed' },
            { date: new Date('2024-01-10'), status: 'completed' },
            { date: new Date('2024-01-11'), status: 'completed' },
            { date: new Date('2024-01-12'), status: 'completed' },
            { date: new Date('2024-01-13'), status: 'completed' },
            { date: new Date('2024-01-14'), status: 'completed' },
            { date: new Date('2024-01-15'), status: 'completed' },
          ],
        },
      ];

      mockHabitRepository.find.mockResolvedValue(mockHabits);

      const result = await service.generateHabitPredictions(
        1,
        {} as PredictiveAnalyticsQueryDto
      );

      expect(result).toHaveProperty('predictions');
      expect(result).toHaveProperty('overallConfidence');
      expect(result).toHaveProperty('keyInsights');
      expect(result).toHaveProperty('recommendations');
    });
  });

  describe('exportData', () => {
    it('should create an export job', async () => {
      const exportRequest = {
        exportType: 'habit_data',
        format: 'csv',
        timeRange: 'last_30_days',
        includeMetadata: true,
      };

      const result = await service.exportData(1, exportRequest);

      expect(result).toHaveProperty('exportId');
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('pending');
      expect(result.exportType).toBe('habit_data');
      expect(result.format).toBe('csv');
    });
  });

  describe('getExportHistory', () => {
    it('should return export history', async () => {
      const result = await service.getExportHistory(1);

      expect(result).toHaveProperty('exports');
      expect(result).toHaveProperty('totalExports');
      expect(result).toHaveProperty('totalStorageUsed');
      expect(result).toHaveProperty('retrievedAt');
    });
  });
});
