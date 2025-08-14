import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { LogHabitDto } from './dto/log-habit.dto';
import { HabitAnalyticsDto } from './dto/habit-analytics.dto';
import { GardenStatsDto } from './dto/garden-stats.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Habits')
@Controller('habits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new habit' })
  @ApiResponse({ status: 201, description: 'Habit created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createHabitDto: CreateHabitDto, @Req() req: Request) {
    return this.habitsService.create(createHabitDto, req.user['id']);
  }

  @Get()
  @ApiOperation({ summary: 'Get all habits for the current user' })
  @ApiResponse({ status: 200, description: 'Habits retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Req() req: Request) {
    return this.habitsService.findAll(req.user['id']);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific habit by ID' })
  @ApiResponse({ status: 200, description: 'Habit retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.habitsService.findOne(+id, req.user['id']);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a habit' })
  @ApiResponse({ status: 200, description: 'Habit updated successfully' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
    @Req() req: Request
  ) {
    return this.habitsService.update(+id, updateHabitDto, req.user['id']);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a habit' })
  @ApiResponse({ status: 200, description: 'Habit deleted successfully' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.habitsService.remove(+id, req.user['id']);
  }

  // Habit Logging endpoints
  @Post('log')
  @ApiOperation({ summary: 'Log habit completion for a specific date' })
  @ApiResponse({ status: 201, description: 'Habit logged successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  logHabit(@Body() logHabitDto: LogHabitDto, @Req() req: Request) {
    return this.habitsService.logHabit(logHabitDto, req.user['id']);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get habit logs for a specific habit' })
  @ApiResponse({
    status: 200,
    description: 'Habit logs retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date (YYYY-MM-DD)',
  })
  getHabitLogs(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req: Request
  ) {
    return this.habitsService.getHabitLogs(
      +id,
      req.user['id'],
      startDate,
      endDate
    );
  }

  @Get('logs/today')
  @ApiOperation({ summary: 'Get all habit logs for today' })
  @ApiResponse({
    status: 200,
    description: "Today's logs retrieved successfully",
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTodayLogs(@Req() req: Request) {
    return this.habitsService.getTodayLogs(req.user['id']);
  }

  // Analytics endpoints
  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get detailed analytics for a specific habit' })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
    type: HabitAnalyticsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  getHabitAnalytics(@Param('id') id: string, @Req() req: Request) {
    return this.habitsService.getHabitAnalytics(+id, req.user['id']);
  }

  @Get('garden/stats')
  @ApiOperation({
    summary: 'Get overall garden statistics for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Garden stats retrieved successfully',
    type: GardenStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getGardenStats(@Req() req: Request) {
    return this.habitsService.getGardenStats(req.user['id']);
  }
}
