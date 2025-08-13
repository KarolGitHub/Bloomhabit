import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { UsersService } from '../users/users.service';
import { HabitsService } from '../habits/habits.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly habitsService: HabitsService
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async getGardenInsights(userId: number): Promise<any> {
    try {
      const user = await this.usersService.findOne(userId);
      const habits = await this.habitsService.findAll(userId);

      if (!this.openai) {
        return this.getFallbackInsights(habits);
      }

      const prompt = this.buildGardenInsightsPrompt(user, habits);
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI Gardener, a wise and encouraging mentor who helps users cultivate their habits.
            You speak in a warm, garden-themed way, using flower and growth metaphors.
            Provide specific, actionable advice based on the user's habit data.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const insights = completion.choices[0]?.message?.content || '';

      return {
        insights: this.parseInsights(insights),
        gardenMood: this.calculateGardenMood(habits),
        recommendations: this.generateRecommendations(habits),
        motivation: this.generateMotivation(habits),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Error getting AI insights:', error);
      return this.getFallbackInsights([]);
    }
  }

  async getHabitCoaching(habitId: number, userId: number): Promise<any> {
    try {
      const habit = await this.habitsService.findOne(habitId, userId);

      if (!this.openai) {
        return this.getFallbackHabitCoaching(habit);
      }

      const prompt = this.buildHabitCoachingPrompt(habit);
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI Gardener specializing in individual habit coaching.
            Provide specific, actionable advice for this particular habit, using garden metaphors.
            Be encouraging but realistic, and offer concrete steps for improvement.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const coaching = completion.choices[0]?.message?.content || '';

      return {
        coaching: this.parseCoaching(coaching),
        habitAnalysis: this.analyzeHabit(habit),
        nextSteps: this.suggestNextSteps(habit),
        encouragement: this.generateEncouragement(habit),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Error getting habit coaching:', error);
      return this.getFallbackHabitCoaching(null);
    }
  }

  async getWeeklyReport(userId: number): Promise<any> {
    try {
      const user = await this.usersService.findOne(userId);
      const habits = await this.habitsService.findAll(userId);

      if (!this.openai) {
        return this.getFallbackWeeklyReport(habits);
      }

      const prompt = this.buildWeeklyReportPrompt(user, habits);
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI Gardener creating a weekly progress report.
            Analyze the user's habit performance over the week, celebrate achievements,
            identify areas for improvement, and provide motivation for the coming week.
            Use garden metaphors and be encouraging.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 600,
        temperature: 0.7,
      });

      const report = completion.choices[0]?.message?.content || '';

      return {
        report: this.parseWeeklyReport(report),
        weeklyStats: this.calculateWeeklyStats(habits),
        achievements: this.identifyAchievements(habits),
        nextWeekGoals: this.suggestNextWeekGoals(habits),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Error getting weekly report:', error);
      return this.getFallbackWeeklyReport([]);
    }
  }

  private buildGardenInsightsPrompt(user: any, habits: any[]): string {
    const habitSummary = habits
      .map(
        (h) =>
          `${h.title} (${h.category}): ${h.currentStreak} day streak, ${h.growthStage}% growth, ${h.healthPoints}% health`
      )
      .join('\n');

    return `
    User: ${user.firstName} ${user.lastName}
    Total Habits: ${habits.length}
    Active Habits: ${habits.filter((h) => h.isActive).length}

    Habit Details:
    ${habitSummary}

    Please provide:
    1. Overall garden health assessment
    2. 2-3 specific insights about their habit patterns
    3. 2 actionable recommendations for improvement
    4. Encouraging motivation message
    `;
  }

  private buildHabitCoachingPrompt(habit: any): string {
    return `
    Habit: ${habit.title}
    Category: ${habit.category}
    Frequency: ${habit.frequency}
    Current Streak: ${habit.currentStreak} days
    Longest Streak: ${habit.longestStreak} days
    Growth Stage: ${habit.growthStage}%
    Health: ${habit.healthPoints}%
    Water Level: ${habit.waterLevel}%
    Start Date: ${habit.startDate}

    Please provide:
    1. Analysis of this habit's current state
    2. 3 specific tips for improvement
    3. Motivation to continue
    4. Next milestone to aim for
    `;
  }

  private buildWeeklyReportPrompt(user: any, habits: any[]): string {
    const habitProgress = habits
      .map(
        (h) =>
          `${h.title}: ${h.currentStreak} day streak, ${h.growthStage}% growth`
      )
      .join('\n');

    return `
    User: ${user.firstName} ${user.lastName}
    Week ending: ${new Date().toLocaleDateString()}

    Habit Progress:
    ${habitProgress}

    Please provide:
    1. Weekly summary and highlights
    2. Areas of improvement
    3. Celebration of achievements
    4. Goals for next week
    5. Motivational closing
    `;
  }

  private parseInsights(aiResponse: string): any {
    // Simple parsing - in production, you might want more sophisticated parsing
    return {
      summary: aiResponse,
      keyPoints: aiResponse
        .split('\n')
        .filter((line) => line.trim().length > 0),
    };
  }

  private parseCoaching(aiResponse: string): any {
    return {
      advice: aiResponse,
      keyTips: aiResponse.split('\n').filter((line) => line.trim().length > 0),
    };
  }

  private parseWeeklyReport(aiResponse: string): any {
    return {
      content: aiResponse,
      sections: aiResponse
        .split('\n\n')
        .filter((section) => section.trim().length > 0),
    };
  }

  private calculateGardenMood(habits: any[]): string {
    if (habits.length === 0) return 'empty';

    const bloomingHabits = habits.filter((h) => h.growthStage >= 80).length;
    const growingHabits = habits.filter(
      (h) => h.growthStage >= 50 && h.growthStage < 80
    ).length;
    const totalHabits = habits.length;

    if (bloomingHabits / totalHabits >= 0.7) return 'blooming';
    if ((bloomingHabits + growingHabits) / totalHabits >= 0.6) return 'growing';
    if (bloomingHabits / totalHabits >= 0.3) return 'stable';
    return 'wilting';
  }

  private generateRecommendations(habits: any[]): string[] {
    const recommendations = [];

    if (habits.length === 0) {
      recommendations.push('Start with one simple habit to build momentum');
      recommendations.push('Choose a habit that aligns with your core values');
    } else {
      const lowHealthHabits = habits.filter((h) => h.healthPoints < 50);
      if (lowHealthHabits.length > 0) {
        recommendations.push(
          `Focus on nurturing your ${lowHealthHabits[0].title} habit first`
        );
      }

      const shortStreaks = habits.filter((h) => h.currentStreak < 3);
      if (shortStreaks.length > 0) {
        recommendations.push(
          'Build consistency by focusing on daily completion'
        );
      }

      if (habits.length < 3) {
        recommendations.push(
          'Consider adding a complementary habit to your garden'
        );
      }
    }

    return recommendations;
  }

  private generateMotivation(habits: any[]): string {
    if (habits.length === 0) {
      return 'Every beautiful garden starts with a single seed. Your journey to positive change begins today! 🌱';
    }

    const bloomingCount = habits.filter((h) => h.growthStage >= 80).length;
    if (bloomingCount > 0) {
      return `Your garden is flourishing! ${bloomingCount} habit${bloomingCount > 1 ? 's are' : ' is'} blooming beautifully. Keep up the amazing work! 🌸`;
    }

    const growingCount = habits.filter((h) => h.growthStage >= 50).length;
    if (growingCount > 0) {
      return `Your habits are growing strong! With consistent care, they'll soon bloom into beautiful flowers. Stay patient and persistent! 🌱`;
    }

    return "Every day of care brings your habits closer to blooming. You're building something beautiful, one day at a time! 💪";
  }

  private analyzeHabit(habit: any): any {
    const analysis = {
      status: this.getHabitStatus(habit),
      strength: this.calculateHabitStrength(habit),
      areas: this.identifyImprovementAreas(habit),
      potential: this.assessHabitPotential(habit),
    };

    return analysis;
  }

  private getHabitStatus(habit: any): string {
    if (habit.growthStage >= 80 && habit.healthPoints >= 80) return 'blooming';
    if (habit.growthStage >= 50 && habit.healthPoints >= 50) return 'growing';
    if (habit.waterLevel < 30 || habit.healthPoints < 30) return 'wilting';
    return 'stable';
  }

  private calculateHabitStrength(habit: any): number {
    let strength = 0;
    strength += (habit.currentStreak / Math.max(habit.longestStreak, 1)) * 30;
    strength += (habit.growthStage / 100) * 30;
    strength += (habit.healthPoints / 100) * 20;
    strength += (habit.waterLevel / 100) * 20;
    return Math.round(strength);
  }

  private identifyImprovementAreas(habit: any): string[] {
    const areas = [];

    if (habit.currentStreak < 3) {
      areas.push('Build consistency');
    }
    if (habit.growthStage < 50) {
      areas.push('Focus on progress');
    }
    if (habit.healthPoints < 70) {
      areas.push('Improve habit health');
    }
    if (habit.waterLevel < 70) {
      areas.push('Increase engagement');
    }

    return areas;
  }

  private assessHabitPotential(habit: any): string {
    if (habit.currentStreak >= 7) return 'high';
    if (habit.currentStreak >= 3) return 'medium';
    return 'developing';
  }

  private suggestNextSteps(habit: any): string[] {
    const steps = [];

    if (habit.currentStreak < 3) {
      steps.push('Focus on completing this habit for the next 3 days');
    }
    if (habit.growthStage < 50) {
      steps.push('Set a small daily goal to build momentum');
    }
    if (habit.healthPoints < 70) {
      steps.push('Reflect on what makes this habit sustainable for you');
    }

    return steps;
  }

  private generateEncouragement(habit: any): string {
    if (habit.currentStreak > 0) {
      return `You're on a ${habit.currentStreak}-day streak! That's ${habit.currentStreak} days of positive change. Keep going! 🌟`;
    }

    return 'Every new beginning is a chance to grow. Today is the perfect day to start nurturing this habit! 🌱';
  }

  private calculateWeeklyStats(habits: any[]): any {
    const totalHabits = habits.length;
    const activeHabits = habits.filter((h) => h.isActive).length;
    const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
    const averageGrowth =
      habits.length > 0
        ? habits.reduce((sum, h) => sum + h.growthStage, 0) / habits.length
        : 0;

    return {
      totalHabits,
      activeHabits,
      totalStreak,
      averageGrowth: Math.round(averageGrowth),
      weekProgress: this.calculateWeekProgress(habits),
    };
  }

  private calculateWeekProgress(habits: any[]): any {
    // This would typically calculate progress over the last 7 days
    // For now, returning basic stats
    return {
      daysTracked: 7,
      habitsCompleted: habits.length,
      consistencyRate: habits.length > 0 ? 85 : 0, // Mock data
    };
  }

  private identifyAchievements(habits: any[]): string[] {
    const achievements = [];

    habits.forEach((habit) => {
      if (habit.currentStreak >= 7) {
        achievements.push(`7-day streak with ${habit.title}! 🎉`);
      }
      if (habit.growthStage >= 80) {
        achievements.push(`${habit.title} is blooming beautifully! 🌸`);
      }
      if (habit.currentStreak > habit.longestStreak) {
        achievements.push(`New personal best streak with ${habit.title}! 🏆`);
      }
    });

    if (achievements.length === 0) {
      achievements.push('Getting started is an achievement in itself! 🌱');
    }

    return achievements;
  }

  private suggestNextWeekGoals(habits: any[]): string[] {
    const goals = [];

    if (habits.length === 0) {
      goals.push('Plant your first habit');
      goals.push('Set a daily reminder');
    } else {
      goals.push('Maintain current streaks');
      goals.push('Focus on one habit that needs attention');
      if (habits.length < 3) {
        goals.push('Consider adding a complementary habit');
      }
    }

    return goals;
  }

  // Fallback methods when OpenAI is not available
  private getFallbackInsights(habits: any[]): any {
    return {
      insights: {
        summary:
          'Your AI Gardener is taking a break, but here are some general insights for your habit garden!',
        keyPoints: [
          'Consistency is the key to habit growth',
          'Small daily actions compound into big results',
          'Every habit is like a seed - nurture it daily',
        ],
      },
      gardenMood: this.calculateGardenMood(habits),
      recommendations: this.generateRecommendations(habits),
      motivation: this.generateMotivation(habits),
      timestamp: new Date(),
    };
  }

  private getFallbackHabitCoaching(habit: any): any {
    if (!habit) {
      return {
        coaching: {
          advice: 'Start with a simple, achievable habit',
          keyTips: [],
        },
        habitAnalysis: {
          status: 'new',
          strength: 0,
          areas: [],
          potential: 'developing',
        },
        nextSteps: ['Choose a habit', 'Set a daily reminder', 'Track progress'],
        encouragement: 'Every journey begins with a single step! 🌱',
        timestamp: new Date(),
      };
    }

    return {
      coaching: {
        advice: 'Focus on consistency and small improvements',
        keyTips: [],
      },
      habitAnalysis: this.analyzeHabit(habit),
      nextSteps: this.suggestNextSteps(habit),
      encouragement: this.generateEncouragement(habit),
      timestamp: new Date(),
    };
  }

  private getFallbackWeeklyReport(habits: any[]): any {
    return {
      report: {
        content: 'Weekly progress report - keep up the great work!',
        sections: [
          'Progress Summary',
          'Areas for Improvement',
          'Next Week Goals',
        ],
      },
      weeklyStats: this.calculateWeeklyStats(habits),
      achievements: this.identifyAchievements(habits),
      nextWeekGoals: this.suggestNextWeekGoals(habits),
      timestamp: new Date(),
    };
  }
}
