import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CalendarIntegrationService } from '../services/calendar-integration.service';
import { TaskIntegrationService } from '../services/task-integration.service';
import { SmartHomeIntegrationService } from '../services/smart-home-integration.service';
import {
  CreateCalendarIntegrationDto,
  UpdateCalendarIntegrationDto,
} from '../dto/calendar-integration.dto';
import {
  CreateTaskIntegrationDto,
  UpdateTaskIntegrationDto,
} from '../dto/task-integration.dto';
import {
  CreateSmartHomeIntegrationDto,
  UpdateSmartHomeIntegrationDto,
} from '../dto/smart-home-integration.dto';

@ApiTags('Integration Ecosystem')
@Controller('integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IntegrationEcosystemController {
  constructor(
    private readonly calendarIntegrationService: CalendarIntegrationService,
    private readonly taskIntegrationService: TaskIntegrationService,
    private readonly smartHomeIntegrationService: SmartHomeIntegrationService
  ) {}

  // ===== CALENDAR INTEGRATIONS =====

  @Post('calendar')
  @ApiOperation({ summary: 'Create a new calendar integration' })
  @ApiResponse({
    status: 201,
    description: 'Calendar integration created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - integration already exists',
  })
  async createCalendarIntegration(
    @Request() req,
    @Body() createDto: CreateCalendarIntegrationDto
  ) {
    return this.calendarIntegrationService.createCalendarIntegration(
      req.user.id,
      createDto
    );
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get user calendar integrations' })
  @ApiResponse({
    status: 200,
    description: 'Calendar integrations retrieved successfully',
  })
  async getUserCalendarIntegrations(@Request() req) {
    return this.calendarIntegrationService.getUserCalendarIntegrations(
      req.user.id
    );
  }

  @Get('calendar/:id')
  @ApiOperation({ summary: 'Get calendar integration by ID' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 200,
    description: 'Calendar integration retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async getCalendarIntegrationById(@Request() req, @Param('id') id: string) {
    return this.calendarIntegrationService.getCalendarIntegrationById(
      req.user.id,
      id
    );
  }

  @Put('calendar/:id')
  @ApiOperation({ summary: 'Update calendar integration' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 200,
    description: 'Calendar integration updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async updateCalendarIntegration(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateCalendarIntegrationDto
  ) {
    return this.calendarIntegrationService.updateCalendarIntegration(
      req.user.id,
      id,
      updateDto
    );
  }

  @Delete('calendar/:id')
  @ApiOperation({ summary: 'Delete calendar integration' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 204,
    description: 'Calendar integration deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCalendarIntegration(@Request() req, @Param('id') id: string) {
    await this.calendarIntegrationService.deleteCalendarIntegration(
      req.user.id,
      id
    );
  }

  @Post('calendar/:id/sync')
  @ApiOperation({ summary: 'Sync calendar events' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 200,
    description: 'Calendar sync initiated successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async syncCalendarEvents(@Param('id') id: string) {
    await this.calendarIntegrationService.syncCalendarEvents(id);
    return { message: 'Calendar sync initiated successfully' };
  }

  @Get('calendar/:id/status')
  @ApiOperation({ summary: 'Get calendar sync status' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 200,
    description: 'Sync status retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async getCalendarSyncStatus(@Param('id') id: string) {
    return this.calendarIntegrationService.getCalendarSyncStatus(id);
  }

  // ===== TASK INTEGRATIONS =====

  @Post('tasks')
  @ApiOperation({ summary: 'Create a new task integration' })
  @ApiResponse({
    status: 201,
    description: 'Task integration created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - integration already exists',
  })
  async createTaskIntegration(
    @Request() req,
    @Body() createDto: CreateTaskIntegrationDto
  ) {
    return this.taskIntegrationService.createTaskIntegration(
      req.user.id,
      createDto
    );
  }

  @Get('tasks')
  @ApiOperation({ summary: 'Get user task integrations' })
  @ApiResponse({
    status: 200,
    description: 'Task integrations retrieved successfully',
  })
  async getUserTaskIntegrations(@Request() req) {
    return this.taskIntegrationService.getUserTaskIntegrations(req.user.id);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get task integration by ID' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 200,
    description: 'Task integration retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async getTaskIntegrationById(@Request() req, @Param('id') id: string) {
    return this.taskIntegrationService.getTaskIntegrationById(req.user.id, id);
  }

  @Put('tasks/:id')
  @ApiOperation({ summary: 'Update task integration' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 200,
    description: 'Task integration updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async updateTaskIntegration(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateTaskIntegrationDto
  ) {
    return this.taskIntegrationService.updateTaskIntegration(
      req.user.id,
      id,
      updateDto
    );
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Delete task integration' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 204,
    description: 'Task integration deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTaskIntegration(@Request() req, @Param('id') id: string) {
    await this.taskIntegrationService.deleteTaskIntegration(req.user.id, id);
  }

  @Post('tasks/:id/sync')
  @ApiOperation({ summary: 'Sync tasks' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({ status: 200, description: 'Task sync initiated successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async syncTasks(@Param('id') id: string) {
    await this.taskIntegrationService.syncTasks(id);
    return { message: 'Task sync initiated successfully' };
  }

  @Get('tasks/:id/status')
  @ApiOperation({ summary: 'Get task sync status' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 200,
    description: 'Sync status retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async getTaskSyncStatus(@Param('id') id: string) {
    return this.taskIntegrationService.getTaskSyncStatus(id);
  }

  @Get('tasks/stats/overview')
  @ApiOperation({ summary: 'Get task integration statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getTaskIntegrationStats(@Request() req) {
    return this.taskIntegrationService.getTaskIntegrationStats(req.user.id);
  }

  // ===== SMART HOME INTEGRATIONS =====

  @Post('smart-home')
  @ApiOperation({ summary: 'Create a new smart home integration' })
  @ApiResponse({
    status: 201,
    description: 'Smart home integration created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - integration already exists',
  })
  async createSmartHomeIntegration(
    @Request() req,
    @Body() createDto: CreateSmartHomeIntegrationDto
  ) {
    return this.smartHomeIntegrationService.createSmartHomeIntegration(
      req.user.id,
      createDto
    );
  }

  @Get('smart-home')
  @ApiOperation({ summary: 'Get user smart home integrations' })
  @ApiResponse({
    status: 200,
    description: 'Smart home integrations retrieved successfully',
  })
  async getUserSmartHomeIntegrations(@Request() req) {
    return this.smartHomeIntegrationService.getUserSmartHomeIntegrations(
      req.user.id
    );
  }

  @Get('smart-home/:id')
  @ApiOperation({ summary: 'Get smart home integration by ID' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 200,
    description: 'Smart home integration retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async getSmartHomeIntegrationById(@Request() req, @Param('id') id: string) {
    return this.smartHomeIntegrationService.getSmartHomeIntegrationById(
      req.user.id,
      id
    );
  }

  @Put('smart-home/:id')
  @ApiOperation({ summary: 'Update smart home integration' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 200,
    description: 'Smart home integration updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async updateSmartHomeIntegration(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateSmartHomeIntegrationDto
  ) {
    return this.smartHomeIntegrationService.updateSmartHomeIntegration(
      req.user.id,
      id,
      updateDto
    );
  }

  @Delete('smart-home/:id')
  @ApiOperation({ summary: 'Delete smart home integration' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 204,
    description: 'Smart home integration deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSmartHomeIntegration(@Request() req, @Param('id') id: string) {
    await this.smartHomeIntegrationService.deleteSmartHomeIntegration(
      req.user.id,
      id
    );
  }

  @Post('smart-home/:id/sync')
  @ApiOperation({ summary: 'Sync smart home devices' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 200,
    description: 'Device sync initiated successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async syncSmartHomeDevices(@Param('id') id: string) {
    await this.smartHomeIntegrationService.syncDevices(id);
    return { message: 'Device sync initiated successfully' };
  }

  @Post('smart-home/:id/automation')
  @ApiOperation({ summary: 'Add automation rule' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 201,
    description: 'Automation rule created successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async addAutomationRule(@Param('id') id: string, @Body() rule: any) {
    return this.smartHomeIntegrationService.addAutomationRule(id, rule);
  }

  @Put('smart-home/:id/automation/:ruleId')
  @ApiOperation({ summary: 'Update automation rule' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID' })
  @ApiResponse({
    status: 200,
    description: 'Automation rule updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration or rule not found' })
  async updateAutomationRule(
    @Param('id') id: string,
    @Param('ruleId') ruleId: string,
    @Body() updates: any
  ) {
    return this.smartHomeIntegrationService.updateAutomationRule(
      id,
      ruleId,
      updates
    );
  }

  @Delete('smart-home/:id/automation/:ruleId')
  @ApiOperation({ summary: 'Delete automation rule' })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiParam({ name: 'ruleId', description: 'Rule ID' })
  @ApiResponse({
    status: 204,
    description: 'Automation rule deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration or rule not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAutomationRule(
    @Param('id') id: string,
    @Param('ruleId') ruleId: string
  ) {
    await this.smartHomeIntegrationService.deleteAutomationRule(id, ruleId);
  }

  @Get('smart-home/dashboard/overview')
  @ApiOperation({ summary: 'Get smart home dashboard overview' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getSmartHomeDashboard(@Request() req) {
    return this.smartHomeIntegrationService.getSmartHomeDashboard(req.user.id);
  }

  // ===== OVERALL INTEGRATION ECOSYSTEM =====

  @Get('overview')
  @ApiOperation({ summary: 'Get integration ecosystem overview' })
  @ApiResponse({ status: 200, description: 'Overview retrieved successfully' })
  async getIntegrationEcosystemOverview(@Request() req) {
    const [calendarIntegrations, taskIntegrations, smartHomeIntegrations] =
      await Promise.all([
        this.calendarIntegrationService.getUserCalendarIntegrations(
          req.user.id
        ),
        this.taskIntegrationService.getUserTaskIntegrations(req.user.id),
        this.smartHomeIntegrationService.getUserSmartHomeIntegrations(
          req.user.id
        ),
      ]);

    const [taskStats, smartHomeStats] = await Promise.all([
      this.taskIntegrationService.getTaskIntegrationStats(req.user.id),
      this.smartHomeIntegrationService.getSmartHomeDashboard(req.user.id),
    ]);

    return {
      summary: {
        totalIntegrations:
          calendarIntegrations.length +
          taskIntegrations.length +
          smartHomeIntegrations.length,
        activeIntegrations:
          calendarIntegrations.filter((i) => i.isActive).length +
          taskIntegrations.filter((i) => i.isActive).length +
          smartHomeIntegrations.filter((i) => i.isActive).length,
      },
      calendar: {
        integrations: calendarIntegrations.length,
        active: calendarIntegrations.filter((i) => i.isActive).length,
      },
      tasks: {
        integrations: taskIntegrations.length,
        active: taskIntegrations.filter((i) => i.isActive).length,
        totalTasks: taskStats.totalTasks,
        lastSync: taskStats.lastSync,
      },
      smartHome: {
        integrations: smartHomeIntegrations.length,
        active: smartHomeIntegrations.filter((i) => i.isActive).length,
        totalDevices: smartHomeStats.totalDevices,
        totalAutomations: smartHomeStats.totalAutomations,
        activeAutomations: smartHomeStats.activeAutomations,
      },
    };
  }
}
