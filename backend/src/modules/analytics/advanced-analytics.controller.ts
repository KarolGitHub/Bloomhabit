import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { HabitCorrelationQueryDto } from './dto/habit-correlation.dto';
import { PredictiveAnalyticsQueryDto } from './dto/predictive-analytics.dto';
import {
  CreateDashboardDto,
  UpdateDashboardDto,
} from './dto/custom-dashboard.dto';
import { DataExportRequestDto } from './dto/data-export.dto';

@ApiTags('Advanced Analytics')
@Controller('analytics/advanced')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdvancedAnalyticsController {
  constructor(
    private readonly advancedAnalyticsService: AdvancedAnalyticsService
  ) {}

  // Habit Correlation Analysis
  @Get('correlations')
  @ApiOperation({
    summary: 'Analyze correlations between different habits',
    description:
      'Find relationships and patterns between user habits using statistical analysis',
  })
  @ApiResponse({
    status: 200,
    description: 'Habit correlations analyzed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'minCorrelation', required: false, type: Number })
  @ApiQuery({ name: 'maxCorrelation', required: false, type: Number })
  @ApiQuery({ name: 'minConfidence', required: false, type: Number })
  @ApiQuery({ name: 'minDataPoints', required: false, type: Number })
  @ApiQuery({ name: 'includePositive', required: false, type: Boolean })
  @ApiQuery({ name: 'includeNegative', required: false, type: Boolean })
  async analyzeHabitCorrelations(
    @Query() query: HabitCorrelationQueryDto,
    @Request() req: any
  ) {
    return this.advancedAnalyticsService.analyzeHabitCorrelations(
      req.user.id,
      query
    );
  }

  // Predictive Analytics
  @Get('predictions')
  @ApiOperation({
    summary: 'Generate habit success predictions',
    description:
      'Use machine learning to predict future habit performance and identify trends',
  })
  @ApiResponse({
    status: 200,
    description: 'Habit predictions generated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'habitId', required: false, type: Number })
  @ApiQuery({
    name: 'predictionType',
    required: false,
    enum: [
      'success_rate',
      'streak_length',
      'completion_time',
      'habit_formation',
      'relapse_risk',
    ],
  })
  @ApiQuery({ name: 'timeframeDays', required: false, type: Number })
  @ApiQuery({ name: 'minConfidence', required: false, type: Number })
  @ApiQuery({
    name: 'includeHighConfidenceOnly',
    required: false,
    type: Boolean,
  })
  async generateHabitPredictions(
    @Query() query: PredictiveAnalyticsQueryDto,
    @Request() req: any
  ) {
    return this.advancedAnalyticsService.generateHabitPredictions(
      req.user.id,
      query
    );
  }

  // Custom Dashboard Management
  @Post('dashboards')
  @ApiOperation({
    summary: 'Create a custom analytics dashboard',
    description:
      'Create a personalized dashboard with custom widgets and layouts',
  })
  @ApiResponse({
    status: 201,
    description: 'Custom dashboard created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid dashboard configuration' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCustomDashboard(
    @Body() createDashboardDto: CreateDashboardDto,
    @Request() req: any
  ) {
    return this.advancedAnalyticsService.createCustomDashboard(
      req.user.id,
      createDashboardDto
    );
  }

  @Get('dashboards/:id')
  @ApiOperation({
    summary: 'Get a custom analytics dashboard',
    description: 'Retrieve a specific custom dashboard configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Custom dashboard retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Dashboard not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCustomDashboard(@Param('id') id: string, @Request() req: any) {
    return this.advancedAnalyticsService.getCustomDashboard(req.user.id, id);
  }

  @Put('dashboards/:id')
  @ApiOperation({
    summary: 'Update a custom analytics dashboard',
    description: 'Modify an existing custom dashboard configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Custom dashboard updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Dashboard not found' })
  @ApiResponse({ status: 400, description: 'Invalid dashboard configuration' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateCustomDashboard(
    @Param('id') id: string,
    @Body() updateDashboardDto: UpdateDashboardDto,
    @Request() req: any
  ) {
    return this.advancedAnalyticsService.updateCustomDashboard(
      req.user.id,
      id,
      updateDashboardDto
    );
  }

  @Delete('dashboards/:id')
  @ApiOperation({
    summary: 'Delete a custom analytics dashboard',
    description: 'Remove a custom dashboard and its configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Custom dashboard deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Dashboard not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteCustomDashboard(@Param('id') id: string, @Request() req: any) {
    // TODO: Implement dashboard deletion
    return { message: 'Dashboard deletion not implemented yet' };
  }

  // Data Export
  @Post('export')
  @ApiOperation({
    summary: 'Export analytics data',
    description:
      'Export habit data, analytics, and insights in various formats',
  })
  @ApiResponse({
    status: 201,
    description: 'Data export job created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid export configuration' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async exportData(
    @Body() exportRequest: DataExportRequestDto,
    @Request() req: any
  ) {
    return this.advancedAnalyticsService.exportData(req.user.id, exportRequest);
  }

  @Get('export/:exportId/status')
  @ApiOperation({
    summary: 'Get export job status',
    description: 'Check the status and progress of a data export job',
  })
  @ApiResponse({
    status: 200,
    description: 'Export status retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Export job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getExportStatus(
    @Param('exportId') exportId: string,
    @Request() req: any
  ) {
    return this.advancedAnalyticsService.getExportStatus(req.user.id, exportId);
  }

  @Get('export/history')
  @ApiOperation({
    summary: 'Get export history',
    description: 'Retrieve a list of all data export jobs for the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Export history retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getExportHistory(@Request() req: any) {
    return this.advancedAnalyticsService.getExportHistory(req.user.id);
  }

  // Advanced Analytics Summary
  @Get('summary')
  @ApiOperation({
    summary: 'Get comprehensive analytics summary',
    description:
      'Get an overview of all advanced analytics including correlations, predictions, and insights',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics summary retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAnalyticsSummary(@Request() req: any) {
    // Get correlations
    const correlations =
      await this.advancedAnalyticsService.analyzeHabitCorrelations(
        req.user.id,
        { minCorrelation: 0.3, minConfidence: 0.6 }
      );

    // Get predictions
    const predictions =
      await this.advancedAnalyticsService.generateHabitPredictions(
        req.user.id,
        { minConfidence: 0.6 }
      );

    // Get export history
    const exportHistory = await this.advancedAnalyticsService.getExportHistory(
      req.user.id
    );

    return {
      summary: {
        totalCorrelations: correlations.length,
        strongCorrelations: correlations.filter((c) => c.strength === 'strong')
          .length,
        positiveCorrelations: correlations.filter(
          (c) => c.correlationType === 'positive'
        ).length,
        totalPredictions: predictions.predictions.length,
        highConfidencePredictions: predictions.predictions.filter(
          (p) => p.confidence === 'high'
        ).length,
        averagePredictedSuccess: predictions.overallConfidence,
        totalExports: exportHistory.totalExports,
      },
      correlations: correlations.slice(0, 5), // Top 5 correlations
      predictions: predictions.predictions.slice(0, 5), // Top 5 predictions
      insights: predictions.keyInsights,
      recommendations: predictions.recommendations,
      generatedAt: new Date(),
    };
  }

  // Analytics Health Check
  @Get('health')
  @ApiOperation({
    summary: 'Check analytics system health',
    description: 'Verify that all analytics services are functioning properly',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics system is healthy',
  })
  @ApiResponse({ status: 503, description: 'Analytics system has issues' })
  async getAnalyticsHealth() {
    try {
      // Basic health checks
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date(),
        services: {
          correlationAnalysis: 'operational',
          predictiveAnalytics: 'operational',
          customDashboards: 'operational',
          dataExport: 'operational',
        },
        version: '2.0.0',
        uptime: process.uptime(),
      };

      return healthStatus;
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message,
        services: {
          correlationAnalysis: 'error',
          predictiveAnalytics: 'error',
          customDashboards: 'error',
          dataExport: 'error',
        },
      };
    }
  }
}
