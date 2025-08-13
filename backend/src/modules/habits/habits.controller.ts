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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
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
  @ApiResponse({ status: 201, description: 'Habit successfully created' })
  create(@Body() createHabitDto: CreateHabitDto, @Req() req: Request) {
    return this.habitsService.create(createHabitDto, req.user['id']);
  }

  @Get()
  @ApiOperation({ summary: 'Get all habits for current user' })
  @ApiResponse({ status: 200, description: 'List of user habits' })
  findAll(@Req() req: Request) {
    return this.habitsService.findAll(req.user['id']);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get habit by ID' })
  @ApiResponse({ status: 200, description: 'Habit found' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.habitsService.findOne(+id, req.user['id']);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update habit by ID' })
  @ApiResponse({ status: 200, description: 'Habit updated successfully' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  update(
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
    @Req() req: Request
  ) {
    return this.habitsService.update(+id, updateHabitDto, req.user['id']);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete habit by ID' })
  @ApiResponse({ status: 200, description: 'Habit deleted successfully' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.habitsService.remove(+id, req.user['id']);
  }
}
