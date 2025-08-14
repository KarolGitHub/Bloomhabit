import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Habit } from '../../database/entities/habit.entity';
import { HabitLog } from '../../database/entities/habit-log.entity';

export interface HabitAnalytics {
  habitId: number;
  habitName: string;
  totalCompletions: number;
  totalDays: number;
  successRate: number;
  currentStreak: number;
  longestStreak: number;
  averageCompletionsPerDay: number;
  bestDay: string;
  worstDay: string;
  consistencyScore: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

export interface ProgressReport {
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  totalHabits: number;
  activeHabits: number;
  completedHabits: number;
  overallSuccessRate: number;
  totalStreak: number;
  averageDailyCompletions: number;
  topPerformingHabits: string[];
  needsAttentionHabits: string[];
  achievements: string[];
  nextWeekGoals: string[];
}

export interface TrendAnalysis {
  period: string;
  data: {
    date: string;
    completions: number;
    successRate: number;
    streak: number;
  }[];
  patterns: {
    weeklyCycles: boolean;
    monthlyTrends: boolean;
    seasonalVariations: boolean;
  };
  predictions: {
    nextWeekSuccessRate: number;
    nextMonthGoal: number;
    estimatedAchievementDate: Date;
  };
}

export interface PerformanceMetrics {
  consistencyScore: number;
  momentumScore: number;
  resilienceScore: number;
  overallScore: number;
  percentile: number;
  category: 'excellent' | 'good' | 'average' | 'needs-improvement';
  breakdown: {
    consistency: { score: number; factors: string[] };
    momentum: { score: number; factors: string[] };
    resilience: { score: number; factors: string[] };
  };
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Habit)
    private habitsRepository: Repository<Habit>,
    @InjectRepository(HabitLog)
    private habitLogsRepository: Repository<HabitLog>
  ) {}

  async getHabitAnalytics(
    userId: number,
    habitId: number
  ): Promise<HabitAnalytics> {
    const habit = await this.habitsRepository.findOne({
      where: { id: habitId, userId },
      relations: ['habitLogs'],
    });

    if (!habit) {
      throw new NotFoundException(`Habit with ID ${habitId} not found`);
    }

    const logs = habit.habitLogs || [];
    const totalCompletions = logs.reduce(
      (sum, log) => sum + log.completedCount,
      0
    );
    const totalDays = logs.length;
    const successRate =
      totalDays > 0
        ? (logs.filter((log) => log.status === 'completed').length /
            totalDays) *
          100
        : 0;

    // Calculate current streak
    const sortedLogs = logs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (const log of sortedLogs) {
      if (log.status === 'completed') {
        tempStreak++;
        if (currentStreak === 0) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate best and worst days
    const dayStats = this.calculateDayStats(logs);
    const bestDay = dayStats.bestDay;
    const worstDay = dayStats.worstDay;

    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(logs);

    // Determine trend
    const trend = this.determineTrend(logs);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      logs,
      successRate,
      consistencyScore
    );

    return {
      habitId: habit.id,
      habitName: habit.title, // Use title instead of name
      totalCompletions,
      totalDays,
      successRate: Math.round(successRate * 100) / 100,
      currentStreak,
      longestStreak,
      averageCompletionsPerDay:
        totalDays > 0 ? totalCompletions / totalDays : 0,
      bestDay,
      worstDay,
      consistencyScore,
      trend,
      recommendations,
    };
  }

  async getProgressReport(
    userId: number,
    period: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<ProgressReport> {
    const { startDate, endDate } = this.getDateRange(period);

    const habits = await this.habitsRepository.find({
      where: { userId, isActive: true },
      relations: ['habitLogs'],
    });

    const logs = await this.habitLogsRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
    });

    const totalHabits = habits.length;
    const activeHabits = habits.filter((h) => h.isActive).length;
    const completedHabits = logs.filter(
      (log) => log.status === 'completed'
    ).length;
    const overallSuccessRate =
      logs.length > 0 ? (completedHabits / logs.length) * 100 : 0;

    // Calculate total streak across all habits
    const totalStreak = this.calculateTotalStreak(habits, logs);

    // Calculate average daily completions
    const averageDailyCompletions = this.calculateAverageDailyCompletions(
      logs,
      startDate,
      endDate
    );

    // Get top performing and needs attention habits
    const { topPerforming, needsAttention } = this.categorizeHabits(
      habits,
      logs
    );

    // Generate achievements
    const achievements = this.generateAchievements(logs, habits, period);

    // Generate next week goals
    const nextWeekGoals = this.generateNextWeekGoals(habits, logs, period);

    return {
      period,
      startDate,
      endDate,
      totalHabits,
      activeHabits,
      completedHabits,
      overallSuccessRate: Math.round(overallSuccessRate * 100) / 100,
      totalStreak,
      averageDailyCompletions,
      topPerformingHabits: topPerforming,
      needsAttentionHabits: needsAttention,
      achievements,
      nextWeekGoals,
    };
  }

  async getTrendAnalysis(
    userId: number,
    period: string
  ): Promise<TrendAnalysis> {
    const { startDate, endDate } = this.getDateRange(period as any);

    const logs = await this.habitLogsRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });

    // Group logs by date
    const dailyStats = this.groupLogsByDate(logs);

    // Analyze patterns
    const patterns = this.analyzePatterns(dailyStats);

    // Generate predictions
    const predictions = this.generatePredictions(dailyStats);

    return {
      period,
      data: dailyStats,
      patterns,
      predictions,
    };
  }

  async getPerformanceMetrics(userId: number): Promise<PerformanceMetrics> {
    const habits = await this.habitsRepository.find({
      where: { userId, isActive: true },
      relations: ['habitLogs'],
    });

    const logs = await this.habitLogsRepository.find({
      where: { userId },
      order: { date: 'ASC' },
    });

    // Calculate individual scores
    const consistencyScore = this.calculateConsistencyScore(logs);
    const momentumScore = this.calculateMomentumScore(logs);
    const resilienceScore = this.calculateResilienceScore(logs);

    // Calculate overall score
    const overallScore =
      (consistencyScore + momentumScore + resilienceScore) / 3;

    // Determine category
    const category = this.determinePerformanceCategory(overallScore);

    // Calculate percentile (mock data for now)
    const percentile = Math.min(
      95,
      Math.max(5, Math.round(overallScore * 100))
    );

    // Generate breakdown
    const breakdown = {
      consistency: {
        score: consistencyScore,
        factors: this.getConsistencyFactors(logs),
      },
      momentum: {
        score: momentumScore,
        factors: this.getMomentumFactors(logs),
      },
      resilience: {
        score: resilienceScore,
        factors: this.getResilienceFactors(logs),
      },
    };

    return {
      consistencyScore,
      momentumScore,
      resilienceScore,
      overallScore: Math.round(overallScore * 100) / 100,
      percentile,
      category,
      breakdown,
    };
  }

  private getDateRange(period: 'week' | 'month' | 'quarter' | 'year') {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { startDate, endDate: now };
  }

  private calculateDayStats(logs: HabitLog[]) {
    const dayCounts: { [key: string]: number } = {};

    logs.forEach((log) => {
      const day = new Date(log.date).toLocaleDateString('en-US', {
        weekday: 'long',
      });
      dayCounts[day] =
        (dayCounts[day] || 0) + (log.status === 'completed' ? 1 : 0);
    });

    const entries = Object.entries(dayCounts);
    const bestDay = entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    const worstDay = entries.reduce((a, b) => (a[1] < b[1] ? a : b))[0];

    return { bestDay, worstDay };
  }

  private calculateConsistencyScore(logs: HabitLog[]): number {
    if (logs.length === 0) return 0;

    const completedDays = logs.filter(
      (log) => log.status === 'completed'
    ).length;
    const totalDays = logs.length;

    // Base consistency score
    let score = (completedDays / totalDays) * 100;

    // Bonus for consecutive completions
    let consecutiveBonus = 0;
    let currentStreak = 0;

    for (const log of logs.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )) {
      if (log.status === 'completed') {
        currentStreak++;
        consecutiveBonus += currentStreak * 0.5;
      } else {
        currentStreak = 0;
      }
    }

    score = Math.min(100, score + consecutiveBonus);
    return Math.round(score * 100) / 100;
  }

  private determineTrend(
    logs: HabitLog[]
  ): 'improving' | 'declining' | 'stable' {
    if (logs.length < 7) return 'stable';

    const sortedLogs = logs.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstHalf = sortedLogs.slice(0, Math.floor(sortedLogs.length / 2));
    const secondHalf = sortedLogs.slice(Math.floor(sortedLogs.length / 2));

    const firstHalfRate =
      firstHalf.filter((log) => log.status === 'completed').length /
      firstHalf.length;
    const secondHalfRate =
      secondHalf.filter((log) => log.status === 'completed').length /
      secondHalf.length;

    const difference = secondHalfRate - firstHalfRate;

    if (difference > 0.1) return 'improving';
    if (difference < -0.1) return 'declining';
    return 'stable';
  }

  private generateRecommendations(
    logs: HabitLog[],
    successRate: number,
    consistencyScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (successRate < 50) {
      recommendations.push(
        'Consider reducing the difficulty of your habit to build momentum'
      );
      recommendations.push('Try setting smaller, more achievable daily goals');
    }

    if (consistencyScore < 60) {
      recommendations.push(
        'Focus on building a daily routine rather than perfect execution'
      );
      recommendations.push(
        'Use habit stacking to link this habit to an existing routine'
      );
    }

    if (logs.length < 7) {
      recommendations.push(
        'Give yourself more time to establish this habit before evaluating'
      );
      recommendations.push('Track your progress daily to build awareness');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Keep up the consistent effort');
      recommendations.push(
        'Consider adding a new habit or increasing the challenge'
      );
    }

    return recommendations.slice(0, 3);
  }

  private calculateTotalStreak(habits: Habit[], logs: HabitLog[]): number {
    let totalStreak = 0;

    // Calculate streak from habit logs instead of using non-existent currentStreak property
    for (const habit of habits) {
      const habitLogs = logs.filter((log) => log.habitId === habit.id);
      if (habitLogs.length > 0) {
        // Calculate current streak for this habit
        const sortedLogs = habitLogs.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        let currentStreak = 0;
        for (const log of sortedLogs) {
          if (log.status === 'completed') {
            currentStreak++;
          } else {
            break;
          }
        }
        totalStreak += currentStreak;
      }
    }

    return totalStreak;
  }

  private calculateAverageDailyCompletions(
    logs: HabitLog[],
    startDate: Date,
    endDate: Date
  ): number {
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalCompletions = logs.reduce(
      (sum, log) => sum + log.completedCount,
      0
    );

    return daysDiff > 0
      ? Math.round((totalCompletions / daysDiff) * 100) / 100
      : 0;
  }

  private categorizeHabits(habits: Habit[], logs: HabitLog[]) {
    const habitPerformance = habits.map((habit) => {
      const habitLogs = logs.filter((log) => log.habitId === habit.id);
      const successRate =
        habitLogs.length > 0
          ? habitLogs.filter((log) => log.status === 'completed').length /
            habitLogs.length
          : 0;

      return { habit, successRate };
    });

    const sorted = habitPerformance.sort(
      (a, b) => b.successRate - a.successRate
    );
    const topPerforming = sorted.slice(0, 3).map((h) => h.habit.title); // Use title instead of name
    const needsAttention = sorted.slice(-3).map((h) => h.habit.title); // Use title instead of name

    return { topPerforming, needsAttention };
  }

  private generateAchievements(
    logs: HabitLog[],
    habits: Habit[],
    period: string
  ): string[] {
    const achievements: string[] = [];

    const totalCompletions = logs.filter(
      (log) => log.status === 'completed'
    ).length;
    const uniqueHabits = new Set(logs.map((log) => log.habitId)).size;

    if (totalCompletions >= 10)
      achievements.push('Completed 10+ habits this period');
    if (uniqueHabits >= 3) achievements.push('Worked on 3+ different habits');
    if (logs.length >= 7) achievements.push('Maintained daily tracking');

    return achievements;
  }

  private generateNextWeekGoals(
    habits: Habit[],
    logs: HabitLog[],
    period: string
  ): string[] {
    const goals: string[] = [];

    goals.push('Maintain current streak on top-performing habits');
    goals.push('Focus on one habit that needs attention');
    goals.push('Track progress daily for better consistency');

    return goals;
  }

  private groupLogsByDate(logs: HabitLog[]) {
    const dailyStats: { [key: string]: any } = {};

    logs.forEach((log) => {
      const date = log.date.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          completions: 0,
          successRate: 0,
          streak: 0,
        };
      }

      dailyStats[date].completions += log.completedCount;
      if (log.status === 'completed') {
        dailyStats[date].successRate += 1;
      }
    });

    // Convert to array and calculate success rates
    return Object.values(dailyStats).map((stat: any) => ({
      ...stat,
      successRate:
        (stat.successRate /
          logs.filter(
            (log) => log.date.toISOString().split('T')[0] === stat.date
          ).length) *
        100,
    }));
  }

  private analyzePatterns(dailyStats: any[]) {
    // Simple pattern analysis
    const weeklyCycles = dailyStats.length >= 7;
    const monthlyTrends = dailyStats.length >= 28;
    const seasonalVariations = dailyStats.length >= 90;

    return { weeklyCycles, monthlyTrends, seasonalVariations };
  }

  private generatePredictions(dailyStats: any[]) {
    if (dailyStats.length < 3) {
      return {
        nextWeekSuccessRate: 50,
        nextMonthGoal: 70,
        estimatedAchievementDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ),
      };
    }

    // Simple linear prediction
    const recentStats = dailyStats.slice(-7);
    const avgSuccessRate =
      recentStats.reduce((sum, stat) => sum + stat.successRate, 0) /
      recentStats.length;

    return {
      nextWeekSuccessRate: Math.min(100, Math.round(avgSuccessRate * 1.1)),
      nextMonthGoal: Math.min(100, Math.round(avgSuccessRate * 1.2)),
      estimatedAchievementDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    };
  }

  private calculateMomentumScore(logs: HabitLog[]): number {
    if (logs.length < 3) return 50;

    const sortedLogs = logs.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const recentLogs = sortedLogs.slice(-3);
    const olderLogs = sortedLogs.slice(-6, -3);

    const recentRate =
      recentLogs.filter((log) => log.status === 'completed').length /
      recentLogs.length;
    const olderRate =
      olderLogs.filter((log) => log.status === 'completed').length /
      olderLogs.length;

    const momentum = (recentRate - olderRate) * 100 + 50;
    return Math.max(0, Math.min(100, Math.round(momentum * 100) / 100));
  }

  private calculateResilienceScore(logs: HabitLog[]): number {
    if (logs.length < 5) return 50;

    let resilienceScore = 50;
    let consecutiveFailures = 0;
    let maxConsecutiveFailures = 0;

    for (const log of logs.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )) {
      if (log.status === 'completed') {
        consecutiveFailures = 0;
        resilienceScore += 2;
      } else {
        consecutiveFailures++;
        maxConsecutiveFailures = Math.max(
          maxConsecutiveFailures,
          consecutiveFailures
        );
        resilienceScore -= 1;
      }
    }

    // Bonus for recovery after failures
    if (maxConsecutiveFailures > 0) {
      resilienceScore += Math.min(20, (5 - maxConsecutiveFailures) * 4);
    }

    return Math.max(0, Math.min(100, Math.round(resilienceScore * 100) / 100));
  }

  private determinePerformanceCategory(
    score: number
  ): 'excellent' | 'good' | 'average' | 'needs-improvement' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    return 'needs-improvement';
  }

  private getConsistencyFactors(logs: HabitLog[]): string[] {
    const factors: string[] = [];

    if (logs.length >= 7) factors.push('Daily tracking maintained');
    if (
      logs.filter((log) => log.status === 'completed').length >=
      logs.length * 0.8
    ) {
      factors.push('High completion rate');
    }

    return factors;
  }

  private getMomentumFactors(logs: HabitLog[]): string[] {
    const factors: string[] = [];

    if (logs.length >= 3) {
      const recent = logs.slice(-3);
      const older = logs.slice(-6, -3);
      if (recent.length > 0 && older.length > 0) {
        const recentRate =
          recent.filter((log) => log.status === 'completed').length /
          recent.length;
        const olderRate =
          older.filter((log) => log.status === 'completed').length /
          older.length;
        if (recentRate > olderRate) factors.push('Improving performance');
      }
    }

    return factors;
  }

  private getResilienceFactors(logs: HabitLog[]): string[] {
    const factors: string[] = [];

    let maxFailures = 0;
    let currentFailures = 0;

    for (const log of logs) {
      if (log.status === 'completed') {
        currentFailures = 0;
      } else {
        currentFailures++;
        maxFailures = Math.max(maxFailures, currentFailures);
      }
    }

    if (maxFailures <= 2) factors.push('Quick recovery from setbacks');
    if (logs.length >= 10) factors.push('Long-term commitment');

    return factors;
  }
}
