import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Habit } from '../../database/entities/habit.entity';
import {
  HabitLog,
  HabitLogStatus,
} from '../../database/entities/habit-log.entity';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { LogHabitDto } from './dto/log-habit.dto';
import { HabitAnalyticsDto } from './dto/habit-analytics.dto';
import { GardenStatsDto } from './dto/garden-stats.dto';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private habitsRepository: Repository<Habit>,
    @InjectRepository(HabitLog)
    private habitLogsRepository: Repository<HabitLog>
  ) {}

  // Basic CRUD operations
  async create(createHabitDto: CreateHabitDto, userId: number): Promise<Habit> {
    const habit = this.habitsRepository.create({
      ...createHabitDto,
      userId,
    });
    return this.habitsRepository.save(habit);
  }

  async findAll(userId: number): Promise<Habit[]> {
    return this.habitsRepository.find({
      where: { userId, isActive: true },
      relations: ['habitLogs'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Habit> {
    const habit = await this.habitsRepository.findOne({
      where: { id, userId },
      relations: ['habitLogs'],
    });
    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }
    return habit;
  }

  async update(
    id: number,
    updateHabitDto: UpdateHabitDto,
    userId: number
  ): Promise<Habit> {
    const habit = await this.findOne(id, userId);
    Object.assign(habit, updateHabitDto);
    return this.habitsRepository.save(habit);
  }

  async remove(id: number, userId: number): Promise<void> {
    const habit = await this.findOne(id, userId);
    await this.habitsRepository.remove(habit);
  }

  // Habit Logging functionality
  async logHabit(logHabitDto: LogHabitDto, userId: number): Promise<HabitLog> {
    // Verify the habit belongs to the user
    const habit = await this.findOne(logHabitDto.habitId, userId);

    // Check if a log already exists for this habit and date
    const existingLog = await this.habitLogsRepository.findOne({
      where: {
        habitId: logHabitDto.habitId,
        userId,
        date: new Date(logHabitDto.date),
      },
    });

    if (existingLog) {
      // Update existing log
      Object.assign(existingLog, {
        status: logHabitDto.status,
        completedCount: logHabitDto.completedCount || 0,
        targetCount: logHabitDto.targetCount || habit.targetCount,
        notes: logHabitDto.notes,
      });

      // Update streak and perfect day
      await this.updateHabitStats(existingLog, habit);
      return this.habitLogsRepository.save(existingLog);
    } else {
      // Create new log
      const habitLog = this.habitLogsRepository.create({
        ...logHabitDto,
        userId,
        date: new Date(logHabitDto.date),
        targetCount: logHabitDto.targetCount || habit.targetCount,
        completedCount: logHabitDto.completedCount || 0,
      });

      // Calculate initial streak and perfect day
      await this.updateHabitStats(habitLog, habit);
      return this.habitLogsRepository.save(habitLog);
    }
  }

  async getHabitLogs(
    habitId: number,
    userId: number,
    startDate?: string,
    endDate?: string
  ): Promise<HabitLog[]> {
    await this.findOne(habitId, userId); // Verify ownership

    const where: any = { habitId, userId };

    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    }

    return this.habitLogsRepository.find({
      where,
      order: { date: 'DESC' },
    });
  }

  async getTodayLogs(userId: number): Promise<HabitLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.habitLogsRepository.find({
      where: {
        userId,
        date: today,
      },
      relations: ['habit'],
    });
  }

  // Analytics functionality
  async getHabitAnalytics(
    habitId: number,
    userId: number
  ): Promise<HabitAnalyticsDto> {
    const habit = await this.findOne(habitId, userId);
    const logs = await this.getHabitLogs(habitId, userId);

    if (logs.length === 0) {
      return this.getEmptyHabitAnalytics(habit);
    }

    const progress = this.calculateHabitProgress(logs);
    const streak = this.calculateHabitStreak(logs);
    const weeklyProgress = this.calculateWeeklyProgress(logs);
    const monthlyProgress = this.calculateMonthlyProgress(logs);
    const { bestDayOfWeek, worstDayOfWeek, bestDayRate, worstDayRate } =
      this.calculateDayOfWeekStats(logs);

    return {
      habitId: habit.id,
      habitTitle: habit.title,
      progress,
      streak,
      weeklyProgress,
      monthlyProgress,
      bestDayOfWeek,
      worstDayOfWeek,
      bestDayRate,
      worstDayRate,
    };
  }

  // Garden Statistics functionality
  async getGardenStats(userId: number): Promise<GardenStatsDto> {
    const habits = await this.findAll(userId);
    const todayLogs = await this.getTodayLogs(userId);

    if (habits.length === 0) {
      return this.getEmptyGardenStats();
    }

    const todayStats = this.calculateTodayStats(habits, todayLogs);
    const weekStats = await this.calculateWeekStats(userId);
    const monthStats = await this.calculateMonthStats(userId);
    const gardenMood = this.calculateGardenMood(habits, todayLogs);
    const habitsByCategory = this.calculateHabitsByCategory(habits);
    const topHabits = this.getTopHabits(habits);
    const needsAttention = this.getHabitsNeedingAttention(habits);
    const weeklyTrend = await this.calculateWeeklyTrend(userId);
    const monthlyTrend = await this.calculateMonthlyTrend(userId);

    return {
      totalHabits: habits.length,
      ...todayStats,
      ...weekStats,
      ...monthStats,
      gardenMood,
      habitsByCategory,
      topHabits,
      needsAttention,
      weeklyTrend,
      monthlyTrend,
    };
  }

  // Private helper methods
  private async updateHabitStats(
    habitLog: HabitLog,
    habit: Habit
  ): Promise<void> {
    // Calculate streak
    const previousLogs = await this.habitLogsRepository.find({
      where: {
        habitId: habit.id,
        userId: habitLog.userId,
        date: LessThanOrEqual(new Date(habitLog.date)),
      },
      order: { date: 'DESC' },
      take: 30, // Look back 30 days for streak calculation
    });

    let streak = 0;
    let currentDate = new Date(habitLog.date);

    for (const log of previousLogs) {
      if (
        log.status === HabitLogStatus.COMPLETED ||
        log.status === HabitLogStatus.PARTIAL
      ) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    habitLog.streak = streak;
    habitLog.isPerfectDay =
      habitLog.status === HabitLogStatus.COMPLETED &&
      habitLog.completedCount >= (habitLog.targetCount || habit.targetCount);
  }

  private calculateHabitProgress(logs: HabitLog[]): any {
    const totalDays = logs.length;
    const completedDays = logs.filter(
      (log) => log.status === HabitLogStatus.COMPLETED
    ).length;
    const partialDays = logs.filter(
      (log) => log.status === HabitLogStatus.PARTIAL
    ).length;
    const missedDays = logs.filter(
      (log) => log.status === HabitLogStatus.MISSED
    ).length;
    const skippedDays = logs.filter(
      (log) => log.status === HabitLogStatus.SKIPPED
    ).length;

    const completionRate =
      totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return {
      totalDays,
      completedDays,
      partialDays,
      missedDays,
      skippedDays,
      completionRate,
    };
  }

  private calculateHabitStreak(logs: HabitLog[]): any {
    if (logs.length === 0) {
      return { currentStreak: 0, longestStreak: 0, streakStartDate: null };
    }

    const sortedLogs = logs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let streakStartDate: Date | null = null;

    for (const log of sortedLogs) {
      if (
        log.status === HabitLogStatus.COMPLETED ||
        log.status === HabitLogStatus.PARTIAL
      ) {
        tempStreak++;
        if (currentStreak === 0) {
          streakStartDate = new Date(log.date);
        }
        currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      streakStartDate,
      streakEndDate: currentStreak === 0 ? new Date() : null,
    };
  }

  private calculateWeeklyProgress(logs: HabitLog[]): any[] {
    const weeklyData = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekLogs = logs.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= weekEnd;
      });

      const completedDays = weekLogs.filter(
        (log) =>
          log.status === HabitLogStatus.COMPLETED ||
          log.status === HabitLogStatus.PARTIAL
      ).length;

      weeklyData.push({
        week: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
        completedDays,
        totalDays: 7,
        completionRate: Math.round((completedDays / 7) * 100),
      });
    }

    return weeklyData;
  }

  private calculateMonthlyProgress(logs: HabitLog[]): any[] {
    const monthlyData = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthLogs = logs.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= monthStart && logDate <= monthEnd;
      });

      const completedDays = monthLogs.filter(
        (log) =>
          log.status === HabitLogStatus.COMPLETED ||
          log.status === HabitLogStatus.PARTIAL
      ).length;

      const daysInMonth = monthEnd.getDate();

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
        completedDays,
        totalDays: daysInMonth,
        completionRate: Math.round((completedDays / daysInMonth) * 100),
      });
    }

    return monthlyData;
  }

  private calculateDayOfWeekStats(logs: HabitLog[]): any {
    const dayStats = new Map<string, { total: number; completed: number }>();

    for (let i = 0; i < 7; i++) {
      dayStats.set(i.toString(), { total: 0, completed: 0 });
    }

    logs.forEach((log) => {
      const dayOfWeek = new Date(log.date).getDay().toString();
      const current = dayStats.get(dayOfWeek)!;
      current.total++;
      if (
        log.status === HabitLogStatus.COMPLETED ||
        log.status === HabitLogStatus.PARTIAL
      ) {
        current.completed++;
      }
    });

    let bestDay = '0';
    let worstDay = '0';
    let bestRate = 0;
    let worstRate = 100;

    dayStats.forEach((stats, day) => {
      if (stats.total > 0) {
        const rate = (stats.completed / stats.total) * 100;
        if (rate > bestRate) {
          bestRate = rate;
          bestDay = day;
        }
        if (rate < worstRate) {
          worstRate = rate;
          worstDay = day;
        }
      }
    });

    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    return {
      bestDayOfWeek: dayNames[parseInt(bestDay)],
      worstDayOfWeek: dayNames[parseInt(worstDay)],
      bestDayRate: Math.round(bestRate),
      worstDayRate: Math.round(worstRate),
    };
  }

  private calculateTodayStats(habits: Habit[], todayLogs: HabitLog[]): any {
    const completedToday = todayLogs.filter(
      (log) => log.status === HabitLogStatus.COMPLETED
    ).length;
    const partialToday = todayLogs.filter(
      (log) => log.status === HabitLogStatus.PARTIAL
    ).length;
    const missedToday = habits.length - completedToday - partialToday;
    const todayCompletionRate =
      habits.length > 0
        ? Math.round(((completedToday + partialToday) / habits.length) * 100)
        : 0;

    return {
      completedToday,
      partialToday,
      missedToday,
      todayCompletionRate,
    };
  }

  private async calculateWeekStats(userId: number): Promise<any> {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekLogs = await this.habitLogsRepository.find({
      where: {
        userId,
        date: Between(weekStart, weekEnd),
      },
    });

    const habits = await this.findAll(userId);
    const totalPossible = habits.length * 7;
    const completed = weekLogs.filter(
      (log) =>
        log.status === HabitLogStatus.COMPLETED ||
        log.status === HabitLogStatus.PARTIAL
    ).length;

    return {
      weekCompletionRate:
        totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
    };
  }

  private async calculateMonthStats(userId: number): Promise<any> {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthStart.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);

    const monthLogs = await this.habitLogsRepository.find({
      where: {
        userId,
        date: Between(monthStart, monthEnd),
      },
    });

    const habits = await this.findAll(userId);
    const daysInMonth = monthEnd.getDate();
    const totalPossible = habits.length * daysInMonth;
    const completed = monthLogs.filter(
      (log) =>
        log.status === HabitLogStatus.COMPLETED ||
        log.status === HabitLogStatus.PARTIAL
    ).length;

    return {
      monthCompletionRate:
        totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
    };
  }

  private calculateGardenMood(habits: Habit[], todayLogs: HabitLog[]): any {
    if (habits.length === 0) {
      return {
        moodScore: 0,
        moodLevel: 'empty',
        moodEmoji: '🌱',
        moodDescription: 'No habits planted yet. Start growing your garden!',
      };
    }

    const completedToday = todayLogs.filter(
      (log) => log.status === HabitLogStatus.COMPLETED
    ).length;
    const partialToday = todayLogs.filter(
      (log) => log.status === HabitLogStatus.PARTIAL
    ).length;
    const totalHabits = habits.length;

    const moodScore = Math.round(
      ((completedToday + partialToday * 0.5) / totalHabits) * 100
    );

    let moodLevel: string;
    let moodEmoji: string;
    let moodDescription: string;

    if (moodScore >= 90) {
      moodLevel = 'excellent';
      moodEmoji = '🌺';
      moodDescription = 'Your garden is flourishing! Excellent work today!';
    } else if (moodScore >= 70) {
      moodLevel = 'good';
      moodEmoji = '🌻';
      moodDescription = 'Your garden is growing well. Keep up the good work!';
    } else if (moodScore >= 50) {
      moodLevel = 'fair';
      moodEmoji = '🌿';
      moodDescription = 'Your garden needs a bit more care. You can do it!';
    } else {
      moodLevel = 'needs-care';
      moodEmoji = '🌱';
      moodDescription =
        'Your garden needs attention. Time to water those habits!';
    }

    return {
      moodScore,
      moodLevel,
      moodEmoji,
      moodDescription,
    };
  }

  private calculateHabitsByCategory(habits: Habit[]): any[] {
    const categoryMap = new Map<
      string,
      { count: number; totalStreak: number }
    >();

    habits.forEach((habit) => {
      const current = categoryMap.get(habit.category) || {
        count: 0,
        totalStreak: 0,
      };
      current.count++;
      // Note: This would need to be calculated from actual logs for accurate streak data
      current.totalStreak += 0;
      categoryMap.set(habit.category, current);
    });

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      count: stats.count,
      completionRate: 0, // Would need to calculate from logs
      totalStreak: stats.totalStreak,
    }));
  }

  private getTopHabits(habits: Habit[]): any[] {
    // This would need actual completion data from logs
    // For now, returning a placeholder
    return habits.slice(0, 3).map((habit) => ({
      habitId: habit.id,
      title: habit.title,
      completionRate: 0, // Would calculate from logs
      currentStreak: 0, // Would calculate from logs
      flowerType: habit.flowerType,
    }));
  }

  private getHabitsNeedingAttention(habits: Habit[]): any[] {
    // This would need actual completion data from logs
    // For now, returning a placeholder
    return habits.slice(0, 3).map((habit) => ({
      habitId: habit.id,
      title: habit.title,
      completionRate: 0, // Would calculate from logs
      daysSinceLastCompleted: 0, // Would calculate from logs
      flowerType: habit.flowerType,
    }));
  }

  private async calculateWeeklyTrend(userId: number): Promise<any[]> {
    // This would calculate actual weekly trends from logs
    // For now, returning placeholder data
    return [];
  }

  private async calculateMonthlyTrend(userId: number): Promise<any[]> {
    // This would calculate actual monthly trends from logs
    // For now, returning placeholder data
    return [];
  }

  private getEmptyHabitAnalytics(habit: Habit): HabitAnalyticsDto {
    return {
      habitId: habit.id,
      habitTitle: habit.title,
      progress: {
        totalDays: 0,
        completedDays: 0,
        partialDays: 0,
        missedDays: 0,
        skippedDays: 0,
        completionRate: 0,
      },
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        streakStartDate: new Date(),
      },
      weeklyProgress: [],
      monthlyProgress: [],
      bestDayOfWeek: 'N/A',
      worstDayOfWeek: 'N/A',
      bestDayRate: 0,
      worstDayRate: 0,
    };
  }

  private getEmptyGardenStats(): GardenStatsDto {
    return {
      totalHabits: 0,
      completedToday: 0,
      partialToday: 0,
      missedToday: 0,
      todayCompletionRate: 0,
      weekCompletionRate: 0,
      monthCompletionRate: 0,
      totalActiveStreak: 0,
      longestStreakEver: 0,
      gardenMood: {
        moodScore: 0,
        moodLevel: 'empty',
        moodEmoji: '🌱',
        moodDescription: 'No habits planted yet. Start growing your garden!',
      },
      habitsByCategory: [],
      topHabits: [],
      needsAttention: [],
      weeklyTrend: [],
      monthlyTrend: [],
    };
  }
}
