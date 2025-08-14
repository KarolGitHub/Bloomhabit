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
import { NotificationsService } from './notifications.service';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { PushService } from './push.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushSubscriptionsService: PushSubscriptionsService,
    private readonly pushService: PushService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for the authenticated user' })
  @ApiQuery({ name: 'status', required: false, enum: ['unread', 'read', 'archived'] })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  async findAll(@Request() req: any, @Query('status') status?: string) {
    if (status === 'unread') {
      return this.notificationsService.findUnread(req.user.id);
    }
    return this.notificationsService.findAll(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Notification statistics retrieved successfully',
  })
  async getStats(@Request() req: any) {
    return this.notificationsService.getNotificationStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.findOne(+id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
  })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Request() req: any,
  ) {
    return this.notificationsService.create(req.user.id, createNotificationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Request() req: any,
  ) {
    return this.notificationsService.update(+id, req.user.id, updateNotificationDto);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
  })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(+id, req.user.id);
  }

  @Put('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.remove(+id, req.user.id);
  }

  // Push Subscription endpoints
  @Get('push/subscriptions')
  @ApiOperation({ summary: 'Get all push subscriptions for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Push subscriptions retrieved successfully',
  })
  async getPushSubscriptions(@Request() req: any) {
    return this.pushSubscriptionsService.findAll(req.user.id);
  }

  @Post('push/subscriptions')
  @ApiOperation({ summary: 'Create a new push subscription' })
  @ApiResponse({
    status: 201,
    description: 'Push subscription created successfully',
  })
  async createPushSubscription(
    @Body() createPushSubscriptionDto: CreatePushSubscriptionDto,
    @Request() req: any,
  ) {
    return this.pushSubscriptionsService.create(req.user.id, createPushSubscriptionDto);
  }

  @Put('push/subscriptions/:id')
  @ApiOperation({ summary: 'Update a push subscription' })
  @ApiParam({ name: 'id', description: 'Push subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Push subscription updated successfully',
  })
  async updatePushSubscription(
    @Param('id') id: string,
    @Body() updateData: Partial<CreatePushSubscriptionDto>,
    @Request() req: any,
  ) {
    return this.pushSubscriptionsService.update(+id, req.user.id, updateData);
  }

  @Put('push/subscriptions/:id/preferences')
  @ApiOperation({ summary: 'Update push subscription preferences' })
  @ApiParam({ name: 'id', description: 'Push subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Push subscription preferences updated successfully',
  })
  async updatePushPreferences(
    @Param('id') id: string,
    @Body() preferences: any,
    @Request() req: any,
  ) {
    return this.pushSubscriptionsService.updatePreferences(+id, req.user.id, preferences);
  }

  @Delete('push/subscriptions/:id')
  @ApiOperation({ summary: 'Delete a push subscription' })
  @ApiParam({ name: 'id', description: 'Push subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Push subscription deleted successfully',
  })
  async removePushSubscription(@Param('id') id: string, @Request() req: any) {
    return this.pushSubscriptionsService.remove(+id, req.user.id);
  }

  @Get('push/vapid-public-key')
  @ApiOperation({ summary: 'Get VAPID public key for push notifications' })
  @ApiResponse({
    status: 200,
    description: 'VAPID public key retrieved successfully',
  })
  async getVapidPublicKey() {
    return { publicKey: this.pushService.getVapidPublicKey() };
  }
}
