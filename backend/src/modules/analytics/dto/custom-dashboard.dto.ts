import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsArray,
  IsBoolean,
  IsObject,
} from 'class-validator';

export enum WidgetType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  METRIC_CARD = 'metric_card',
  PROGRESS_BAR = 'progress_bar',
  HEATMAP = 'heatmap',
  TABLE = 'table',
  GAUGE = 'gauge',
  SCATTER_PLOT = 'scatter_plot',
  TIMELINE = 'timeline',
}

export enum DataSource {
  HABIT_COMPLETION = 'habit_completion',
  HABIT_STREAKS = 'habit_streaks',
  SUCCESS_RATES = 'success_rates',
  CORRELATIONS = 'correlations',
  PREDICTIONS = 'predictions',
  GOAL_PROGRESS = 'goal_progress',
  TIME_ANALYSIS = 'time_analysis',
  PERFORMANCE_METRICS = 'performance_metrics',
}

export enum TimeRange {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export class DashboardWidgetDto {
  @ApiProperty({
    description: 'Unique identifier for the widget',
    example: 'widget_001',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Type of widget to display',
    enum: WidgetType,
    example: WidgetType.LINE_CHART,
  })
  @IsEnum(WidgetType)
  type: WidgetType;

  @ApiProperty({
    description: 'Title of the widget',
    example: 'Habit Success Rate',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Data source for the widget',
    enum: DataSource,
    example: DataSource.SUCCESS_RATES,
  })
  @IsEnum(DataSource)
  dataSource: DataSource;

  @ApiProperty({
    description: 'Time range for data',
    enum: TimeRange,
    example: TimeRange.MONTH,
  })
  @IsEnum(TimeRange)
  timeRange: TimeRange;

  @ApiPropertyOptional({
    description: 'Custom start date (ISO string)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  customStartDate?: string;

  @ApiPropertyOptional({
    description: 'Custom end date (ISO string)',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  customEndDate?: string;

  @ApiPropertyOptional({
    description: 'Specific habit IDs to include',
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  habitIds?: number[];

  @ApiPropertyOptional({
    description: 'Widget configuration options',
    example: { showLegend: true, colorScheme: 'viridis', maxDataPoints: 100 },
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiProperty({
    description: 'Position X coordinate on dashboard',
    example: 0,
  })
  @IsNumber()
  positionX: number;

  @ApiProperty({
    description: 'Position Y coordinate on dashboard',
    example: 0,
  })
  @IsNumber()
  positionY: number;

  @ApiProperty({
    description: 'Widget width in grid units',
    example: 6,
  })
  @IsNumber()
  width: number;

  @ApiProperty({
    description: 'Widget height in grid units',
    example: 4,
  })
  @IsNumber()
  height: number;

  @ApiProperty({
    description: 'Whether the widget is visible',
    example: true,
  })
  @IsBoolean()
  isVisible: boolean;

  @ApiPropertyOptional({
    description: 'Refresh interval in seconds (0 for manual refresh)',
    example: 300,
  })
  @IsOptional()
  @IsNumber()
  refreshInterval?: number;
}

export class CustomDashboardDto {
  @ApiProperty({
    description: 'Unique identifier for the dashboard',
    example: 'dashboard_001',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Name of the dashboard',
    example: 'My Fitness Dashboard',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the dashboard',
    example: 'Track my fitness habits and progress',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Whether this is the default dashboard',
    example: false,
  })
  @IsBoolean()
  isDefault: boolean;

  @ApiProperty({
    description: 'Grid layout configuration',
    example: { columns: 12, rows: 8, cellSize: 50 },
  })
  @IsObject()
  gridConfig: {
    columns: number;
    rows: number;
    cellSize: number;
  };

  @ApiProperty({
    description: 'List of widgets in the dashboard',
    type: [DashboardWidgetDto],
  })
  @IsArray()
  widgets: DashboardWidgetDto[];

  @ApiProperty({
    description: 'Dashboard theme',
    example: 'light',
  })
  @IsString()
  theme: string;

  @ApiProperty({
    description: 'Date when dashboard was created',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  createdAt: string;

  @ApiProperty({
    description: 'Date when dashboard was last updated',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  updatedAt: string;
}

export class CreateDashboardDto {
  @ApiProperty({
    description: 'Name of the dashboard',
    example: 'My Fitness Dashboard',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the dashboard',
    example: 'Track my fitness habits and progress',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this should be the default dashboard',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Grid layout configuration',
    example: { columns: 12, rows: 8, cellSize: 50 },
  })
  @IsOptional()
  @IsObject()
  gridConfig?: {
    columns: number;
    rows: number;
    cellSize: number;
  };

  @ApiPropertyOptional({
    description: 'Initial widgets to add',
    type: [DashboardWidgetDto],
  })
  @IsOptional()
  @IsArray()
  widgets?: DashboardWidgetDto[];
}

export class UpdateDashboardDto {
  @ApiPropertyOptional({
    description: 'Name of the dashboard',
    example: 'My Updated Fitness Dashboard',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the dashboard',
    example: 'Updated description for my fitness tracking',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this should be the default dashboard',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Grid layout configuration',
    example: { columns: 12, rows: 8, cellSize: 50 },
  })
  @IsOptional()
  @IsObject()
  gridConfig?: {
    columns: number;
    rows: number;
    cellSize: number;
  };

  @ApiPropertyOptional({
    description: 'Updated widgets configuration',
    type: [DashboardWidgetDto],
  })
  @IsOptional()
  @IsArray()
  widgets?: DashboardWidgetDto[];
}
