import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('AI Gardener')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('garden-insights')
  @ApiOperation({ summary: 'Get AI-powered garden insights' })
  @ApiResponse({
    status: 200,
    description: 'Garden insights and recommendations',
    schema: {
      type: 'object',
      properties: {
        insights: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            keyPoints: { type: 'array', items: { type: 'string' } },
          },
        },
        gardenMood: { type: 'string' },
        recommendations: { type: 'array', items: { type: 'string' } },
        motivation: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getGardenInsights(@Req() req: Request) {
    return this.aiService.getGardenInsights(req.user['id']);
  }

  @Get('habit-coaching/:habitId')
  @ApiOperation({ summary: 'Get AI coaching for a specific habit' })
  @ApiResponse({
    status: 200,
    description: 'Habit-specific coaching and analysis',
    schema: {
      type: 'object',
      properties: {
        coaching: {
          type: 'object',
          properties: {
            advice: { type: 'string' },
            keyTips: { type: 'array', items: { type: 'string' } },
          },
        },
        habitAnalysis: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            strength: { type: 'number' },
            areas: { type: 'array', items: { type: 'string' } },
            potential: { type: 'string' },
          },
        },
        nextSteps: { type: 'array', items: { type: 'string' } },
        encouragement: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getHabitCoaching(
    @Param('habitId') habitId: string,
    @Req() req: Request
  ) {
    return this.aiService.getHabitCoaching(+habitId, req.user['id']);
  }

  @Get('weekly-report')
  @ApiOperation({ summary: 'Get AI-generated weekly progress report' })
  @ApiResponse({
    status: 200,
    description: 'Weekly progress report and analysis',
    schema: {
      type: 'object',
      properties: {
        report: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            sections: { type: 'array', items: { type: 'string' } },
          },
        },
        weeklyStats: {
          type: 'object',
          properties: {
            totalHabits: { type: 'number' },
            activeHabits: { type: 'number' },
            totalStreak: { type: 'number' },
            averageGrowth: { type: 'number' },
          },
        },
        achievements: { type: 'array', items: { type: 'string' } },
        nextWeekGoals: { type: 'array', items: { type: 'string' } },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getWeeklyReport(@Req() req: Request) {
    return this.aiService.getWeeklyReport(req.user['id']);
  }
}
