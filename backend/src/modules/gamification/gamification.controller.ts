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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GamificationService } from './gamification.service';
import {
  CreateAchievementDto,
  UpdateAchievementDto,
  AchievementDto,
  UserAchievementDto,
} from './dto/achievement.dto';
import {
  CreateLeaderboardDto,
  UpdateLeaderboardDto,
  LeaderboardDto,
  LeaderboardEntryDto,
} from './dto/leaderboard.dto';
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  ChallengeDto,
  UserChallengeDto,
} from './dto/challenge.dto';

@ApiTags('Gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  // ==================== ACHIEVEMENTS ====================

  @Post('achievements')
  @ApiOperation({
    summary: 'Create a new achievement',
    description: 'Create a new achievement that users can earn',
  })
  @ApiResponse({
    status: 201,
    description: 'Achievement created successfully',
    type: AchievementDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid achievement data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAchievement(
    @Body() createAchievementDto: CreateAchievementDto
  ): Promise<AchievementDto> {
    return this.gamificationService.createAchievement(createAchievementDto);
  }

  @Get('achievements')
  @ApiOperation({
    summary: 'Get all achievements',
    description: 'Retrieve a list of all available achievements',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievements retrieved successfully',
    type: [AchievementDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by achievement type',
  })
  @ApiQuery({
    name: 'tier',
    required: false,
    description: 'Filter by achievement tier',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of achievements to return',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of achievements to skip',
  })
  async getAchievements(
    @Query('type') type?: string,
    @Query('tier') tier?: string,
    @Query('isActive') isActive?: boolean,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ): Promise<AchievementDto[]> {
    return this.gamificationService.getAchievements(
      type,
      tier,
      isActive,
      limit,
      offset
    );
  }

  @Get('achievements/:id')
  @ApiOperation({
    summary: 'Get achievement by ID',
    description: 'Retrieve a specific achievement by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievement retrieved successfully',
    type: AchievementDto,
  })
  @ApiResponse({ status: 404, description: 'Achievement not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Achievement ID' })
  async getAchievement(
    @Param('id', ParseIntPipe) id: number
  ): Promise<AchievementDto> {
    return this.gamificationService.getAchievement(id);
  }

  @Put('achievements/:id')
  @ApiOperation({
    summary: 'Update achievement',
    description: 'Update an existing achievement',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievement updated successfully',
    type: AchievementDto,
  })
  @ApiResponse({ status: 404, description: 'Achievement not found' })
  @ApiResponse({ status: 400, description: 'Invalid achievement data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Achievement ID' })
  async updateAchievement(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAchievementDto: UpdateAchievementDto
  ): Promise<AchievementDto> {
    return this.gamificationService.updateAchievement(id, updateAchievementDto);
  }

  @Get('achievements/user/me')
  @ApiOperation({
    summary: 'Get user achievements',
    description: 'Retrieve all achievements earned by the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'User achievements retrieved successfully',
    type: [UserAchievementDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserAchievements(
    @Request() req: any
  ): Promise<UserAchievementDto[]> {
    return this.gamificationService.getUserAchievements(req.user.id);
  }

  @Post('achievements/check')
  @ApiOperation({
    summary: 'Check and award achievements',
    description:
      'Check if the current user has earned any new achievements and award them',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievements checked successfully',
    type: [UserAchievementDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkAndAwardAchievements(
    @Request() req: any
  ): Promise<UserAchievementDto[]> {
    return this.gamificationService.checkAndAwardAchievements(req.user.id);
  }

  // ==================== LEADERBOARDS ====================

  @Post('leaderboards')
  @ApiOperation({
    summary: 'Create a new leaderboard',
    description: 'Create a new leaderboard for competition',
  })
  @ApiResponse({
    status: 201,
    description: 'Leaderboard created successfully',
    type: LeaderboardDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid leaderboard data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createLeaderboard(
    @Body() createLeaderboardDto: CreateLeaderboardDto
  ): Promise<LeaderboardDto> {
    return this.gamificationService.createLeaderboard(createLeaderboardDto);
  }

  @Get('leaderboards')
  @ApiOperation({
    summary: 'Get all leaderboards',
    description: 'Retrieve a list of all available leaderboards',
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboards retrieved successfully',
    type: [LeaderboardDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by leaderboard type',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of leaderboards to return',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of leaderboards to skip',
  })
  async getLeaderboards(
    @Query('type') type?: string,
    @Query('isActive') isActive?: boolean,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0
  ): Promise<LeaderboardDto[]> {
    return this.gamificationService.getLeaderboards(
      type,
      isActive,
      limit,
      offset
    );
  }

  @Get('leaderboards/:id')
  @ApiOperation({
    summary: 'Get leaderboard by ID',
    description: 'Retrieve a specific leaderboard by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
    type: LeaderboardDto,
  })
  @ApiResponse({ status: 404, description: 'Leaderboard not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Leaderboard ID' })
  async getLeaderboard(
    @Param('id', ParseIntPipe) id: number
  ): Promise<LeaderboardDto> {
    return this.gamificationService.getLeaderboard(id);
  }

  @Put('leaderboards/:id')
  @ApiOperation({
    summary: 'Update leaderboard',
    description: 'Update an existing leaderboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard updated successfully',
    type: LeaderboardDto,
  })
  @ApiResponse({ status: 404, description: 'Leaderboard not found' })
  @ApiResponse({ status: 400, description: 'Invalid leaderboard data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Leaderboard ID' })
  async updateLeaderboard(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeaderboardDto: UpdateLeaderboardDto
  ): Promise<LeaderboardDto> {
    return this.gamificationService.updateLeaderboard(id, updateLeaderboardDto);
  }

  @Get('leaderboards/:id/entries')
  @ApiOperation({
    summary: 'Get leaderboard entries',
    description: 'Retrieve entries for a specific leaderboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard entries retrieved successfully',
    type: [LeaderboardEntryDto],
  })
  @ApiResponse({ status: 404, description: 'Leaderboard not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Leaderboard ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of entries to return',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of entries to skip',
  })
  async getLeaderboardEntries(
    @Param('id', ParseIntPipe) leaderboardId: number,
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0
  ): Promise<LeaderboardEntryDto[]> {
    return this.gamificationService.getLeaderboardEntries(
      leaderboardId,
      limit,
      offset
    );
  }

  @Post('leaderboards/:id/score')
  @ApiOperation({
    summary: 'Update leaderboard score',
    description: 'Update or create a user score for a leaderboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Score updated successfully',
    type: LeaderboardEntryDto,
  })
  @ApiResponse({ status: 404, description: 'Leaderboard not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Leaderboard ID' })
  async updateLeaderboardScore(
    @Param('id', ParseIntPipe) leaderboardId: number,
    @Body() body: { score: number; metadata?: any },
    @Request() req: any
  ): Promise<LeaderboardEntryDto> {
    return this.gamificationService.updateLeaderboardScore(
      leaderboardId,
      req.user.id,
      body.score,
      body.metadata
    );
  }

  // ==================== CHALLENGES ====================

  @Post('challenges')
  @ApiOperation({
    summary: 'Create a new challenge',
    description: 'Create a new challenge for users to participate in',
  })
  @ApiResponse({
    status: 201,
    description: 'Challenge created successfully',
    type: ChallengeDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid challenge data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createChallenge(
    @Body() createChallengeDto: CreateChallengeDto
  ): Promise<ChallengeDto> {
    return this.gamificationService.createChallenge(createChallengeDto);
  }

  @Get('challenges')
  @ApiOperation({
    summary: 'Get all challenges',
    description: 'Retrieve a list of all available challenges',
  })
  @ApiResponse({
    status: 200,
    description: 'Challenges retrieved successfully',
    type: [ChallengeDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by challenge type',
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    description: 'Filter by challenge difficulty',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by challenge status',
  })
  @ApiQuery({
    name: 'isPublic',
    required: false,
    description: 'Filter by public status',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of challenges to return',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of challenges to skip',
  })
  async getChallenges(
    @Query('type') type?: string,
    @Query('difficulty') difficulty?: string,
    @Query('status') status?: string,
    @Query('isPublic') isPublic?: boolean,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0
  ): Promise<ChallengeDto[]> {
    return this.gamificationService.getChallenges(
      type,
      difficulty,
      status,
      isPublic,
      limit,
      offset
    );
  }

  @Get('challenges/:id')
  @ApiOperation({
    summary: 'Get challenge by ID',
    description: 'Retrieve a specific challenge by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Challenge retrieved successfully',
    type: ChallengeDto,
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  async getChallenge(
    @Param('id', ParseIntPipe) id: number
  ): Promise<ChallengeDto> {
    return this.gamificationService.getChallenge(id);
  }

  @Put('challenges/:id')
  @ApiOperation({
    summary: 'Update challenge',
    description: 'Update an existing challenge',
  })
  @ApiResponse({
    status: 200,
    description: 'Challenge updated successfully',
    type: ChallengeDto,
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @ApiResponse({ status: 400, description: 'Invalid challenge data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  async updateChallenge(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChallengeDto: UpdateChallengeDto
  ): Promise<ChallengeDto> {
    return this.gamificationService.updateChallenge(id, updateChallengeDto);
  }

  @Post('challenges/:id/join')
  @ApiOperation({
    summary: 'Join challenge',
    description: 'Join a specific challenge as the current user',
  })
  @ApiResponse({
    status: 201,
    description: 'Joined challenge successfully',
    type: UserChallengeDto,
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @ApiResponse({ status: 400, description: 'Cannot join challenge' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  async joinChallenge(
    @Param('id', ParseIntPipe) challengeId: number,
    @Request() req: any
  ): Promise<UserChallengeDto> {
    return this.gamificationService.joinChallenge(challengeId, req.user.id);
  }

  @Get('challenges/user/me')
  @ApiOperation({
    summary: 'Get user challenges',
    description: 'Retrieve all challenges the current user is participating in',
  })
  @ApiResponse({
    status: 200,
    description: 'User challenges retrieved successfully',
    type: [UserChallengeDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserChallenges(@Request() req: any): Promise<UserChallengeDto[]> {
    return this.gamificationService.getUserChallenges(req.user.id);
  }

  @Put('challenges/:id/progress')
  @ApiOperation({
    summary: 'Update challenge progress',
    description: 'Update the current user progress in a specific challenge',
  })
  @ApiResponse({
    status: 200,
    description: 'Challenge progress updated successfully',
    type: UserChallengeDto,
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @ApiResponse({ status: 400, description: 'Invalid progress data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  async updateChallengeProgress(
    @Param('id', ParseIntPipe) challengeId: number,
    @Body() body: { progress: number; progressData?: any },
    @Request() req: any
  ): Promise<UserChallengeDto> {
    return this.gamificationService.updateChallengeProgress(
      challengeId,
      req.user.id,
      body.progress,
      body.progressData
    );
  }

  // ==================== USER PROGRESSION ====================

  @Get('user/progress')
  @ApiOperation({
    summary: 'Get user progression',
    description: 'Retrieve the current user progression and stats',
  })
  @ApiResponse({
    status: 200,
    description: 'User progression retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserProgress(@Request() req: any) {
    const user = await this.gamificationService['usersRepository'].findOne({
      where: { id: req.user.id },
      relations: ['userAchievements', 'userChallenges'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      points: user.points,
      level: user.level,
      experience: user.experience,
      currentStreak: user.currentStreak,
      totalStreak: user.totalStreak,
      perfectDays: user.perfectDays,
      achievementsUnlocked: user.achievementsUnlocked,
      title: user.title,
      avatarFrame: user.avatarFrame,
      achievements: user.userAchievements?.length || 0,
      activeChallenges:
        user.userChallenges?.filter(
          (uc) => uc.status === 'joined' || uc.status === 'in_progress'
        ).length || 0,
      completedChallenges:
        user.userChallenges?.filter((uc) => uc.status === 'completed').length ||
        0,
    };
  }

  @Post('user/achievements/check')
  @ApiOperation({
    summary: 'Check user achievements',
    description: 'Check if the current user has earned any new achievements',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievements checked successfully',
    type: [UserAchievementDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkUserAchievements(
    @Request() req: any
  ): Promise<UserAchievementDto[]> {
    return this.gamificationService.checkAndAwardAchievements(req.user.id);
  }

  @Post('user/stats/update')
  @ApiOperation({
    summary: 'Update user stats',
    description: 'Manually trigger an update of the current user stats',
  })
  @ApiResponse({
    status: 200,
    description: 'User stats updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateUserStats(@Request() req: any) {
    await this.gamificationService.updateUserStats(req.user.id);
    return { message: 'User stats updated successfully' };
  }

  // ==================== GAMIFICATION SUMMARY ====================

  @Get('summary')
  @ApiOperation({
    summary: 'Get gamification summary',
    description:
      'Get a comprehensive summary of the current user gamification status',
  })
  @ApiResponse({
    status: 200,
    description: 'Gamification summary retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getGamificationSummary(@Request() req: any) {
    const [
      userProgress,
      userAchievements,
      userChallenges,
      availableChallenges,
      activeLeaderboards,
    ] = await Promise.all([
      this.gamificationService['usersRepository'].findOne({
        where: { id: req.user.id },
        relations: ['userAchievements', 'userChallenges'],
      }),
      this.gamificationService.getUserAchievements(req.user.id),
      this.gamificationService.getUserChallenges(req.user.id),
      this.gamificationService.getChallenges(
        undefined,
        undefined,
        'active',
        true,
        5
      ),
      this.gamificationService.getLeaderboards(undefined, true, 5),
    ]);

    if (!userProgress) {
      throw new Error('User not found');
    }

    return {
      user: {
        id: userProgress.id,
        username: userProgress.username,
        points: userProgress.points,
        level: userProgress.level,
        experience: userProgress.experience,
        currentStreak: userProgress.currentStreak,
        totalStreak: userProgress.totalStreak,
        perfectDays: userProgress.perfectDays,
        achievementsUnlocked: userProgress.achievementsUnlocked,
        title: userProgress.title,
        avatarFrame: userProgress.avatarFrame,
      },
      achievements: {
        total: userAchievements.length,
        recent: userAchievements.slice(0, 5),
        byTier: {
          bronze: userAchievements.filter(
            (ua) => ua.achievement.tier === 'bronze'
          ).length,
          silver: userAchievements.filter(
            (ua) => ua.achievement.tier === 'silver'
          ).length,
          gold: userAchievements.filter((ua) => ua.achievement.tier === 'gold')
            .length,
          platinum: userAchievements.filter(
            (ua) => ua.achievement.tier === 'platinum'
          ).length,
          diamond: userAchievements.filter(
            (ua) => ua.achievement.tier === 'diamond'
          ).length,
        },
      },
      challenges: {
        active: userChallenges.filter(
          (uc) => uc.status === 'joined' || uc.status === 'in_progress'
        ).length,
        completed: userChallenges.filter((uc) => uc.status === 'completed')
          .length,
        failed: userChallenges.filter((uc) => uc.status === 'failed').length,
        recent: userChallenges.slice(0, 5),
      },
      availableChallenges: availableChallenges.slice(0, 5),
      activeLeaderboards: activeLeaderboards.slice(0, 5),
      nextLevel: {
        currentLevel: userProgress.level,
        currentExperience: userProgress.experience,
        requiredExperience: Math.floor(
          100 * Math.pow(userProgress.level + 1, 1.5)
        ),
        progress:
          userProgress.experience /
          Math.floor(100 * Math.pow(userProgress.level + 1, 1.5)),
      },
    };
  }
}

