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
import { WearableDevicesService } from './wearable-devices.service';
import { HealthDataService } from './health-data.service';
import { WearableIntegrationsService } from './wearable-integrations.service';
import { ConnectDeviceDto } from './dto/connect-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { HealthDataQueryDto } from './dto/health-data-query.dto';
import { Request } from 'express';

@ApiTags('Wearable Devices & Health Data')
@Controller('wearable')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WearableController {
  constructor(
    private readonly wearableDevicesService: WearableDevicesService,
    private readonly healthDataService: HealthDataService,
    private readonly wearableIntegrationsService: WearableIntegrationsService
  ) {}

  // ===== WEARABLE DEVICES =====

  @Post('devices')
  @ApiOperation({ summary: 'Connect a new wearable device' })
  @ApiResponse({ status: 201, description: 'Device connected successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 409,
    description: 'Device already exists for this provider',
  })
  async connectDevice(
    @Req() req: Request,
    @Body() connectDeviceDto: ConnectDeviceDto
  ) {
    const userId = (req.user as any).id;
    return this.wearableDevicesService.create(userId, connectDeviceDto);
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get all user wearable devices' })
  @ApiResponse({
    status: 200,
    description: 'List of devices retrieved successfully',
  })
  async getDevices(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.wearableDevicesService.findAll(userId);
  }

  @Get('devices/connected')
  @ApiOperation({ summary: 'Get all connected wearable devices' })
  @ApiResponse({
    status: 200,
    description: 'List of connected devices retrieved successfully',
  })
  async getConnectedDevices(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.wearableDevicesService.getConnectedDevices(userId);
  }

  @Get('devices/:id')
  @ApiOperation({ summary: 'Get a specific wearable device' })
  @ApiResponse({ status: 200, description: 'Device retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async getDevice(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const userId = (req.user as any).id;
    return this.wearableDevicesService.findOne(userId, id);
  }

  @Get('devices/:id/stats')
  @ApiOperation({ summary: 'Get device statistics and data summary' })
  @ApiResponse({
    status: 200,
    description: 'Device stats retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async getDeviceStats(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = (req.user as any).id;
    return this.wearableDevicesService.getDeviceStats(userId, id);
  }

  @Patch('devices/:id')
  @ApiOperation({ summary: 'Update wearable device settings' })
  @ApiResponse({ status: 200, description: 'Device updated successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async updateDevice(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto
  ) {
    const userId = (req.user as any).id;
    return this.wearableDevicesService.update(userId, id, updateDeviceDto);
  }

  @Delete('devices/:id')
  @ApiOperation({ summary: 'Remove a wearable device' })
  @ApiResponse({ status: 200, description: 'Device removed successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async removeDevice(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = (req.user as any).id;
    return this.wearableDevicesService.remove(userId, id);
  }

  @Post('devices/:id/refresh')
  @ApiOperation({ summary: 'Refresh device connection' })
  @ApiResponse({
    status: 200,
    description: 'Device connection refreshed successfully',
  })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async refreshDeviceConnection(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = (req.user as any).id;
    return this.wearableDevicesService.refreshDeviceConnection(userId, id);
  }

  @Get('devices/summary/health')
  @ApiOperation({ summary: 'Get overall device health summary' })
  @ApiResponse({
    status: 200,
    description: 'Device health summary retrieved successfully',
  })
  async getDeviceHealthSummary(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.wearableDevicesService.getDeviceHealthSummary(userId);
  }

  // ===== HEALTH DATA =====

  @Get('health-data')
  @ApiOperation({ summary: 'Get health data with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Health data retrieved successfully',
  })
  async getHealthData(@Req() req: Request, @Query() query: HealthDataQueryDto) {
    const userId = (req.user as any).id;
    return this.healthDataService.findAll(userId, query);
  }

  @Get('health-data/:id')
  @ApiOperation({ summary: 'Get specific health data entry' })
  @ApiResponse({
    status: 200,
    description: 'Health data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Health data not found' })
  async getHealthDataEntry(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = (req.user as any).id;
    return this.healthDataService.findOne(userId, id);
  }

  @Get('health-data/summary')
  @ApiOperation({ summary: 'Get health data summary and statistics' })
  @ApiResponse({
    status: 200,
    description: 'Health data summary retrieved successfully',
  })
  async getHealthDataSummary(
    @Req() req: Request,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const userId = (req.user as any).id;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.healthDataService.getDataSummary(userId, start, end);
  }

  @Get('health-data/type/:type')
  @ApiOperation({ summary: 'Get health data by specific type' })
  @ApiResponse({
    status: 200,
    description: 'Health data by type retrieved successfully',
  })
  async getHealthDataByType(
    @Req() req: Request,
    @Param('type') type: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number
  ) {
    const userId = (req.user as any).id;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.healthDataService.getDataByType(
      userId,
      type as any,
      start,
      end,
      limit
    );
  }

  @Get('health-data/latest')
  @ApiOperation({ summary: 'Get latest health data entries' })
  @ApiResponse({
    status: 200,
    description: 'Latest health data retrieved successfully',
  })
  async getLatestHealthData(@Req() req: Request, @Query('type') type?: string) {
    const userId = (req.user as any).id;
    return this.healthDataService.getLatestData(userId, type as any);
  }

  @Get('health-data/trends/:type')
  @ApiOperation({ summary: 'Get health data trends over time' })
  @ApiResponse({
    status: 200,
    description: 'Health data trends retrieved successfully',
  })
  async getHealthDataTrends(
    @Req() req: Request,
    @Param('type') type: string,
    @Query('days') days?: number,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month'
  ) {
    const userId = (req.user as any).id;
    return this.healthDataService.getDataTrends(
      userId,
      type as any,
      days,
      groupBy
    );
  }

  @Post('health-data/:id/process')
  @ApiOperation({ summary: 'Process health data to generate insights' })
  @ApiResponse({
    status: 200,
    description: 'Health data processed successfully',
  })
  @ApiResponse({ status: 404, description: 'Health data not found' })
  async processHealthData(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = (req.user as any).id;
    return this.healthDataService.processData(userId, id);
  }

  @Get('health-data/insights')
  @ApiOperation({ summary: 'Get processed health data insights' })
  @ApiResponse({
    status: 200,
    description: 'Health data insights retrieved successfully',
  })
  async getHealthDataInsights(
    @Req() req: Request,
    @Query('days') days?: number
  ) {
    const userId = (req.user as any).id;
    return this.healthDataService.getDataInsights(userId, days);
  }

  // ===== WEARABLE INTEGRATIONS =====

  @Get('integrations')
  @ApiOperation({ summary: 'Get all wearable integrations' })
  @ApiResponse({
    status: 200,
    description: 'Integrations retrieved successfully',
  })
  async getIntegrations(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.wearableIntegrationsService.findAll(userId);
  }

  @Get('integrations/:id')
  @ApiOperation({ summary: 'Get specific wearable integration' })
  @ApiResponse({
    status: 200,
    description: 'Integration retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async getIntegration(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = (req.user as any).id;
    return this.wearableIntegrationsService.findOne(userId, id);
  }

  @Get('integrations/summary')
  @ApiOperation({ summary: 'Get integration summary and statistics' })
  @ApiResponse({
    status: 200,
    description: 'Integration summary retrieved successfully',
  })
  async getIntegrationSummary(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.wearableIntegrationsService.getIntegrationSummary(userId);
  }

  @Get('providers')
  @ApiOperation({ summary: 'Get available wearable providers' })
  @ApiResponse({ status: 200, description: 'Providers retrieved successfully' })
  async getAvailableProviders() {
    return this.wearableIntegrationsService.getAvailableProviders();
  }

  @Get('providers/:provider')
  @ApiOperation({ summary: 'Get provider configuration and details' })
  @ApiResponse({
    status: 200,
    description: 'Provider configuration retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  async getProviderConfig(@Param('provider') provider: string) {
    return this.wearableIntegrationsService.getProviderConfig(provider);
  }

  @Post('integrations/:id/test')
  @ApiOperation({ summary: 'Test integration connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async testIntegration(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = (req.user as any).id;
    return this.wearableIntegrationsService.testConnection(userId, id);
  }

  @Post('integrations/:id/refresh-token')
  @ApiOperation({ summary: 'Refresh integration access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async refreshToken(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = (req.user as any).id;
    return this.wearableIntegrationsService.refreshToken(userId, id);
  }

  @Patch('integrations/:id/sync-settings')
  @ApiOperation({ summary: 'Update integration sync settings' })
  @ApiResponse({
    status: 200,
    description: 'Sync settings updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async updateSyncSettings(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() syncSettings: any
  ) {
    const userId = (req.user as any).id;
    return this.wearableIntegrationsService.updateSyncSettings(
      userId,
      id,
      syncSettings
    );
  }

  @Patch('integrations/:id/sync-frequency')
  @ApiOperation({ summary: 'Update integration sync frequency' })
  @ApiResponse({
    status: 200,
    description: 'Sync frequency updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async updateSyncFrequency(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body('syncFrequency') syncFrequency: string
  ) {
    const userId = (req.user as any).id;
    return this.wearableIntegrationsService.updateSyncFrequency(
      userId,
      id,
      syncFrequency as any
    );
  }

  @Delete('integrations/:id')
  @ApiOperation({ summary: 'Remove wearable integration' })
  @ApiResponse({ status: 200, description: 'Integration removed successfully' })
  @ApiResponse({ status: 404, description: 'Integration not found' })
  async removeIntegration(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = (req.user as any).id;
    return this.wearableIntegrationsService.remove(userId, id);
  }
}
