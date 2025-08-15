import { Injectable, NotFoundException } from '@nestjs/common';
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
import {
  HabitCorrelationDto,
  HabitCorrelationQueryDto,
  CorrelationType,
} from './dto/habit-correlation.dto';
import {
  HabitPredictionDto,
  PredictiveAnalyticsQueryDto,
  PredictionInsightsDto,
  PredictionType,
  PredictionConfidence,
} from './dto/predictive-analytics.dto';
import {
  CustomDashboardDto,
  CreateDashboardDto,
  UpdateDashboardDto,
} from './dto/custom-dashboard.dto';
import {
  DataExportRequestDto,
  DataExportResponseDto,
  ExportHistoryDto,
} from './dto/data-export.dto';

@Injectable()
export class AdvancedAnalyticsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Habit)
    private habitsRepository: Repository<Habit>,
    @InjectRepository(HabitLog)
    private habitLogsRepository: Repository<HabitLog>
  ) {}

  // Habit Correlation Analysis
  async analyzeHabitCorrelations(
    userId: number,
    query: HabitCorrelationQueryDto
  ): Promise<HabitCorrelationDto[]> {
    const habits = await this.habitsRepository.find({
      where: { userId },
      relations: ['habitLogs'],
    });

    if (habits.length < 2) {
      return [];
    }

    const correlations: HabitCorrelationDto[] = [];

    // Analyze correlations between all habit pairs
    for (let i = 0; i < habits.length; i++) {
      for (let j = i + 1; j < habits.length; j++) {
        const habit1 = habits[i];
        const habit2 = habits[j];

        const correlation = await this.calculateHabitCorrelation(
          habit1,
          habit2
        );

        if (correlation && this.matchesCorrelationQuery(correlation, query)) {
          correlations.push(correlation);
        }
      }
    }

    // Sort by correlation strength (absolute value)
    return correlations.sort(
      (a, b) =>
        Math.abs(b.correlationCoefficient) - Math.abs(a.correlationCoefficient)
    );
  }

  private async calculateHabitCorrelation(
    habit1: Habit,
    habit2: Habit
  ): Promise<HabitCorrelationDto | null> {
    const logs1 = habit1.habitLogs || [];
    const logs2 = habit2.habitLogs || [];

    if (logs1.length < 10 || logs2.length < 10) {
      return null; // Need sufficient data for correlation analysis
    }

    // Create a map of dates to completion status for both habits
    const habit1Data = new Map<string, boolean>();
    const habit2Data = new Map<string, boolean>();

    logs1.forEach((log) => {
      const dateKey = log.date.toISOString().split('T')[0];
      habit1Data.set(dateKey, log.status === 'completed');
    });

    logs2.forEach((log) => {
      const dateKey = log.date.toISOString().split('T')[0];
      habit2Data.set(dateKey, log.status === 'completed');
    });

    // Find common dates
    const commonDates = Array.from(habit1Data.keys()).filter((date) =>
      habit2Data.has(date)
    );

    if (commonDates.length < 10) {
      return null; // Need sufficient common data points
    }

    // Calculate correlation coefficient
    const correlationCoefficient = this.calculatePearsonCorrelation(
      commonDates.map((date) => (habit1Data.get(date) ? 1 : 0)),
      commonDates.map((date) => (habit2Data.get(date) ? 1 : 0))
    );

    if (Math.abs(correlationCoefficient) < 0.1) {
      return null; // Correlation too weak
    }

    const correlationType =
      correlationCoefficient > 0
        ? CorrelationType.POSITIVE
        : CorrelationType.NEGATIVE;
    const strength = this.getCorrelationStrength(
      Math.abs(correlationCoefficient)
    );
    const confidence = this.calculateCorrelationConfidence(
      commonDates.length,
      Math.abs(correlationCoefficient)
    );

    return {
      habitId1: habit1.id,
      habitId2: habit2.id,
      habitName1: habit1.title,
      habitName2: habit2.title,
      correlationCoefficient,
      correlationType,
      strength,
      confidence,
      dataPoints: commonDates.length,
      explanation: this.generateCorrelationExplanation(
        habit1.title,
        habit2.title,
        correlationCoefficient,
        correlationType
      ),
      insights: this.generateCorrelationInsights(
        habit1.title,
        habit2.title,
        correlationCoefficient,
        commonDates
      ),
      calculatedAt: new Date(),
    };
  }

  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private getCorrelationStrength(coefficient: number): CorrelationType {
    if (coefficient >= 0.7) return CorrelationType.STRONG;
    if (coefficient >= 0.5) return CorrelationType.MODERATE;
    return CorrelationType.WEAK;
  }

  private calculateCorrelationConfidence(
    dataPoints: number,
    coefficient: number
  ): number {
    // Simple confidence calculation based on data points and correlation strength
    const baseConfidence = Math.min(0.95, 0.5 + (dataPoints / 100) * 0.3);
    const strengthBonus = Math.abs(coefficient) * 0.2;
    return Math.min(0.99, baseConfidence + strengthBonus);
  }

  private generateCorrelationExplanation(
    habit1Name: string,
    habit2Name: string,
    coefficient: number,
    type: CorrelationType
  ): string {
    const strength = Math.abs(coefficient);
    const percentage = Math.round(Math.abs(coefficient) * 100);

    if (type === CorrelationType.POSITIVE) {
      if (strength >= 0.7) {
        return `There is a very strong positive correlation between ${habit1Name} and ${habit2Name}. When you complete one, you're ${percentage}% more likely to complete the other.`;
      } else if (strength >= 0.5) {
        return `There is a moderate positive correlation between ${habit1Name} and ${habit2Name}. Completing one habit tends to help with the other.`;
      } else {
        return `There is a weak positive correlation between ${habit1Name} and ${habit2Name}. They may support each other to some degree.`;
      }
    } else {
      if (strength >= 0.7) {
        return `There is a very strong negative correlation between ${habit1Name} and ${habit2Name}. When you complete one, you're ${percentage}% less likely to complete the other.`;
      } else if (strength >= 0.5) {
        return `There is a moderate negative correlation between ${habit1Name} and ${habit2Name}. They may be competing for your time or energy.`;
      } else {
        return `There is a weak negative correlation between ${habit1Name} and ${habit2Name}. They may have slight conflicts.`;
      }
    }
  }

  private generateCorrelationInsights(
    habit1Name: string,
    habit2Name: string,
    coefficient: number,
    commonDates: string[]
  ): string[] {
    const insights: string[] = [];
    const strength = Math.abs(coefficient);

    if (strength >= 0.7) {
      insights.push(
        `Consider scheduling ${habit1Name} and ${habit2Name} together for maximum efficiency`
      );
      insights.push(`These habits work well as a combined routine`);
    } else if (strength >= 0.5) {
      insights.push(
        `Try to maintain consistency in both habits simultaneously`
      );
      insights.push(
        `Look for ways to strengthen the connection between these habits`
      );
    }

    // Add time-based insights
    if (commonDates.length > 20) {
      insights.push(
        `Analysis based on ${commonDates.length} days of data provides reliable insights`
      );
    }

    return insights;
  }

  private matchesCorrelationQuery(
    correlation: HabitCorrelationDto,
    query: HabitCorrelationQueryDto
  ): boolean {
    if (
      query.minCorrelation &&
      Math.abs(correlation.correlationCoefficient) < query.minCorrelation
    ) {
      return false;
    }
    if (
      query.maxCorrelation &&
      Math.abs(correlation.correlationCoefficient) > query.maxCorrelation
    ) {
      return false;
    }
    if (query.minConfidence && correlation.confidence < query.minConfidence) {
      return false;
    }
    if (query.minDataPoints && correlation.dataPoints < query.minDataPoints) {
      return false;
    }
    if (
      query.includePositive &&
      correlation.correlationType !== CorrelationType.POSITIVE
    ) {
      return false;
    }
    if (
      query.includeNegative &&
      correlation.correlationType !== CorrelationType.NEGATIVE
    ) {
      return false;
    }
    return true;
  }

  // Predictive Analytics
  async generateHabitPredictions(
    userId: number,
    query: PredictiveAnalyticsQueryDto
  ): Promise<PredictionInsightsDto> {
    const habits = await this.habitsRepository.find({
      where: query.habitId ? { id: query.habitId, userId } : { userId },
      relations: ['habitLogs'],
    });

    const predictions: HabitPredictionDto[] = [];
    let totalConfidence = 0;

    for (const habit of habits) {
      const prediction = await this.predictHabitSuccess(
        habit,
        query.timeframeDays || 30
      );
      if (
        prediction &&
        (!query.minConfidence ||
          prediction.confidenceScore >= query.minConfidence)
      ) {
        predictions.push(prediction);
        totalConfidence += prediction.confidenceScore;
      }
    }

    const overallConfidence =
      predictions.length > 0 ? totalConfidence / predictions.length : 0;
    const keyInsights = this.generatePredictionInsights(predictions);
    const recommendations = this.generatePredictionRecommendations(predictions);

    return {
      summary: this.generatePredictionSummary(predictions, overallConfidence),
      predictions,
      overallConfidence,
      keyInsights,
      recommendations,
      generatedAt: new Date(),
    };
  }

  private async predictHabitSuccess(
    habit: Habit,
    timeframeDays: number
  ): Promise<HabitPredictionDto | null> {
    const logs = habit.habitLogs || [];
    if (logs.length < 14) return null; // Need at least 2 weeks of data

    // Calculate current success rate
    const recentLogs = logs.slice(-30); // Last 30 days
    const successRate =
      recentLogs.filter((log) => log.status === 'completed').length /
      recentLogs.length;

    // Calculate trend
    const trend = this.calculateHabitTrend(logs);

    // Predict future success rate based on trend and current performance
    let predictedValue = successRate;
    if (trend === 'improving') {
      predictedValue = Math.min(1, successRate + 0.1);
    } else if (trend === 'declining') {
      predictedValue = Math.max(0, successRate - 0.1);
    }

    // Calculate confidence based on data consistency and trend strength
    const consistencyScore = this.calculateConsistencyScore(logs);
    const confidenceScore = Math.min(
      0.95,
      0.5 +
        consistencyScore * 0.3 +
        Math.abs(predictedValue - successRate) * 0.2
    );

    const confidence =
      confidenceScore >= 0.8
        ? PredictionConfidence.HIGH
        : confidenceScore >= 0.6
          ? PredictionConfidence.MEDIUM
          : PredictionConfidence.LOW;

    const predictionType = PredictionType.SUCCESS_RATE;
    const predictedAt = new Date();
    const expiresAt = new Date(
      predictedAt.getTime() + timeframeDays * 24 * 60 * 60 * 1000
    );

    return {
      habitId: habit.id,
      habitName: habit.title,
      predictionType,
      predictedValue,
      confidence,
      confidenceScore,
      timeframeDays,
      predictedAt,
      expiresAt,
      explanation: this.generatePredictionExplanation(
        habit.title,
        predictedValue,
        trend,
        confidenceScore
      ),
      influencingFactors: this.identifyInfluencingFactors(logs, successRate),
      recommendations: this.generateHabitRecommendations(
        habit.title,
        predictedValue,
        trend
      ),
      riskFactors: this.identifyRiskFactors(logs, successRate),
      historicalAccuracy: this.calculateHistoricalAccuracy(habit.title, logs),
    };
  }

  private calculateHabitTrend(
    logs: HabitLog[]
  ): 'improving' | 'declining' | 'stable' {
    if (logs.length < 14) return 'stable';

    const recent = logs.slice(-14);
    const older = logs.slice(-28, -14);

    const recentRate =
      recent.filter((log) => log.status === 'completed').length / recent.length;
    const olderRate =
      older.filter((log) => log.status === 'completed').length / older.length;

    const difference = recentRate - olderRate;
    if (Math.abs(difference) < 0.1) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  private calculateConsistencyScore(logs: HabitLog[]): number {
    if (logs.length < 7) return 0;

    const recent = logs.slice(-7);
    const completedDays = recent.filter(
      (log) => log.status === 'completed'
    ).length;
    const consistency = completedDays / 7;

    // Bonus for streaks
    let streakBonus = 0;
    let currentStreak = 0;
    for (let i = recent.length - 1; i >= 0; i--) {
      if (recent[i].status === 'completed') {
        currentStreak++;
        streakBonus += currentStreak * 0.05;
      } else {
        break;
      }
    }

    return Math.min(1, consistency + streakBonus);
  }

  private generatePredictionExplanation(
    habitName: string,
    predictedValue: number,
    trend: string,
    confidence: number
  ): string {
    const percentage = Math.round(predictedValue * 100);
    const confidenceText =
      confidence >= 0.8
        ? 'high confidence'
        : confidence >= 0.6
          ? 'moderate confidence'
          : 'low confidence';

    return `Based on your current performance and ${trend} trend, you are predicted to maintain a ${percentage}% success rate for ${habitName} with ${confidenceText}.`;
  }

  private identifyInfluencingFactors(
    logs: HabitLog[],
    successRate: number
  ): string[] {
    const factors: string[] = [];

    if (successRate >= 0.8) {
      factors.push('High motivation and consistency');
      factors.push('Strong routine establishment');
    } else if (successRate >= 0.6) {
      factors.push('Moderate consistency');
      factors.push('Some routine challenges');
    } else {
      factors.push('Inconsistent routine');
      factors.push('Need for better habit formation');
    }

    // Add time-based factors
    const dayOfWeekStats = this.calculateDayOfWeekStats(logs);
    if (dayOfWeekStats.bestDay && dayOfWeekStats.bestDayRate > 0.8) {
      factors.push(`Strong performance on ${dayOfWeekStats.bestDay}s`);
    }

    return factors;
  }

  private generateHabitRecommendations(
    habitName: string,
    predictedValue: number,
    trend: string
  ): string[] {
    const recommendations: string[] = [];

    if (predictedValue < 0.6) {
      recommendations.push(`Focus on building consistency for ${habitName}`);
      recommendations.push('Start with smaller, more achievable goals');
      recommendations.push('Use reminders and accountability tools');
    } else if (predictedValue < 0.8) {
      recommendations.push(`Maintain current routine for ${habitName}`);
      recommendations.push('Look for opportunities to improve efficiency');
      recommendations.push('Celebrate small wins to maintain motivation');
    } else {
      recommendations.push(`Excellent work with ${habitName}!`);
      recommendations.push('Consider adding related habits');
      recommendations.push('Share your success to inspire others');
    }

    if (trend === 'declining') {
      recommendations.push('Identify what changed in your routine');
      recommendations.push('Revisit your motivation and goals');
    }

    return recommendations;
  }

  private identifyRiskFactors(logs: HabitLog[], successRate: number): string[] {
    const riskFactors: string[] = [];

    if (successRate < 0.5) {
      riskFactors.push('Low consistency may lead to habit breakdown');
      riskFactors.push('Risk of losing momentum');
    }

    // Check for recent failures
    const recentFailures = logs
      .slice(-7)
      .filter((log) => log.status !== 'completed').length;
    if (recentFailures >= 3) {
      riskFactors.push('Recent failures may indicate routine disruption');
    }

    // Check for weekend patterns
    const weekendLogs = logs.filter((log) => {
      const day = log.date.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });
    if (weekendLogs.length > 0) {
      const weekendRate =
        weekendLogs.filter((log) => log.status === 'completed').length /
        weekendLogs.length;
      if (weekendRate < successRate * 0.7) {
        riskFactors.push('Weekend routine may be less consistent');
      }
    }

    return riskFactors;
  }

  private calculateHistoricalAccuracy(
    habitName: string,
    logs: HabitLog[]
  ): number {
    // This would typically use historical prediction accuracy
    // For now, return a reasonable default based on data quality
    if (logs.length >= 30) return 0.85;
    if (logs.length >= 14) return 0.75;
    return 0.65;
  }

  private generatePredictionInsights(
    predictions: HabitPredictionDto[]
  ): string[] {
    const insights: string[] = [];

    if (predictions.length === 0) {
      return ['Need more data to generate reliable predictions'];
    }

    const highConfidence = predictions.filter(
      (p) => p.confidence === PredictionConfidence.HIGH
    );
    const improving = predictions.filter((p) => p.predictedValue > 0.7);
    const needsAttention = predictions.filter((p) => p.predictedValue < 0.5);

    if (highConfidence.length > 0) {
      insights.push(
        `${highConfidence.length} habits have high-confidence predictions`
      );
    }

    if (improving.length > 0) {
      insights.push(
        `${improving.length} habits are showing strong positive trends`
      );
    }

    if (needsAttention.length > 0) {
      insights.push(
        `${needsAttention.length} habits may need additional focus`
      );
    }

    return insights;
  }

  private generatePredictionRecommendations(
    predictions: HabitPredictionDto[]
  ): string[] {
    const recommendations: string[] = [];

    if (predictions.length === 0) {
      return ['Continue building your habit data for better insights'];
    }

    const lowPredictions = predictions.filter((p) => p.predictedValue < 0.6);
    const highPredictions = predictions.filter((p) => p.predictedValue > 0.8);

    if (lowPredictions.length > 0) {
      recommendations.push(
        `Focus on improving ${lowPredictions.length} habits with lower predictions`
      );
    }

    if (highPredictions.length > 0) {
      recommendations.push(
        `Leverage momentum from ${highPredictions.length} high-performing habits`
      );
    }

    recommendations.push('Review predictions weekly to track accuracy');
    recommendations.push('Use insights to adjust your routine and goals');

    return recommendations;
  }

  private generatePredictionSummary(
    predictions: HabitPredictionDto[],
    overallConfidence: number
  ): string {
    if (predictions.length === 0) {
      return 'No predictions available yet. Continue building your habit data.';
    }

    const avgPrediction =
      predictions.reduce((sum, p) => sum + p.predictedValue, 0) /
      predictions.length;
    const percentage = Math.round(avgPrediction * 100);
    const confidenceText =
      overallConfidence >= 0.8
        ? 'high confidence'
        : overallConfidence >= 0.6
          ? 'moderate confidence'
          : 'low confidence';

    return `Your habits show an average predicted success rate of ${percentage}% with ${confidenceText}. ${predictions.length} habits analyzed.`;
  }

  private calculateDayOfWeekStats(logs: HabitLog[]): {
    bestDay: string;
    bestDayRate: number;
  } {
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayStats = new Array(7)
      .fill(0)
      .map(() => ({ total: 0, completed: 0 }));

    logs.forEach((log) => {
      const day = log.date.getDay();
      dayStats[day].total++;
      if (log.status === 'completed') {
        dayStats[day].completed++;
      }
    });

    let bestDay = 'Unknown';
    let bestRate = 0;

    dayStats.forEach((stats, index) => {
      if (stats.total > 0) {
        const rate = stats.completed / stats.total;
        if (rate > bestRate) {
          bestRate = rate;
          bestDay = dayNames[index];
        }
      }
    });

    return { bestDay, bestDayRate: bestRate };
  }

  // Custom Dashboard Management
  async createCustomDashboard(
    userId: number,
    createDashboardDto: CreateDashboardDto
  ): Promise<CustomDashboardDto> {
    const dashboard: CustomDashboardDto = {
      id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: createDashboardDto.name,
      description: createDashboardDto.description || '',
      isDefault: createDashboardDto.isDefault || false,
      gridConfig: createDashboardDto.gridConfig || {
        columns: 12,
        rows: 8,
        cellSize: 50,
      },
      widgets: createDashboardDto.widgets || [],
      theme: 'light',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Save to database
    return dashboard;
  }

  async updateCustomDashboard(
    userId: number,
    dashboardId: string,
    updateDashboardDto: UpdateDashboardDto
  ): Promise<CustomDashboardDto> {
    // TODO: Implement dashboard update logic
    throw new Error('Dashboard update not implemented yet');
  }

  async getCustomDashboard(
    userId: number,
    dashboardId: string
  ): Promise<CustomDashboardDto> {
    // TODO: Implement dashboard retrieval logic
    throw new Error('Dashboard retrieval not implemented yet');
  }

  // Data Export
  async exportData(
    userId: number,
    exportRequest: DataExportRequestDto
  ): Promise<DataExportResponseDto> {
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // TODO: Implement actual data export logic
    const exportResponse: DataExportResponseDto = {
      exportId,
      status: 'pending',
      exportType: exportRequest.exportType,
      format: exportRequest.format,
      timeRange: exportRequest.timeRange,
      recordCount: '0',
      fileSize: '0 KB',
      createdAt: new Date().toISOString(),
    };

    // TODO: Process export in background job
    setTimeout(() => {
      // Simulate export completion
      console.log(`Export ${exportId} completed`);
    }, 2000);

    return exportResponse;
  }

  async getExportStatus(
    userId: number,
    exportId: string
  ): Promise<DataExportResponseDto> {
    // TODO: Implement export status retrieval
    throw new Error('Export status retrieval not implemented yet');
  }

  async getExportHistory(userId: number): Promise<ExportHistoryDto> {
    // TODO: Implement export history retrieval
    return {
      exports: [],
      totalExports: '0',
      totalStorageUsed: '0 KB',
      retrievedAt: new Date().toISOString(),
    };
  }
}
