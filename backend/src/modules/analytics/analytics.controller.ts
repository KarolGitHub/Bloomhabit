import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('habits/:id')
  @ApiOperation({ summary: 'Get detailed analytics for a specific habit' })
  @ApiResponse({
    status: 200,
    description: 'Habit analytics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  async getHabitAnalytics(@Param('id') id: string, @Request() req: any) {
    return this.analyticsService.getHabitAnalytics(req.user.id, +id);
  }

  @Get('progress/:period')
  @ApiOperation({ summary: 'Get progress report for a specific period' })
  @ApiResponse({
    status: 200,
    description: 'Progress report retrieved successfully',
  })
  async getProgressReport(
    @Param('period') period: 'week' | 'month' | 'quarter' | 'year',
    @Request() req: any
  ) {
    return this.analyticsService.getProgressReport(req.user.id, period);
  }

  @Get('trends/:period')
  @ApiOperation({ summary: 'Get trend analysis for a specific period' })
  @ApiResponse({
    status: 200,
    description: 'Trend analysis retrieved successfully',
  })
  async getTrendAnalysis(@Param('period') period: string, @Request() req: any) {
    return this.analyticsService.getTrendAnalysis(req.user.id, period);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get overall performance metrics' })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics retrieved successfully',
  })
  async getPerformanceMetrics(@Request() req: any) {
    return this.analyticsService.getPerformanceMetrics(req.user.id);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get comprehensive analytics dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getAnalyticsDashboard(@Request() req: any) {
    const [weeklyReport, monthlyReport, performanceMetrics] = await Promise.all(
      [
        this.analyticsService.getProgressReport(req.user.id, 'week'),
        this.analyticsService.getProgressReport(req.user.id, 'month'),
        this.analyticsService.getPerformanceMetrics(req.user.id),
      ]
    );

    return {
      weeklyReport,
      monthlyReport,
      performanceMetrics,
      summary: {
        totalHabits: weeklyReport.totalHabits,
        activeHabits: weeklyReport.activeHabits,
        weeklySuccessRate: weeklyReport.overallSuccessRate,
        monthlySuccessRate: monthlyReport.overallSuccessRate,
        overallScore: performanceMetrics.overallScore,
        category: performanceMetrics.category,
      },
    };
  }
}
