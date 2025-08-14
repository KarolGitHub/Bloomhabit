import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  GoalsService,
  GoalAnalytics,
  GoalProgressReport,
} from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateGoalProgressDto } from './dto/create-goal-progress.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Goal, GoalStatus } from './goal.entity';
import { GoalProgress } from './goal-progress.entity';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  async create(
    @Body() createGoalDto: CreateGoalDto,
    @Request() req
  ): Promise<Goal> {
    return this.goalsService.create(createGoalDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req, @Query() filters: any): Promise<Goal[]> {
    return this.goalsService.findAll(req.user.id, filters);
  }

  @Get('analytics')
  async getAnalytics(@Request() req): Promise<GoalAnalytics> {
    return this.goalsService.getGoalAnalytics(req.user.id);
  }

  @Get('progress-report')
  async getProgressReport(@Request() req): Promise<GoalProgressReport[]> {
    return this.goalsService.getProgressReport(req.user.id);
  }

  @Get('status/:status')
  async findByStatus(
    @Param('status') status: GoalStatus,
    @Request() req
  ): Promise<Goal[]> {
    return this.goalsService.findAll(req.user.id, { status });
  }

  @Get('category/:category')
  async findByCategory(
    @Param('category') category: string,
    @Request() req
  ): Promise<Goal[]> {
    return this.goalsService.findAll(req.user.id, { category });
  }

  @Get('priority/:priority')
  async findByPriority(
    @Param('priority') priority: string,
    @Request() req
  ): Promise<Goal[]> {
    return this.goalsService.findAll(req.user.id, { priority });
  }

  @Get('difficulty/:difficulty')
  async findByDifficulty(
    @Param('difficulty') difficulty: string,
    @Request() req
  ): Promise<Goal[]> {
    return this.goalsService.findAll(req.user.id, { difficulty });
  }

  @Get('tags')
  async findByTags(
    @Query('tags') tags: string,
    @Request() req
  ): Promise<Goal[]> {
    const tagArray = tags.split(',').map((tag) => tag.trim());
    return this.goalsService.findAll(req.user.id, { tags: tagArray });
  }

  @Get('search')
  async searchGoals(
    @Query('q') query: string,
    @Request() req
  ): Promise<Goal[]> {
    // For now, return all goals and filter by title/description
    // In a real implementation, you'd use full-text search
    const allGoals = await this.goalsService.findAll(req.user.id);
    return allGoals.filter(
      (goal) =>
        goal.title.toLowerCase().includes(query.toLowerCase()) ||
        (goal.description &&
          goal.description.toLowerCase().includes(query.toLowerCase()))
    );
  }

  @Get('upcoming')
  async getUpcomingGoals(@Request() req): Promise<Goal[]> {
    const allGoals = await this.goalsService.findAll(req.user.id, {
      status: GoalStatus.ACTIVE,
    });
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return allGoals.filter((goal) => {
      const targetDate = new Date(goal.targetDate);
      return targetDate >= today && targetDate <= thirtyDaysFromNow;
    });
  }

  @Get('overdue')
  async getOverdueGoals(@Request() req): Promise<Goal[]> {
    const allGoals = await this.goalsService.findAll(req.user.id, {
      status: GoalStatus.ACTIVE,
    });
    const today = new Date();

    return allGoals.filter((goal) => {
      const targetDate = new Date(goal.targetDate);
      return targetDate < today && goal.progressPercentage < 100;
    });
  }

  @Get('milestones')
  async getGoalsWithMilestones(@Request() req): Promise<Goal[]> {
    const allGoals = await this.goalsService.findAll(req.user.id);
    return allGoals.filter(
      (goal) => goal.milestones && goal.milestones.length > 0
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ): Promise<Goal> {
    return this.goalsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGoalDto: UpdateGoalDto,
    @Request() req
  ): Promise<Goal> {
    return this.goalsService.update(id, updateGoalDto, req.user.id);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ): Promise<void> {
    return this.goalsService.remove(id, req.user.id);
  }

  // Progress Management
  @Post(':id/progress')
  async addProgress(
    @Param('id', ParseIntPipe) id: number,
    @Body() createProgressDto: CreateGoalProgressDto,
    @Request() req
  ): Promise<GoalProgress> {
    // Ensure the progress is for the correct goal
    createProgressDto.goalId = id;
    return this.goalsService.addProgress(createProgressDto, req.user.id);
  }

  @Get(':id/progress')
  async getProgressHistory(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ): Promise<GoalProgress[]> {
    return this.goalsService.getProgressHistory(id, req.user.id);
  }

  // Goal Status Management
  @Post(':id/complete')
  async completeGoal(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ): Promise<Goal> {
    return this.goalsService.completeGoal(id, req.user.id);
  }

  @Post(':id/pause')
  async pauseGoal(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ): Promise<Goal> {
    return this.goalsService.pauseGoal(id, req.user.id);
  }

  @Post(':id/resume')
  async resumeGoal(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ): Promise<Goal> {
    return this.goalsService.resumeGoal(id, req.user.id);
  }

  // Goal Templates and Suggestions
  @Get('templates/category/:category')
  async getGoalTemplates(@Param('category') category: string): Promise<any[]> {
    // Return predefined goal templates for the category
    const templates = {
      fitness: [
        {
          title: 'Run a 5K Race',
          description: 'Complete a 5-kilometer running race',
          type: 'numeric',
          difficulty: 'medium',
          category: 'fitness',
          specific: 'Complete a 5K race in under 30 minutes',
          measurable: 'Track running distance and time',
          achievable: 'Start with 1-mile runs and gradually increase',
          relevant: 'Improve cardiovascular health and endurance',
          timeBound: 'Complete within 3 months',
          targetValue: 5,
          milestones: [
            {
              title: 'First Mile',
              description: 'Run 1 mile without stopping',
              targetValue: 1,
            },
            {
              title: 'Three Miles',
              description: 'Run 3 miles comfortably',
              targetValue: 3,
            },
          ],
        },
        {
          title: 'Build Muscle Mass',
          description: 'Gain 10 pounds of muscle through strength training',
          type: 'numeric',
          difficulty: 'hard',
          category: 'fitness',
          specific: 'Gain 10 pounds of lean muscle mass',
          measurable: 'Track weight and body composition',
          achievable: 'Follow structured strength training program',
          relevant: 'Improve strength and physical appearance',
          timeBound: 'Achieve within 6 months',
          targetValue: 10,
          milestones: [
            {
              title: 'First 5 Pounds',
              description: 'Gain initial muscle mass',
              targetValue: 5,
            },
            {
              title: 'Strength Gains',
              description: 'Increase bench press by 20%',
              targetValue: 8,
            },
          ],
        },
      ],
      learning: [
        {
          title: 'Learn a New Language',
          description: 'Achieve conversational fluency in a new language',
          type: 'milestone',
          difficulty: 'hard',
          category: 'learning',
          specific: 'Speak conversational Spanish fluently',
          measurable: 'Complete language proficiency tests',
          achievable: 'Practice daily with apps and conversation partners',
          relevant: 'Enhance communication skills and cultural understanding',
          timeBound: 'Achieve within 12 months',
          milestones: [
            {
              title: 'Basic Phrases',
              description: 'Learn 100 common phrases',
              targetValue: 100,
            },
            {
              title: 'Conversational',
              description: 'Hold 15-minute conversations',
              targetValue: 15,
            },
            {
              title: 'Fluency',
              description: 'Speak naturally without translation',
              targetValue: 1,
            },
          ],
        },
      ],
      productivity: [
        {
          title: 'Read 24 Books This Year',
          description: 'Read 24 books across various genres',
          type: 'numeric',
          difficulty: 'medium',
          category: 'productivity',
          specific: 'Read 24 books in 12 months',
          measurable: 'Track books completed and pages read',
          achievable: 'Read 2 books per month',
          relevant: 'Expand knowledge and improve reading skills',
          timeBound: 'Complete within 12 months',
          targetValue: 24,
          milestones: [
            {
              title: 'Quarter 1',
              description: 'Complete 6 books',
              targetValue: 6,
            },
            {
              title: 'Quarter 2',
              description: 'Complete 12 books',
              targetValue: 12,
            },
            {
              title: 'Quarter 3',
              description: 'Complete 18 books',
              targetValue: 18,
            },
          ],
        },
      ],
    };

    return templates[category] || [];
  }

  @Get('suggestions')
  async getGoalSuggestions(@Request() req): Promise<any[]> {
    // Return personalized goal suggestions based on user's habits and preferences
    // This would typically integrate with AI service for personalized recommendations
    return [
      {
        title: 'Morning Routine Mastery',
        description: 'Establish a consistent morning routine',
        category: 'productivity',
        difficulty: 'medium',
        estimatedTime: '30 days',
      },
      {
        title: 'Digital Detox',
        description: 'Reduce screen time and improve focus',
        category: 'wellness',
        difficulty: 'easy',
        estimatedTime: '21 days',
      },
      {
        title: 'Home Organization',
        description: 'Declutter and organize living spaces',
        category: 'lifestyle',
        difficulty: 'medium',
        estimatedTime: '14 days',
      },
    ];
  }
}
