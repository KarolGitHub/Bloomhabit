import { ApiProperty } from '@nestjs/swagger';

export class HabitStreakDto {
  @ApiProperty({ description: 'Current streak count' })
  currentStreak: number;

  @ApiProperty({ description: 'Longest streak achieved' })
  longestStreak: number;

  @ApiProperty({ description: 'Date when the streak started' })
  streakStartDate: Date;

  @ApiProperty({ description: 'Date when the streak ended (if broken)' })
  streakEndDate?: Date;
}

export class HabitProgressDto {
  @ApiProperty({ description: 'Total days tracked' })
  totalDays: number;

  @ApiProperty({ description: 'Days completed successfully' })
  completedDays: number;

  @ApiProperty({ description: 'Days partially completed' })
  partialDays: number;

  @ApiProperty({ description: 'Days missed' })
  missedDays: number;

  @ApiProperty({ description: 'Days skipped' })
  skippedDays: number;

  @ApiProperty({ description: 'Overall completion rate (0-100)' })
  completionRate: number;
}

export class HabitAnalyticsDto {
  @ApiProperty({ description: 'Habit ID' })
  habitId: number;

  @ApiProperty({ description: 'Habit title' })
  habitTitle: string;

  @ApiProperty({ description: 'Overall progress statistics' })
  progress: HabitProgressDto;

  @ApiProperty({ description: 'Streak information' })
  streak: HabitStreakDto;

  @ApiProperty({ description: 'Weekly progress for the last 4 weeks' })
  weeklyProgress: {
    week: string;
    completedDays: number;
    totalDays: number;
    completionRate: number;
  }[];

  @ApiProperty({ description: 'Monthly progress for the last 6 months' })
  monthlyProgress: {
    month: string;
    completedDays: number;
    totalDays: number;
    completionRate: number;
  }[];

  @ApiProperty({ description: 'Best performing day of the week' })
  bestDayOfWeek: string;

  @ApiProperty({ description: 'Worst performing day of the week' })
  worstDayOfWeek: string;

  @ApiProperty({ description: 'Average completion rate on best day' })
  bestDayRate: number;

  @ApiProperty({ description: 'Average completion rate on worst day' })
  worstDayRate: number;
}

