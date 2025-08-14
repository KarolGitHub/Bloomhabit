import { ApiProperty } from '@nestjs/swagger';

export class GardenMoodDto {
  @ApiProperty({ description: 'Overall garden mood score (0-100)' })
  moodScore: number;

  @ApiProperty({
    description: 'Garden mood level (excellent, good, fair, needs-care)',
  })
  moodLevel: string;

  @ApiProperty({ description: 'Emoji representation of garden mood' })
  moodEmoji: string;

  @ApiProperty({ description: 'Description of the garden mood' })
  moodDescription: string;
}

export class GardenStatsDto {
  @ApiProperty({ description: 'Total number of active habits' })
  totalHabits: number;

  @ApiProperty({ description: 'Number of habits completed today' })
  completedToday: number;

  @ApiProperty({ description: 'Number of habits partially completed today' })
  partialToday: number;

  @ApiProperty({ description: 'Number of habits missed today' })
  missedToday: number;

  @ApiProperty({ description: 'Overall completion rate for today (0-100)' })
  todayCompletionRate: number;

  @ApiProperty({ description: 'Current week completion rate (0-100)' })
  weekCompletionRate: number;

  @ApiProperty({ description: 'Current month completion rate (0-100)' })
  monthCompletionRate: number;

  @ApiProperty({ description: 'Total active streak across all habits' })
  totalActiveStreak: number;

  @ApiProperty({ description: 'Longest streak ever achieved' })
  longestStreakEver: number;

  @ApiProperty({ description: 'Garden mood information' })
  gardenMood: GardenMoodDto;

  @ApiProperty({ description: 'Habits by category with completion rates' })
  habitsByCategory: {
    category: string;
    count: number;
    completionRate: number;
    totalStreak: number;
  }[];

  @ApiProperty({ description: 'Top performing habits (by completion rate)' })
  topHabits: {
    habitId: number;
    title: string;
    completionRate: number;
    currentStreak: number;
    flowerType: string;
  }[];

  @ApiProperty({
    description: 'Habits needing attention (low completion rate)',
  })
  needsAttention: {
    habitId: number;
    title: string;
    completionRate: number;
    daysSinceLastCompleted: number;
    flowerType: string;
  }[];

  @ApiProperty({ description: 'Weekly progress trend (last 4 weeks)' })
  weeklyTrend: {
    week: string;
    completionRate: number;
    totalHabits: number;
    completedHabits: number;
  }[];

  @ApiProperty({ description: 'Monthly progress trend (last 6 months)' })
  monthlyTrend: {
    month: string;
    completionRate: number;
    totalHabits: number;
    completedHabits: number;
  }[];
}

