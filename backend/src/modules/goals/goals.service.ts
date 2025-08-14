import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Goal, GoalStatus, GoalType } from './goal.entity';
import { GoalProgress } from './goal-progress.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateGoalProgressDto } from './dto/create-goal-progress.dto';
import { Habit } from '../habits/habit.entity';
import { NotificationsService } from '../notifications/notifications.service';

export interface GoalAnalytics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  averageProgress: number;
  onTrackGoals: number;
  behindScheduleGoals: number;
  completionRate: number;
  averageDaysToComplete: number;
  topPerformingCategories: string[];
  needsAttentionGoals: number[];
}

export interface GoalProgressReport {
  goalId: number;
  goalTitle: string;
  currentProgress: number;
  targetProgress: number;
  daysRemaining: number;
  isOnTrack: boolean;
  projectedCompletionDate: Date;
  recommendedActions: string[];
}

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalsRepository: Repository<Goal>,
    @InjectRepository(GoalProgress)
    private goalProgressRepository: Repository<GoalProgress>,
    @InjectRepository(Habit)
    private habitsRepository: Repository<Habit>,
    private notificationsService: NotificationsService
  ) {}

  async create(createGoalDto: CreateGoalDto, userId: number): Promise<Goal> {
    // Validate SMART goal attributes
    this.validateSmartGoal(createGoalDto);

    // Calculate initial progress percentage
    const progressPercentage = createGoalDto.targetValue ? 0 : 0;

    // Create goal with default settings
    const defaultSettings = {
      allowPartialProgress: true,
      requireVerification: false,
      autoAdjustTarget: false,
      reminderFrequency: 'daily' as const,
      showProgress: true,
      shareProgress: false,
      ...createGoalDto.settings,
    };

    const goal = this.goalsRepository.create({
      ...createGoalDto,
      userId,
      progressPercentage,
      settings: defaultSettings,
      startDate: new Date(createGoalDto.startDate),
      targetDate: new Date(createGoalDto.targetDate),
      lastActivityAt: new Date(),
    });

    // Handle habit relationships
    if (createGoalDto.habitIds && createGoalDto.habitIds.length > 0) {
      const habits = await this.habitsRepository.findByIds(
        createGoalDto.habitIds
      );
      goal.habits = habits;
    }

    const savedGoal = await this.goalsRepository.save(goal);

    // Send notification for goal creation
    await this.notificationsService.sendGoalCreatedNotification(
      userId,
      savedGoal
    );

    return savedGoal;
  }

  async findAll(userId: number, filters?: any): Promise<Goal[]> {
    const queryBuilder = this.goalsRepository
      .createQueryBuilder('goal')
      .leftJoinAndSelect('goal.habits', 'habits')
      .where('goal.userId = :userId', { userId });

    if (filters?.status) {
      queryBuilder.andWhere('goal.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.type) {
      queryBuilder.andWhere('goal.type = :type', { type: filters.type });
    }

    if (filters?.difficulty) {
      queryBuilder.andWhere('goal.difficulty = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    if (filters?.priority) {
      queryBuilder.andWhere('goal.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters?.category) {
      queryBuilder.andWhere('goal.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('goal.tags && :tags', { tags: filters.tags });
    }

    return queryBuilder.orderBy('goal.createdAt', 'DESC').getMany();
  }

  async findOne(id: number, userId: number): Promise<Goal> {
    const goal = await this.goalsRepository.findOne({
      where: { id, userId },
      relations: ['habits', 'user'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return goal;
  }

  async update(
    id: number,
    updateGoalDto: UpdateGoalDto,
    userId: number
  ): Promise<Goal> {
    const goal = await this.findOne(id, userId);

    // Validate SMART goal attributes if they're being updated
    if (
      updateGoalDto.specific ||
      updateGoalDto.measurable ||
      updateGoalDto.achievable ||
      updateGoalDto.relevant ||
      updateGoalDto.timeBound
    ) {
      this.validateSmartGoal({ ...goal, ...updateGoalDto });
    }

    // Handle habit relationships
    if (updateGoalDto.habitIds) {
      const habits = await this.habitsRepository.findByIds(
        updateGoalDto.habitIds
      );
      goal.habits = habits;
    }

    // Update dates if provided
    if (updateGoalDto.startDate) {
      goal.startDate = new Date(updateGoalDto.startDate);
    }
    if (updateGoalDto.targetDate) {
      goal.targetDate = new Date(updateGoalDto.targetDate);
    }

    Object.assign(goal, updateGoalDto);
    goal.lastActivityAt = new Date();

    const updatedGoal = await this.goalsRepository.save(goal);

    // Send notification for goal update
    await this.notificationsService.sendGoalUpdatedNotification(
      userId,
      updatedGoal
    );

    return updatedGoal;
  }

  async remove(id: number, userId: number): Promise<void> {
    const goal = await this.findOne(id, userId);
    await this.goalsRepository.remove(goal);
  }

  async addProgress(
    createProgressDto: CreateGoalProgressDto,
    userId: number
  ): Promise<GoalProgress> {
    const goal = await this.findOne(createProgressDto.goalId, userId);

    if (goal.status !== GoalStatus.ACTIVE) {
      throw new BadRequestException('Cannot add progress to non-active goal');
    }

    // Get previous progress for comparison
    const previousProgress = await this.goalProgressRepository.findOne({
      where: { goalId: createProgressDto.goalId },
      order: { date: 'DESC' },
    });

    const progress = this.goalProgressRepository.create({
      ...createProgressDto,
      userId,
      previousValue: previousProgress?.value || 0,
      change: previousProgress
        ? createProgressDto.value - previousProgress.value
        : createProgressDto.value,
      percentageChange: previousProgress
        ? ((createProgressDto.value - previousProgress.value) /
            previousProgress.value) *
          100
        : 0,
      date: new Date(createProgressDto.date),
    });

    const savedProgress = await this.goalProgressRepository.save(progress);

    // Update goal progress
    await this.updateGoalProgress(goal.id, createProgressDto.value);

    // Check for milestone achievements
    await this.checkMilestones(goal, createProgressDto.value);

    // Send progress notification
    await this.notificationsService.sendGoalProgressNotification(
      userId,
      goal,
      savedProgress
    );

    return savedProgress;
  }

  async getProgressHistory(
    goalId: number,
    userId: number
  ): Promise<GoalProgress[]> {
    await this.findOne(goalId, userId);

    return this.goalProgressRepository.find({
      where: { goalId },
      order: { date: 'ASC' },
    });
  }

  async getGoalAnalytics(userId: number): Promise<GoalAnalytics> {
    const goals = await this.findAll(userId);
    const totalGoals = goals.length;
    const activeGoals = goals.filter(
      (g) => g.status === GoalStatus.ACTIVE
    ).length;
    const completedGoals = goals.filter(
      (g) => g.status === GoalStatus.COMPLETED
    ).length;

    const averageProgress =
      goals.length > 0
        ? goals.reduce((sum, goal) => sum + goal.progressPercentage, 0) /
          goals.length
        : 0;

    const onTrackGoals = goals.filter((goal) =>
      this.isGoalOnTrack(goal)
    ).length;
    const behindScheduleGoals = goals.filter(
      (goal) => !this.isGoalOnTrack(goal)
    ).length;

    const completionRate =
      totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    // Calculate average days to complete
    const completedGoalDurations = goals
      .filter((g) => g.status === GoalStatus.COMPLETED && g.completedDate)
      .map((g) => {
        const start = new Date(g.startDate);
        const completed = new Date(g.completedDate);
        return Math.ceil(
          (completed.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
      });

    const averageDaysToComplete =
      completedGoalDurations.length > 0
        ? completedGoalDurations.reduce((sum, days) => sum + days, 0) /
          completedGoalDurations.length
        : 0;

    // Top performing categories
    const categoryProgress = goals.reduce(
      (acc, goal) => {
        if (goal.category) {
          if (!acc[goal.category]) {
            acc[goal.category] = { total: 0, count: 0 };
          }
          acc[goal.category].total += goal.progressPercentage;
          acc[goal.category].count += 1;
        }
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    );

    const topPerformingCategories = Object.entries(categoryProgress)
      .map(([category, data]) => ({
        category,
        averageProgress: data.total / data.count,
      }))
      .sort((a, b) => b.averageProgress - a.averageProgress)
      .slice(0, 5)
      .map((item) => item.category);

    // Goals needing attention
    const needsAttentionGoals = goals
      .filter(
        (goal) => !this.isGoalOnTrack(goal) && goal.status === GoalStatus.ACTIVE
      )
      .map((goal) => goal.id);

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      averageProgress,
      onTrackGoals,
      behindScheduleGoals,
      completionRate,
      averageDaysToComplete,
      topPerformingCategories,
      needsAttentionGoals,
    };
  }

  async getProgressReport(userId: number): Promise<GoalProgressReport[]> {
    const activeGoals = await this.findAll(userId, {
      status: GoalStatus.ACTIVE,
    });

    return activeGoals.map((goal) => {
      const daysRemaining = Math.ceil(
        (new Date(goal.targetDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const isOnTrack = this.isGoalOnTrack(goal);

      // Calculate projected completion date
      const projectedCompletionDate =
        this.calculateProjectedCompletionDate(goal);

      // Generate recommended actions
      const recommendedActions = this.generateRecommendedActions(
        goal,
        isOnTrack
      );

      return {
        goalId: goal.id,
        goalTitle: goal.title,
        currentProgress: goal.progressPercentage,
        targetProgress: this.calculateTargetProgress(goal),
        daysRemaining: Math.max(0, daysRemaining),
        isOnTrack,
        projectedCompletionDate,
        recommendedActions,
      };
    });
  }

  async checkMilestones(goal: Goal, currentValue: number): Promise<void> {
    if (!goal.milestones) return;

    for (const milestone of goal.milestones) {
      if (!milestone.isCompleted && currentValue >= milestone.targetValue) {
        milestone.isCompleted = true;
        milestone.achievedAt = new Date();
        milestone.achievedValue = currentValue;

        // Add achievement
        if (!goal.achievements) goal.achievements = [];
        goal.achievements.push({
          id: Date.now().toString(),
          title: `Milestone: ${milestone.title}`,
          description: `Achieved milestone: ${milestone.description}`,
          type: 'milestone',
          achievedAt: new Date(),
          badge: 'milestone',
        });

        await this.goalsRepository.save(goal);

        // Send milestone notification
        await this.notificationsService.sendMilestoneAchievedNotification(
          goal.userId,
          goal,
          milestone
        );
      }
    }
  }

  async completeGoal(goalId: number, userId: number): Promise<Goal> {
    const goal = await this.findOne(goalId, userId);

    if (goal.status === GoalStatus.COMPLETED) {
      throw new BadRequestException('Goal is already completed');
    }

    goal.status = GoalStatus.COMPLETED;
    goal.completedDate = new Date();
    goal.progressPercentage = 100;
    goal.lastActivityAt = new Date();

    const completedGoal = await this.goalsRepository.save(goal);

    // Send completion notification
    await this.notificationsService.sendGoalCompletedNotification(
      userId,
      completedGoal
    );

    return completedGoal;
  }

  async pauseGoal(goalId: number, userId: number): Promise<Goal> {
    const goal = await this.findOne(goalId, userId);

    if (goal.status !== GoalStatus.ACTIVE) {
      throw new BadRequestException('Only active goals can be paused');
    }

    goal.status = GoalStatus.PAUSED;
    goal.lastActivityAt = new Date();

    return this.goalsRepository.save(goal);
  }

  async resumeGoal(goalId: number, userId: number): Promise<Goal> {
    const goal = await this.findOne(goalId, userId);

    if (goal.status !== GoalStatus.PAUSED) {
      throw new BadRequestException('Only paused goals can be resumed');
    }

    goal.status = GoalStatus.ACTIVE;
    goal.lastActivityAt = new Date();

    return this.goalsRepository.save(goal);
  }

  private validateSmartGoal(goalData: any): void {
    const smartAttributes = [
      'specific',
      'measurable',
      'achievable',
      'relevant',
      'timeBound',
    ];
    const missingAttributes = smartAttributes.filter((attr) => !goalData[attr]);

    if (missingAttributes.length > 0) {
      throw new BadRequestException(
        `Missing SMART goal attributes: ${missingAttributes.join(', ')}. ` +
          'All SMART attributes must be defined for proper goal setting.'
      );
    }
  }

  private async updateGoalProgress(
    goalId: number,
    newValue: number
  ): Promise<void> {
    const goal = await this.goalsRepository.findOne({ where: { id: goalId } });

    if (goal && goal.targetValue) {
      goal.currentValue = newValue;
      goal.progressPercentage = Math.min(
        (newValue / goal.targetValue) * 100,
        100
      );
      goal.lastActivityAt = new Date();

      // Auto-complete goal if target is reached
      if (goal.progressPercentage >= 100 && goal.status === GoalStatus.ACTIVE) {
        goal.status = GoalStatus.COMPLETED;
        goal.completedDate = new Date();
      }

      await this.goalsRepository.save(goal);
    }
  }

  private isGoalOnTrack(goal: Goal): boolean {
    if (goal.status !== GoalStatus.ACTIVE) return false;

    const today = new Date();
    const startDate = new Date(goal.startDate);
    const targetDate = new Date(goal.targetDate);

    const totalDays = Math.ceil(
      (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const elapsedDays = Math.ceil(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (totalDays <= 0 || elapsedDays <= 0) return true;

    const expectedProgress = (elapsedDays / totalDays) * 100;
    return goal.progressPercentage >= expectedProgress;
  }

  private calculateTargetProgress(goal: Goal): number {
    const today = new Date();
    const startDate = new Date(goal.startDate);
    const targetDate = new Date(goal.targetDate);

    const totalDays = Math.ceil(
      (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const elapsedDays = Math.ceil(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (totalDays <= 0 || elapsedDays <= 0) return 0;

    return Math.min((elapsedDays / totalDays) * 100, 100);
  }

  private calculateProjectedCompletionDate(goal: Goal): Date {
    if (goal.progressPercentage <= 0) return goal.targetDate;

    const today = new Date();
    const startDate = new Date(goal.startDate);
    const totalDays = Math.ceil(
      (new Date(goal.targetDate).getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const projectedDays = Math.ceil(
      totalDays / (goal.progressPercentage / 100)
    );
    const projectedDate = new Date(startDate);
    projectedDate.setDate(startDate.getDate() + projectedDays);

    return projectedDate;
  }

  private generateRecommendedActions(goal: Goal, isOnTrack: boolean): string[] {
    const actions: string[] = [];

    if (!isOnTrack) {
      actions.push('Increase daily effort to catch up with timeline');
      actions.push('Review and adjust goal timeline if needed');
      actions.push('Break down goal into smaller, manageable tasks');
    }

    if (goal.progressPercentage < 25) {
      actions.push('Focus on building momentum with small wins');
      actions.push('Set up daily reminders and tracking');
    } else if (goal.progressPercentage < 50) {
      actions.push('Maintain consistent progress patterns');
      actions.push('Celebrate intermediate achievements');
    } else if (goal.progressPercentage < 75) {
      actions.push('Push through the middle phase');
      actions.push('Stay motivated with progress visualization');
    } else {
      actions.push('Focus on finishing strong');
      actions.push('Plan for post-goal maintenance');
    }

    if (goal.milestones && goal.milestones.some((m) => !m.isCompleted)) {
      actions.push('Work towards next milestone');
    }

    return actions;
  }
}
