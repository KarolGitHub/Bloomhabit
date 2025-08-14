import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommunityGardensService } from './community-gardens.service';
import { GroupChallengesService } from './group-challenges.service';
import { CreateCommunityGardenDto } from './dto/create-community-garden.dto';
import { CreateGroupChallengeDto } from './dto/create-group-challenge.dto';

@ApiTags('Community')
@Controller('community')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunityController {
  constructor(
    private readonly communityGardensService: CommunityGardensService,
    private readonly groupChallengesService: GroupChallengesService
  ) {}

  // Community Gardens endpoints
  @Get('gardens')
  @ApiOperation({ summary: 'Get all community gardens' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['public', 'private', 'invite_only'],
  })
  @ApiQuery({ name: 'tags', required: false, type: 'string', isArray: true })
  @ApiQuery({ name: 'search', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Community gardens retrieved successfully',
  })
  async getGardens(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('tags') tags?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    const filters: any = {};
    if (type) filters.type = type;
    if (tags) filters.tags = tags.split(',');
    if (search) filters.search = search;
    if (limit) filters.limit = +limit;
    if (offset) filters.offset = +offset;

    return this.communityGardensService.findAll(req.user.id, filters);
  }

  @Get('gardens/popular')
  @ApiOperation({ summary: 'Get popular community gardens' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Popular gardens retrieved successfully',
  })
  async getPopularGardens(@Query('limit') limit?: number) {
    return this.communityGardensService.getPopularGardens(limit ? +limit : 10);
  }

  @Get('gardens/search')
  @ApiOperation({ summary: 'Search community gardens' })
  @ApiQuery({ name: 'q', required: true, type: 'string' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['public', 'private', 'invite_only'],
  })
  @ApiQuery({ name: 'tags', required: false, type: 'string', isArray: true })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchGardens(
    @Query('q') query: string,
    @Query('type') type?: string,
    @Query('tags') tags?: string
  ) {
    const filters: any = {};
    if (type) filters.type = type;
    if (tags) filters.tags = tags.split(',');

    return this.communityGardensService.searchGardens(query, filters);
  }

  @Get('gardens/my')
  @ApiOperation({ summary: "Get user's community gardens" })
  @ApiResponse({
    status: 200,
    description: 'User gardens retrieved successfully',
  })
  async getUserGardens(@Request() req: any) {
    return this.communityGardensService.getUserGardens(req.user.id);
  }

  @Get('gardens/:id')
  @ApiOperation({ summary: 'Get a specific community garden' })
  @ApiParam({ name: 'id', description: 'Garden ID' })
  @ApiResponse({
    status: 200,
    description: 'Garden retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Garden not found' })
  async getGarden(@Param('id') id: string, @Request() req: any) {
    return this.communityGardensService.findOne(+id, req.user.id);
  }

  @Post('gardens')
  @ApiOperation({ summary: 'Create a new community garden' })
  @ApiResponse({
    status: 201,
    description: 'Community garden created successfully',
  })
  async createGarden(
    @Body() createCommunityGardenDto: CreateCommunityGardenDto,
    @Request() req: any
  ) {
    return this.communityGardensService.create(
      req.user.id,
      createCommunityGardenDto
    );
  }

  @Put('gardens/:id')
  @ApiOperation({ summary: 'Update a community garden' })
  @ApiParam({ name: 'id', description: 'Garden ID' })
  @ApiResponse({
    status: 200,
    description: 'Garden updated successfully',
  })
  async updateGarden(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateCommunityGardenDto>,
    @Request() req: any
  ) {
    return this.communityGardensService.update(+id, req.user.id, updateData);
  }

  @Delete('gardens/:id')
  @ApiOperation({ summary: 'Delete a community garden' })
  @ApiParam({ name: 'id', description: 'Garden ID' })
  @ApiResponse({
    status: 200,
    description: 'Garden deleted successfully',
  })
  async deleteGarden(@Param('id') id: string, @Request() req: any) {
    return this.communityGardensService.remove(+id, req.user.id);
  }

  @Post('gardens/:id/join')
  @ApiOperation({ summary: 'Join a community garden' })
  @ApiParam({ name: 'id', description: 'Garden ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined garden',
  })
  async joinGarden(@Param('id') id: string, @Request() req: any) {
    return this.communityGardensService.joinGarden(+id, req.user.id);
  }

  @Post('gardens/:id/leave')
  @ApiOperation({ summary: 'Leave a community garden' })
  @ApiParam({ name: 'id', description: 'Garden ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully left garden',
  })
  async leaveGarden(@Param('id') id: string, @Request() req: any) {
    return this.communityGardensService.leaveGarden(+id, req.user.id);
  }

  @Get('gardens/:id/stats')
  @ApiOperation({ summary: 'Get community garden statistics' })
  @ApiParam({ name: 'id', description: 'Garden ID' })
  @ApiResponse({
    status: 200,
    description: 'Garden stats retrieved successfully',
  })
  async getGardenStats(@Param('id') id: string, @Request() req: any) {
    return this.communityGardensService.getGardenStats(+id, req.user.id);
  }

  // Group Challenges endpoints
  @Get('challenges')
  @ApiOperation({ summary: 'Get all group challenges' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['streak', 'completion', 'consistency', 'growth', 'team'],
  })
  @ApiQuery({ name: 'gardenId', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Group challenges retrieved successfully',
  })
  async getChallenges(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('gardenId') gardenId?: number
  ) {
    const filters: any = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (gardenId) filters.gardenId = +gardenId;

    return this.groupChallengesService.findAll(filters);
  }

  @Get('challenges/active')
  @ApiOperation({ summary: 'Get active group challenges' })
  @ApiQuery({ name: 'gardenId', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Active challenges retrieved successfully',
  })
  async getActiveChallenges(@Query('gardenId') gardenId?: number) {
    return this.groupChallengesService.getActiveChallenges(
      gardenId ? +gardenId : undefined
    );
  }

  @Get('challenges/upcoming')
  @ApiOperation({ summary: 'Get upcoming group challenges' })
  @ApiQuery({ name: 'gardenId', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Upcoming challenges retrieved successfully',
  })
  async getUpcomingChallenges(@Query('gardenId') gardenId?: number) {
    return this.groupChallengesService.getUpcomingChallenges(
      gardenId ? +gardenId : undefined
    );
  }

  @Get('challenges/my')
  @ApiOperation({ summary: "Get user's group challenges" })
  @ApiResponse({
    status: 200,
    description: 'User challenges retrieved successfully',
  })
  async getUserChallenges(@Request() req: any) {
    return this.groupChallengesService.getUserChallenges(req.user.id);
  }

  @Get('challenges/:id')
  @ApiOperation({ summary: 'Get a specific group challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({
    status: 200,
    description: 'Challenge retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  async getChallenge(@Param('id') id: string) {
    return this.groupChallengesService.findOne(+id);
  }

  @Post('challenges')
  @ApiOperation({ summary: 'Create a new group challenge' })
  @ApiResponse({
    status: 201,
    description: 'Group challenge created successfully',
  })
  async createChallenge(
    @Body() createGroupChallengeDto: CreateGroupChallengeDto,
    @Request() req: any
  ) {
    return this.groupChallengesService.create(
      req.user.id,
      createGroupChallengeDto
    );
  }

  @Put('challenges/:id')
  @ApiOperation({ summary: 'Update a group challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({
    status: 200,
    description: 'Challenge updated successfully',
  })
  async updateChallenge(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateGroupChallengeDto>,
    @Request() req: any
  ) {
    return this.groupChallengesService.update(+id, req.user.id, updateData);
  }

  @Delete('challenges/:id')
  @ApiOperation({ summary: 'Delete a group challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({
    status: 200,
    description: 'Challenge deleted successfully',
  })
  async deleteChallenge(@Param('id') id: string, @Request() req: any) {
    return this.groupChallengesService.remove(+id, req.user.id);
  }

  @Post('challenges/:id/join')
  @ApiOperation({ summary: 'Join a group challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined challenge',
  })
  async joinChallenge(@Param('id') id: string, @Request() req: any) {
    return this.groupChallengesService.joinChallenge(+id, req.user.id);
  }

  @Post('challenges/:id/leave')
  @ApiOperation({ summary: 'Leave a group challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully left challenge',
  })
  async leaveChallenge(@Param('id') id: string, @Request() req: any) {
    return this.groupChallengesService.leaveChallenge(+id, req.user.id);
  }

  @Post('challenges/:id/progress')
  @ApiOperation({ summary: 'Update challenge progress' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({
    status: 200,
    description: 'Progress updated successfully',
  })
  async updateProgress(
    @Param('id') id: string,
    @Body()
    progressData: {
      currentValue: number;
      streak?: number;
      notes?: string;
    },
    @Request() req: any
  ) {
    return this.groupChallengesService.updateProgress(
      +id,
      req.user.id,
      progressData
    );
  }

  @Get('challenges/:id/leaderboard')
  @ApiOperation({ summary: 'Get challenge leaderboard' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
  })
  async getChallengeLeaderboard(@Param('id') id: string) {
    return this.groupChallengesService.getChallengeLeaderboard(+id);
  }
}
