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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { FriendshipsService } from './friendships.service';
import { HabitSharesService } from './habit-shares.service';
import { SocialActivitiesService } from './social-activities.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { CreateHabitShareDto } from './dto/create-habit-share.dto';
import { CreateSocialActivityDto } from './dto/create-social-activity.dto';
import { FriendshipResponseDto } from './dto/friendship-response.dto';

@ApiTags('Social Features')
@Controller('social')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SocialController {
  constructor(
    private readonly friendshipsService: FriendshipsService,
    private readonly habitSharesService: HabitSharesService,
    private readonly socialActivitiesService: SocialActivitiesService
  ) {}

  // ===== FRIENDSHIPS =====

  @Post('friendships')
  @ApiOperation({ summary: 'Send a friend request' })
  @ApiResponse({
    status: 201,
    description: 'Friend request sent successfully',
    type: FriendshipResponseDto,
  })
  async createFriendship(
    @Body() createFriendshipDto: CreateFriendshipDto,
    @Req() req: Request
  ): Promise<FriendshipResponseDto> {
    const userId = (req.user as any).id;
    return await this.friendshipsService.create(userId, createFriendshipDto);
  }

  @Get('friendships')
  @ApiOperation({ summary: 'Get all friendships for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Friendships retrieved successfully',
    type: [FriendshipResponseDto],
  })
  async findAllFriendships(
    @Req() req: Request
  ): Promise<FriendshipResponseDto[]> {
    const userId = (req.user as any).id;
    return await this.friendshipsService.findAll(userId);
  }

  @Get('friendships/friends')
  @ApiOperation({ summary: 'Get accepted friends for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Friends retrieved successfully',
    type: [FriendshipResponseDto],
  })
  async findFriends(@Req() req: Request): Promise<FriendshipResponseDto[]> {
    const userId = (req.user as any).id;
    return await this.friendshipsService.findFriends(userId);
  }

  @Get('friendships/pending')
  @ApiOperation({
    summary: 'Get pending friend requests received by the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending requests retrieved successfully',
    type: [FriendshipResponseDto],
  })
  async findPendingRequests(
    @Req() req: Request
  ): Promise<FriendshipResponseDto[]> {
    const userId = (req.user as any).id;
    return await this.friendshipsService.findPendingRequests(userId);
  }

  @Get('friendships/sent')
  @ApiOperation({ summary: 'Get friend requests sent by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Sent requests retrieved successfully',
    type: [FriendshipResponseDto],
  })
  async findSentRequests(
    @Req() req: Request
  ): Promise<FriendshipResponseDto[]> {
    const userId = (req.user as any).id;
    return await this.friendshipsService.findSentRequests(userId);
  }

  @Get('friendships/:id')
  @ApiOperation({ summary: 'Get a specific friendship by ID' })
  @ApiResponse({
    status: 200,
    description: 'Friendship retrieved successfully',
    type: FriendshipResponseDto,
  })
  async findOneFriendship(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request
  ): Promise<FriendshipResponseDto> {
    const userId = (req.user as any).id;
    return await this.friendshipsService.findOne(id, userId);
  }

  @Patch('friendships/:id')
  @ApiOperation({ summary: 'Update friendship status (accept/reject/block)' })
  @ApiResponse({
    status: 200,
    description: 'Friendship updated successfully',
    type: FriendshipResponseDto,
  })
  async updateFriendship(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFriendshipDto: UpdateFriendshipDto,
    @Req() req: Request
  ): Promise<FriendshipResponseDto> {
    const userId = (req.user as any).id;
    return await this.friendshipsService.update(
      id,
      updateFriendshipDto,
      userId
    );
  }

  @Delete('friendships/:id')
  @ApiOperation({ summary: 'Remove a friendship' })
  @ApiResponse({ status: 200, description: 'Friendship removed successfully' })
  async removeFriendship(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request
  ): Promise<void> {
    const userId = (req.user as any).id;
    return await this.friendshipsService.remove(id, userId);
  }

  @Post('friendships/:userId/block')
  @ApiOperation({ summary: 'Block a user' })
  @ApiResponse({ status: 200, description: 'User blocked successfully' })
  async blockUser(
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Req() req: Request
  ): Promise<void> {
    const userId = (req.user as any).id;
    return await this.friendshipsService.blockUser(userId, targetUserId);
  }

  @Post('friendships/:userId/unblock')
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiResponse({ status: 200, description: 'User unblocked successfully' })
  async unblockUser(
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Req() req: Request
  ): Promise<void> {
    const userId = (req.user as any).id;
    return await this.friendshipsService.unblockUser(userId, targetUserId);
  }

  @Get('friendships/:userId/mutual')
  @ApiOperation({ summary: 'Get mutual friends with another user' })
  @ApiResponse({
    status: 200,
    description: 'Mutual friends retrieved successfully',
  })
  async getMutualFriends(
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.friendshipsService.getMutualFriends(userId, targetUserId);
  }

  @Get('users/search')
  @ApiOperation({ summary: 'Search for users to add as friends' })
  @ApiResponse({ status: 200, description: 'Users found successfully' })
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.friendshipsService.searchUsers(query, userId, limit);
  }

  // ===== HABIT SHARES =====

  @Post('habit-shares')
  @ApiOperation({ summary: 'Share a habit with a friend' })
  @ApiResponse({ status: 201, description: 'Habit shared successfully' })
  async createHabitShare(
    @Body() createHabitShareDto: CreateHabitShareDto,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.habitSharesService.create(userId, createHabitShareDto);
  }

  @Get('habit-shares')
  @ApiOperation({ summary: 'Get all habit shares for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Habit shares retrieved successfully',
  })
  async findAllHabitShares(@Req() req: Request) {
    const userId = (req.user as any).id;
    return await this.habitSharesService.findAll(userId);
  }

  @Get('habit-shares/shared-with-me')
  @ApiOperation({ summary: 'Get habits shared with the current user' })
  @ApiResponse({
    status: 200,
    description: 'Shared habits retrieved successfully',
  })
  async findSharedWithMe(@Req() req: Request) {
    const userId = (req.user as any).id;
    return await this.habitSharesService.findSharedWithMe(userId);
  }

  @Get('habit-shares/shared-by-me')
  @ApiOperation({ summary: 'Get habits shared by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Shared habits retrieved successfully',
  })
  async findSharedByMe(@Req() req: Request) {
    const userId = (req.user as any).id;
    return await this.habitSharesService.findSharedByMe(userId);
  }

  @Get('habit-shares/:id')
  @ApiOperation({ summary: 'Get a specific habit share by ID' })
  @ApiResponse({
    status: 200,
    description: 'Habit share retrieved successfully',
  })
  async findOneHabitShare(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.habitSharesService.findOne(id, userId);
  }

  @Patch('habit-shares/:id/status')
  @ApiOperation({ summary: 'Update habit share status' })
  @ApiResponse({
    status: 200,
    description: 'Habit share status updated successfully',
  })
  async updateHabitShareStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.habitSharesService.updateStatus(
      id,
      status as any,
      userId
    );
  }

  @Patch('habit-shares/:id/permission')
  @ApiOperation({ summary: 'Update habit share permission' })
  @ApiResponse({
    status: 200,
    description: 'Habit share permission updated successfully',
  })
  async updateHabitSharePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body('permission') permission: string,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.habitSharesService.updatePermission(
      id,
      permission as any,
      userId
    );
  }

  @Delete('habit-shares/:id')
  @ApiOperation({ summary: 'Remove a habit share' })
  @ApiResponse({ status: 200, description: 'Habit share removed successfully' })
  async removeHabitShare(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request
  ): Promise<void> {
    const userId = (req.user as any).id;
    return await this.habitSharesService.remove(id, userId);
  }

  @Post('habit-shares/:id/view')
  @ApiOperation({ summary: 'Mark a habit share as viewed' })
  @ApiResponse({ status: 200, description: 'Habit share marked as viewed' })
  async markHabitShareAsViewed(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request
  ): Promise<void> {
    const userId = (req.user as any).id;
    return await this.habitSharesService.markAsViewed(id, userId);
  }

  @Get('habit-shares/stats')
  @ApiOperation({
    summary: 'Get habit sharing statistics for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getHabitShareStats(@Req() req: Request) {
    const userId = (req.user as any).id;
    return await this.habitSharesService.getSharedHabitStats(userId);
  }

  @Get('habit-shares/popular')
  @ApiOperation({ summary: 'Get popular shared habits' })
  @ApiResponse({
    status: 200,
    description: 'Popular habits retrieved successfully',
  })
  async getPopularSharedHabits(@Query('limit') limit: number = 10) {
    return await this.habitSharesService.findPopularSharedHabits(limit);
  }

  // ===== SOCIAL ACTIVITIES =====

  @Post('activities')
  @ApiOperation({
    summary: 'Create a social activity (like, comment, support, etc.)',
  })
  @ApiResponse({ status: 201, description: 'Activity created successfully' })
  async createSocialActivity(
    @Body() createSocialActivityDto: CreateSocialActivityDto,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.socialActivitiesService.create(
      userId,
      createSocialActivityDto
    );
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get social activities for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Activities retrieved successfully',
  })
  async findAllSocialActivities(@Req() req: Request) {
    const userId = (req.user as any).id;
    return await this.socialActivitiesService.findAll(userId);
  }

  @Get('activities/target/:type/:id')
  @ApiOperation({ summary: 'Get social activities for a specific target' })
  @ApiResponse({
    status: 200,
    description: 'Activities retrieved successfully',
  })
  async findActivitiesByTarget(
    @Param('type') targetType: string,
    @Param('id', ParseIntPipe) targetId: number
  ) {
    return await this.socialActivitiesService.findByTarget(
      targetType,
      targetId
    );
  }

  @Get('activities/target/:type/:id/likes')
  @ApiOperation({ summary: 'Get likes for a specific target' })
  @ApiResponse({ status: 200, description: 'Likes retrieved successfully' })
  async findLikesByTarget(
    @Param('type') targetType: string,
    @Param('id', ParseIntPipe) targetId: number
  ) {
    return await this.socialActivitiesService.findLikesByTarget(
      targetType,
      targetId
    );
  }

  @Get('activities/target/:type/:id/comments')
  @ApiOperation({ summary: 'Get comments for a specific target' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  async findCommentsByTarget(
    @Param('type') targetType: string,
    @Param('id', ParseIntPipe) targetId: number
  ) {
    return await this.socialActivitiesService.findCommentsByTarget(
      targetType,
      targetId
    );
  }

  @Get('activities/:id')
  @ApiOperation({ summary: 'Get a specific social activity by ID' })
  @ApiResponse({ status: 200, description: 'Activity retrieved successfully' })
  async findOneSocialActivity(@Param('id', ParseIntPipe) id: number) {
    return await this.socialActivitiesService.findOne(id);
  }

  @Patch('activities/:id')
  @ApiOperation({ summary: 'Update a social activity' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully' })
  async updateSocialActivity(
    @Param('id', ParseIntPipe) id: number,
    @Body() updates: any,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.socialActivitiesService.update(id, userId, updates);
  }

  @Delete('activities/:id')
  @ApiOperation({ summary: 'Remove a social activity' })
  @ApiResponse({ status: 200, description: 'Activity removed successfully' })
  async removeSocialActivity(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request
  ): Promise<void> {
    const userId = (req.user as any).id;
    return await this.socialActivitiesService.remove(id, userId);
  }

  @Post('activities/toggle-like/:type/:id')
  @ApiOperation({ summary: 'Toggle like on a target' })
  @ApiResponse({ status: 200, description: 'Like toggled successfully' })
  async toggleLike(
    @Param('type') targetType: string,
    @Param('id', ParseIntPipe) targetId: number,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.socialActivitiesService.toggleLike(
      userId,
      targetType,
      targetId
    );
  }

  @Post('activities/comment/:type/:id')
  @ApiOperation({ summary: 'Add a comment to a target' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  async addComment(
    @Param('type') targetType: string,
    @Param('id', ParseIntPipe) targetId: number,
    @Body('content') content: string,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.socialActivitiesService.addComment(
      userId,
      targetType,
      targetId,
      content
    );
  }

  @Post('activities/support/:type/:id')
  @ApiOperation({ summary: 'Add support to a target' })
  @ApiResponse({ status: 201, description: 'Support added successfully' })
  async addSupport(
    @Param('type') targetType: string,
    @Param('id', ParseIntPipe) targetId: number,
    @Body('message') message?: string,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.socialActivitiesService.addSupport(
      userId,
      targetType,
      targetId,
      message
    );
  }

  @Post('activities/cheer/:type/:id')
  @ApiOperation({ summary: 'Add a cheer to a target' })
  @ApiResponse({ status: 201, description: 'Cheer added successfully' })
  async addCheer(
    @Param('type') targetType: string,
    @Param('id', ParseIntPipe) targetId: number,
    @Body('emoji') emoji?: string,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.socialActivitiesService.addCheer(
      userId,
      targetType,
      targetId,
      emoji
    );
  }

  @Get('activities/target/:type/:id/stats')
  @ApiOperation({ summary: 'Get activity statistics for a target' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getActivityStats(
    @Param('type') targetType: string,
    @Param('id', ParseIntPipe) targetId: number
  ) {
    return await this.socialActivitiesService.getActivityStats(
      targetType,
      targetId
    );
  }

  @Get('activities/feed')
  @ApiOperation({ summary: 'Get user activity feed' })
  @ApiResponse({ status: 200, description: 'Feed retrieved successfully' })
  async getUserActivityFeed(
    @Query('limit') limit: number = 20,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.socialActivitiesService.getUserActivityFeed(
      userId,
      limit
    );
  }

  @Get('activities/feed/:type/:id')
  @ApiOperation({ summary: 'Get activity feed for a specific target' })
  @ApiResponse({ status: 200, description: 'Feed retrieved successfully' })
  async getTargetActivityFeed(
    @Param('type') targetType: string,
    @Param('id', ParseIntPipe) targetId: number,
    @Query('limit') limit: number = 20
  ) {
    return await this.socialActivitiesService.getTargetActivityFeed(
      targetType,
      targetId,
      limit
    );
  }

  // ===== AUTOMATIC ACTIVITIES =====

  @Post('activities/milestone/:type/:id')
  @ApiOperation({ summary: 'Mark a milestone achievement' })
  @ApiResponse({ status: 201, description: 'Milestone marked successfully' })
  async markMilestone(
    @Param('type') targetType: string,
    @Param('id', ParseIntPipe) targetId: number,
    @Body('milestone') milestone: string,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.socialActivitiesService.markMilestone(
      userId,
      targetType,
      targetId,
      milestone
    );
  }

  @Post('activities/streak/:type/:id')
  @ApiOperation({ summary: 'Mark a streak achievement' })
  @ApiResponse({ status: 201, description: 'Streak marked successfully' })
  async markStreak(
    @Param('type') targetType: string,
    @Param('id', ParseIntPipe) targetId: number,
    @Body('streakCount') streakCount: number,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.socialActivitiesService.markStreak(
      userId,
      targetType,
      targetId,
      streakCount
    );
  }

  @Post('activities/goal-achievement/:type/:id')
  @ApiOperation({ summary: 'Mark a goal achievement' })
  @ApiResponse({
    status: 201,
    description: 'Goal achievement marked successfully',
  })
  async markGoalAchievement(
    @Param('type') targetType: string,
    @Param('id', ParseIntPipe) targetId: number,
    @Body('goal') goal: string,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return await this.socialActivitiesService.markGoalAchievement(
      userId,
      targetType,
      targetId,
      goal
    );
  }
}
