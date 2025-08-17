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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { HabitGroupService } from '../services/habit-group.service';
import { MentorshipService } from '../services/mentorship.service';
import { SocialChallengeService } from '../services/social-challenge.service';
import {
  CreateHabitGroupDto,
  UpdateHabitGroupDto,
  JoinGroupDto,
  UpdateMemberRoleDto,
  HabitGroupResponseDto,
} from '../dto/habit-group.dto';
import {
  CreateMentorshipDto,
  UpdateMentorshipDto,
  CreateMentorshipSessionDto,
  UpdateMentorshipSessionDto,
  MentorshipResponseDto,
} from '../dto/mentorship.dto';
import {
  CreateSocialChallengeDto,
  UpdateSocialChallengeDto,
  JoinChallengeDto,
  UpdateParticipantStatusDto,
  SocialChallengeResponseDto,
} from '../dto/social-challenge.dto';

@ApiTags('Advanced Social Features')
@Controller('advanced-social')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdvancedSocialController {
  constructor(
    private readonly habitGroupService: HabitGroupService,
    private readonly mentorshipService: MentorshipService,
    private readonly socialChallengeService: SocialChallengeService,
  ) {}

  // ===== HABIT GROUPS =====

  @Post('groups')
  @ApiOperation({ summary: 'Create a new habit group' })
  @ApiResponse({ status: 201, description: 'Habit group created successfully', type: HabitGroupResponseDto })
  async createHabitGroup(
    @Request() req,
    @Body() createDto: CreateHabitGroupDto,
  ): Promise<HabitGroupResponseDto> {
    return this.habitGroupService.createHabitGroup(req.user.id, createDto);
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get user\'s habit groups' })
  @ApiResponse({ status: 200, description: 'Habit groups retrieved successfully', type: [HabitGroupResponseDto] })
  async getUserHabitGroups(@Request() req): Promise<HabitGroupResponseDto[]> {
    return this.habitGroupService.getUserHabitGroups(req.user.id);
  }

  @Get('groups/search')
  @ApiOperation({ summary: 'Search for habit groups' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'category', required: false, description: 'Group category' })
  @ApiQuery({ name: 'privacy', required: false, description: 'Group privacy level' })
  @ApiResponse({ status: 200, description: 'Search results', type: [HabitGroupResponseDto] })
  async searchHabitGroups(
    @Query('query') query?: string,
    @Query('category') category?: string,
    @Query('privacy') privacy?: string,
  ): Promise<HabitGroupResponseDto[]> {
    return this.habitGroupService.searchHabitGroups(query, category, privacy);
  }

  @Get('groups/:id')
  @ApiOperation({ summary: 'Get habit group by ID' })
  @ApiParam({ name: 'id', description: 'Habit group ID' })
  @ApiResponse({ status: 200, description: 'Habit group retrieved successfully', type: HabitGroupResponseDto })
  async getHabitGroupById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HabitGroupResponseDto> {
    return this.habitGroupService.getHabitGroupById(id, req.user.id);
  }

  @Put('groups/:id')
  @ApiOperation({ summary: 'Update habit group' })
  @ApiParam({ name: 'id', description: 'Habit group ID' })
  @ApiResponse({ status: 200, description: 'Habit group updated successfully', type: HabitGroupResponseDto })
  async updateHabitGroup(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateHabitGroupDto,
  ): Promise<HabitGroupResponseDto> {
    return this.habitGroupService.updateHabitGroup(id, req.user.id, updateDto);
  }

  @Delete('groups/:id')
  @ApiOperation({ summary: 'Delete habit group' })
  @ApiParam({ name: 'id', description: 'Habit group ID' })
  @ApiResponse({ status: 200, description: 'Habit group deleted successfully' })
  async deleteHabitGroup(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.habitGroupService.deleteHabitGroup(id, req.user.id);
  }

  @Post('groups/:id/join')
  @ApiOperation({ summary: 'Join a habit group' })
  @ApiParam({ name: 'id', description: 'Habit group ID' })
  @ApiResponse({ status: 201, description: 'Joined group successfully' })
  async joinHabitGroup(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() joinDto: JoinGroupDto,
  ) {
    return this.habitGroupService.joinHabitGroup(id, req.user.id, joinDto);
  }

  @Post('groups/:id/leave')
  @ApiOperation({ summary: 'Leave a habit group' })
  @ApiParam({ name: 'id', description: 'Habit group ID' })
  @ApiResponse({ status: 200, description: 'Left group successfully' })
  async leaveHabitGroup(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.habitGroupService.leaveHabitGroup(id, req.user.id);
  }

  @Put('groups/:id/members/:memberId/role')
  @ApiOperation({ summary: 'Update member role in group' })
  @ApiParam({ name: 'id', description: 'Habit group ID' })
  @ApiParam({ name: 'memberId', description: 'Member user ID' })
  @ApiResponse({ status: 200, description: 'Member role updated successfully' })
  async updateMemberRole(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() updateDto: UpdateMemberRoleDto,
  ) {
    return this.habitGroupService.updateMemberRole(id, req.user.id, memberId, updateDto);
  }

  @Delete('groups/:id/members/:memberId')
  @ApiOperation({ summary: 'Remove member from group' })
  @ApiParam({ name: 'id', description: 'Habit group ID' })
  @ApiParam({ name: 'memberId', description: 'Member user ID' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  async removeMember(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ): Promise<void> {
    return this.habitGroupService.removeMember(id, req.user.id, memberId);
  }

  @Get('groups/:id/stats')
  @ApiOperation({ summary: 'Get group statistics' })
  @ApiParam({ name: 'id', description: 'Habit group ID' })
  @ApiResponse({ status: 200, description: 'Group statistics retrieved successfully' })
  async getGroupStats(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.habitGroupService.getGroupStats(id);
  }

  // ===== MENTORSHIP =====

  @Post('mentorship')
  @ApiOperation({ summary: 'Create a new mentorship request' })
  @ApiResponse({ status: 201, description: 'Mentorship created successfully', type: MentorshipResponseDto })
  async createMentorship(
    @Request() req,
    @Body() createDto: CreateMentorshipDto,
  ): Promise<MentorshipResponseDto> {
    return this.mentorshipService.createMentorship(req.user.id, createDto);
  }

  @Get('mentorship')
  @ApiOperation({ summary: 'Get user\'s mentorships' })
  @ApiResponse({ status: 200, description: 'Mentorships retrieved successfully', type: [MentorshipResponseDto] })
  async getUserMentorships(@Request() req): Promise<MentorshipResponseDto[]> {
    return this.mentorshipService.getUserMentorships(req.user.id);
  }

  @Get('mentorship/:id')
  @ApiOperation({ summary: 'Get mentorship by ID' })
  @ApiParam({ name: 'id', description: 'Mentorship ID' })
  @ApiResponse({ status: 200, description: 'Mentorship retrieved successfully', type: MentorshipResponseDto })
  async getMentorshipById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MentorshipResponseDto> {
    return this.mentorshipService.getMentorshipById(id, req.user.id);
  }

  @Put('mentorship/:id')
  @ApiOperation({ summary: 'Update mentorship' })
  @ApiParam({ name: 'id', description: 'Mentorship ID' })
  @ApiResponse({ status: 200, description: 'Mentorship updated successfully', type: MentorshipResponseDto })
  async updateMentorship(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMentorshipDto,
  ): Promise<MentorshipResponseDto> {
    return this.mentorshipService.updateMentorship(id, req.user.id, updateDto);
  }

  @Delete('mentorship/:id')
  @ApiOperation({ summary: 'Delete mentorship' })
  @ApiParam({ name: 'id', description: 'Mentorship ID' })
  @ApiResponse({ status: 200, description: 'Mentorship deleted successfully' })
  async deleteMentorship(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.mentorshipService.deleteMentorship(id, req.user.id);
  }

  @Post('mentorship/:id/accept')
  @ApiOperation({ summary: 'Accept mentorship request' })
  @ApiParam({ name: 'id', description: 'Mentorship ID' })
  @ApiResponse({ status: 200, description: 'Mentorship accepted successfully', type: MentorshipResponseDto })
  async acceptMentorship(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MentorshipResponseDto> {
    return this.mentorshipService.acceptMentorship(id, req.user.id);
  }

  @Post('mentorship/:id/reject')
  @ApiOperation({ summary: 'Reject mentorship request' })
  @ApiParam({ name: 'id', description: 'Mentorship ID' })
  @ApiResponse({ status: 200, description: 'Mentorship rejected successfully', type: MentorshipResponseDto })
  async rejectMentorship(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MentorshipResponseDto> {
    return this.mentorshipService.rejectMentorship(id, req.user.id);
  }

  @Post('mentorship/:id/complete')
  @ApiOperation({ summary: 'Complete mentorship' })
  @ApiParam({ name: 'id', description: 'Mentorship ID' })
  @ApiResponse({ status: 200, description: 'Mentorship completed successfully', type: MentorshipResponseDto })
  async completeMentorship(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MentorshipResponseDto> {
    return this.mentorshipService.completeMentorship(id, req.user.id);
  }

  @Post('mentorship/sessions')
  @ApiOperation({ summary: 'Create mentorship session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  async createMentorshipSession(
    @Request() req,
    @Body() createDto: CreateMentorshipSessionDto,
  ) {
    return this.mentorshipService.createMentorshipSession(req.user.id, createDto);
  }

  @Get('mentorship/:id/sessions')
  @ApiOperation({ summary: 'Get mentorship sessions' })
  @ApiParam({ name: 'id', description: 'Mentorship ID' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getMentorshipSessions(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.mentorshipService.getMentorshipSessions(id, req.user.id);
  }

  @Get('mentors/search')
  @ApiOperation({ summary: 'Search for mentors' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'type', required: false, description: 'Mentorship type' })
  @ApiQuery({ name: 'level', required: false, description: 'Mentorship level' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchMentors(
    @Query('query') query?: string,
    @Query('type') type?: string,
    @Query('level') level?: string,
  ) {
    return this.mentorshipService.searchMentors(query, type, level);
  }

  @Get('mentorship/stats')
  @ApiOperation({ summary: 'Get mentorship statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getMentorshipStats(@Request() req) {
    return this.mentorshipService.getMentorshipStats(req.user.id);
  }

  // ===== SOCIAL CHALLENGES =====

  @Post('challenges')
  @ApiOperation({ summary: 'Create a new social challenge' })
  @ApiResponse({ status: 201, description: 'Challenge created successfully', type: SocialChallengeResponseDto })
  async createSocialChallenge(
    @Request() req,
    @Body() createDto: CreateSocialChallengeDto,
  ): Promise<SocialChallengeResponseDto> {
    return this.socialChallengeService.createSocialChallenge(req.user.id, createDto);
  }

  @Get('challenges')
  @ApiOperation({ summary: 'Get user\'s challenges' })
  @ApiResponse({ status: 200, description: 'Challenges retrieved successfully', type: [SocialChallengeResponseDto] })
  async getUserChallenges(@Request() req): Promise<SocialChallengeResponseDto[]> {
    return this.socialChallengeService.getUserChallenges(req.user.id);
  }

  @Get('challenges/search')
  @ApiOperation({ summary: 'Search for challenges' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'type', required: false, description: 'Challenge type' })
  @ApiQuery({ name: 'difficulty', required: false, description: 'Challenge difficulty' })
  @ApiQuery({ name: 'status', required: false, description: 'Challenge status' })
  @ApiResponse({ status: 200, description: 'Search results', type: [SocialChallengeResponseDto] })
  async searchChallenges(
    @Query('query') query?: string,
    @Query('type') type?: string,
    @Query('difficulty') difficulty?: string,
    @Query('status') status?: string,
  ): Promise<SocialChallengeResponseDto[]> {
    return this.socialChallengeService.searchChallenges(query, type, difficulty, status);
  }

  @Get('challenges/:id')
  @ApiOperation({ summary: 'Get challenge by ID' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({ status: 200, description: 'Challenge retrieved successfully', type: SocialChallengeResponseDto })
  async getSocialChallengeById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SocialChallengeResponseDto> {
    return this.socialChallengeService.getSocialChallengeById(id, req.user.id);
  }

  @Put('challenges/:id')
  @ApiOperation({ summary: 'Update challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({ status: 200, description: 'Challenge updated successfully', type: SocialChallengeResponseDto })
  async updateSocialChallenge(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSocialChallengeDto,
  ): Promise<SocialChallengeResponseDto> {
    return this.socialChallengeService.updateSocialChallenge(id, req.user.id, updateDto);
  }

  @Delete('challenges/:id')
  @ApiOperation({ summary: 'Delete challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({ status: 200, description: 'Challenge deleted successfully' })
  async deleteSocialChallenge(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.socialChallengeService.deleteSocialChallenge(id, req.user.id);
  }

  @Post('challenges/:id/activate')
  @ApiOperation({ summary: 'Activate challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({ status: 200, description: 'Challenge activated successfully', type: SocialChallengeResponseDto })
  async activateChallenge(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SocialChallengeResponseDto> {
    return this.socialChallengeService.activateChallenge(id, req.user.id);
  }

  @Post('challenges/:id/pause')
  @ApiOperation({ summary: 'Pause challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({ status: 200, description: 'Challenge paused successfully', type: SocialChallengeResponseDto })
  async pauseChallenge(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SocialChallengeResponseDto> {
    return this.socialChallengeService.pauseChallenge(id, req.user.id);
  }

  @Post('challenges/:id/complete')
  @ApiOperation({ summary: 'Complete challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({ status: 200, description: 'Challenge completed successfully', type: SocialChallengeResponseDto })
  async completeChallenge(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SocialChallengeResponseDto> {
    return this.socialChallengeService.completeChallenge(id, req.user.id);
  }

  @Post('challenges/:id/join')
  @ApiOperation({ summary: 'Join challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({ status: 201, description: 'Joined challenge successfully' })
  async joinChallenge(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() joinDto: JoinChallengeDto,
  ) {
    return this.socialChallengeService.joinChallenge(id, req.user.id, joinDto);
  }

  @Post('challenges/:id/leave')
  @ApiOperation({ summary: 'Leave challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({ status: 200, description: 'Left challenge successfully' })
  async leaveChallenge(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.socialChallengeService.leaveChallenge(id, req.user.id);
  }

  @Put('challenges/:id/participants/:participantId')
  @ApiOperation({ summary: 'Update participant status' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiParam({ name: 'participantId', description: 'Participant user ID' })
  @ApiResponse({ status: 200, description: 'Participant status updated successfully' })
  async updateParticipantStatus(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('participantId', ParseIntPipe) participantId: number,
    @Body() updateDto: UpdateParticipantStatusDto,
  ) {
    return this.socialChallengeService.updateParticipantStatus(id, req.user.id, participantId, updateDto);
  }

  @Get('challenges/:id/leaderboard')
  @ApiOperation({ summary: 'Get challenge leaderboard' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  async getChallengeLeaderboard(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.socialChallengeService.getChallengeLeaderboard(id);
  }

  @Get('challenges/:id/stats')
  @ApiOperation({ summary: 'Get challenge statistics' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiResponse({ status: 200, description: 'Challenge statistics retrieved successfully' })
  async getChallengeStats(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.socialChallengeService.getChallengeStats(id);
  }

  @Get('challenges/stats/user')
  @ApiOperation({ summary: 'Get user challenge statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  async getUserChallengeStats(@Request() req) {
    return this.socialChallengeService.getUserChallengeStats(req.user.id);
  }
}
