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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrivacySettingsService } from '../services/privacy-settings.service';
import { AuditLogService } from '../services/audit-log.service';
import { DataRequestService } from '../services/data-request.service';
import { SecurityService } from '../services/security.service';
import {
  CreatePrivacySettingsDto,
  UpdatePrivacySettingsDto,
} from '../dto/privacy-settings.dto';
import {
  CreateDataRequestDto,
  UpdateDataRequestDto,
  DataRequestFilterDto,
} from '../dto/data-request.dto';
import { AuditLogFilterDto } from '../dto/audit-log.dto';

@ApiTags('Data & Privacy')
@Controller('data-privacy')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DataPrivacyController {
  constructor(
    private readonly privacySettingsService: PrivacySettingsService,
    private readonly auditLogService: AuditLogService,
    private readonly dataRequestService: DataRequestService,
    private readonly securityService: SecurityService
  ) {}

  // Privacy Settings Endpoints
  @Get('privacy-settings')
  @ApiOperation({ summary: 'Get user privacy settings' })
  @ApiResponse({
    status: 200,
    description: 'Privacy settings retrieved successfully',
  })
  async getUserPrivacySettings(@Request() req) {
    return this.privacySettingsService.getUserPrivacySettings(req.user.id);
  }

  @Post('privacy-settings')
  @ApiOperation({ summary: 'Create user privacy settings' })
  @ApiResponse({
    status: 201,
    description: 'Privacy settings created successfully',
  })
  async createPrivacySettings(
    @Request() req,
    @Body() createDto: CreatePrivacySettingsDto
  ) {
    return this.privacySettingsService.createPrivacySettings(
      req.user.id,
      createDto
    );
  }

  @Put('privacy-settings')
  @ApiOperation({ summary: 'Update user privacy settings' })
  @ApiResponse({
    status: 200,
    description: 'Privacy settings updated successfully',
  })
  async updatePrivacySettings(
    @Request() req,
    @Body() updateDto: UpdatePrivacySettingsDto
  ) {
    return this.privacySettingsService.updatePrivacySettings(
      req.user.id,
      updateDto
    );
  }

  @Put('privacy-settings/consent/:consentType')
  @ApiOperation({ summary: 'Update specific consent setting' })
  @ApiResponse({ status: 200, description: 'Consent updated successfully' })
  async updateConsent(
    @Request() req,
    @Param('consentType') consentType: string,
    @Body() body: { granted: boolean }
  ) {
    return this.privacySettingsService.updateConsent(
      req.user.id,
      consentType,
      body.granted
    );
  }

  @Post('privacy-settings/data-portability')
  @ApiOperation({ summary: 'Enable data portability' })
  @ApiResponse({
    status: 200,
    description: 'Data portability enabled successfully',
  })
  async enableDataPortability(@Request() req) {
    return this.privacySettingsService.enableDataPortability(req.user.id);
  }

  @Post('privacy-settings/right-to-be-forgotten')
  @ApiOperation({ summary: 'Request right to be forgotten' })
  @ApiResponse({
    status: 200,
    description: 'Right to be forgotten requested successfully',
  })
  async requestRightToBeForgotten(@Request() req) {
    return this.privacySettingsService.requestRightToBeForgotten(req.user.id);
  }

  @Get('privacy-settings/summary')
  @ApiOperation({ summary: 'Get privacy settings summary' })
  @ApiResponse({
    status: 200,
    description: 'Privacy summary retrieved successfully',
  })
  async getPrivacySummary(@Request() req) {
    return this.privacySettingsService.getPrivacySettingsSummary(req.user.id);
  }

  // Data Request Endpoints
  @Post('data-requests')
  @ApiOperation({ summary: 'Create a new data request' })
  @ApiResponse({
    status: 201,
    description: 'Data request created successfully',
  })
  async createDataRequest(
    @Request() req,
    @Body() createDto: CreateDataRequestDto
  ) {
    return this.dataRequestService.createDataRequest(req.user.id, createDto);
  }

  @Get('data-requests')
  @ApiOperation({ summary: 'Get user data requests' })
  @ApiResponse({
    status: 200,
    description: 'Data requests retrieved successfully',
  })
  @ApiQuery({
    name: 'requestType',
    required: false,
    enum: [
      'data_portability',
      'right_to_be_forgotten',
      'data_correction',
      'data_deletion',
      'consent_withdrawal',
    ],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
  })
  async getUserDataRequests(
    @Request() req,
    @Query() filter: DataRequestFilterDto
  ) {
    return this.dataRequestService.getUserDataRequests(req.user.id, filter);
  }

  @Get('data-requests/:id')
  @ApiOperation({ summary: 'Get specific data request' })
  @ApiResponse({
    status: 200,
    description: 'Data request retrieved successfully',
  })
  async getDataRequest(@Param('id') id: string) {
    return this.dataRequestService.getDataRequestById(id);
  }

  @Put('data-requests/:id')
  @ApiOperation({ summary: 'Update data request' })
  @ApiResponse({
    status: 200,
    description: 'Data request updated successfully',
  })
  async updateDataRequest(
    @Param('id') id: string,
    @Body() updateDto: UpdateDataRequestDto
  ) {
    return this.dataRequestService.updateDataRequest(id, updateDto);
  }

  @Delete('data-requests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel data request' })
  @ApiResponse({
    status: 204,
    description: 'Data request cancelled successfully',
  })
  async cancelDataRequest(@Param('id') id: string) {
    return this.dataRequestService.cancelDataRequest(id);
  }

  @Post('data-requests/:id/retry')
  @ApiOperation({ summary: 'Retry failed data request' })
  @ApiResponse({
    status: 200,
    description: 'Data request retry initiated successfully',
  })
  async retryDataRequest(@Param('id') id: string) {
    return this.dataRequestService.retryDataRequest(id);
  }

  @Get('data-requests/stats/summary')
  @ApiOperation({ summary: 'Get data request statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getDataRequestStats(@Request() req) {
    return this.dataRequestService.getDataRequestStats(req.user.id);
  }

  // Audit Log Endpoints
  @Get('audit-logs')
  @ApiOperation({ summary: 'Get user audit logs' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({
    name: 'severity',
    required: false,
    enum: ['low', 'medium', 'high', 'critical'],
  })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getUserAuditLogs(@Request() req, @Query() filter: AuditLogFilterDto) {
    return this.auditLogService.getUserAuditLogs(
      req.user.id,
      filter.limit || 100
    );
  }

  @Get('audit-logs/summary')
  @ApiOperation({ summary: 'Get audit log summary' })
  @ApiResponse({
    status: 200,
    description: 'Audit summary retrieved successfully',
  })
  async getAuditLogSummary(@Request() req, @Query() filter: AuditLogFilterDto) {
    return this.auditLogService.getAuditLogSummary(filter);
  }

  @Get('audit-logs/export')
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs exported successfully' })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['json', 'csv'],
    default: 'json',
  })
  async exportAuditLogs(
    @Request() req,
    @Query() filter: AuditLogFilterDto,
    @Query('format') format: 'json' | 'csv' = 'json'
  ) {
    return this.auditLogService.exportAuditLogs(filter, format);
  }

  // Security Endpoints
  @Get('security/events')
  @ApiOperation({ summary: 'Get security events' })
  @ApiResponse({
    status: 200,
    description: 'Security events retrieved successfully',
  })
  @ApiQuery({
    name: 'severity',
    required: false,
    enum: ['low', 'medium', 'high', 'critical'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['open', 'investigating', 'resolved', 'false_positive', 'escalated'],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSecurityEvents(
    @Request() req,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number
  ) {
    return this.securityService.getSecurityEvents(severity as any, limit);
  }

  @Get('security/dashboard')
  @ApiOperation({ summary: 'Get security dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Security dashboard retrieved successfully',
  })
  async getSecurityDashboard() {
    return this.securityService.getSecurityDashboard();
  }

  @Put('security/events/:id/status')
  @ApiOperation({ summary: 'Update security event status' })
  @ApiResponse({
    status: 200,
    description: 'Security event status updated successfully',
  })
  async updateSecurityEventStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string }
  ) {
    return this.securityService.updateSecurityEventStatus(
      id,
      body.status as any,
      body.notes
    );
  }

  @Put('security/events/:id/assign')
  @ApiOperation({ summary: 'Assign security event' })
  @ApiResponse({
    status: 200,
    description: 'Security event assigned successfully',
  })
  async assignSecurityEvent(
    @Param('id') id: string,
    @Body() body: { assignedTo: string }
  ) {
    return this.securityService.assignSecurityEvent(id, body.assignedTo);
  }

  // GDPR Compliance Endpoints
  @Get('gdpr/compliance-status')
  @ApiOperation({ summary: 'Get GDPR compliance status' })
  @ApiResponse({
    status: 200,
    description: 'Compliance status retrieved successfully',
  })
  async getGdprComplianceStatus(@Request() req) {
    const privacySettings =
      await this.privacySettingsService.getUserPrivacySettings(req.user.id);

    return {
      gdprCompliant: true,
      consentDate: privacySettings.gdprConsentDate,
      lastUpdated: privacySettings.lastConsentUpdate,
      dataRights: {
        dataPortability: privacySettings.dataPortabilityEnabled,
        rightToBeForgotten: privacySettings.rightToBeForgotten,
        consentWithdrawal: true,
        dataCorrection: true,
      },
      dataRetention: {
        personalData: '2 years',
        analyticsData: '1 year',
        auditLogs: '7 years for critical events',
        securityEvents: '5 years for high severity',
      },
    };
  }

  @Get('gdpr/data-inventory')
  @ApiOperation({ summary: 'Get data inventory for GDPR compliance' })
  @ApiResponse({
    status: 200,
    description: 'Data inventory retrieved successfully',
  })
  async getDataInventory(@Request() req) {
    return {
      personalData: {
        profile: ['email', 'name', 'preferences'],
        habits: ['habit names', 'descriptions', 'categories'],
        logs: ['completion dates', 'streaks', 'notes'],
        analytics: ['progress metrics', 'trends', 'insights'],
      },
      dataSources: {
        userInput: 'Direct user input',
        systemGenerated: 'Automated calculations',
        thirdParty: 'OAuth providers, analytics',
      },
      dataSharing: {
        internal: 'Within the application',
        thirdParty: 'Analytics, marketing (with consent)',
        legal: 'Law enforcement (when required)',
      },
      retentionPolicies: {
        userData: 'Until account deletion',
        analytics: '1 year (with consent)',
        auditLogs: '2-7 years based on severity',
      },
    };
  }

  // Privacy Controls Endpoints
  @Post('privacy-controls/validate-access')
  @ApiOperation({ summary: 'Validate data access based on privacy settings' })
  @ApiResponse({ status: 200, description: 'Access validation completed' })
  async validateDataAccess(
    @Request() req,
    @Body() body: { dataType: string; purpose: string }
  ) {
    const hasAccess = await this.privacySettingsService.validateDataAccess(
      req.user.id,
      body.dataType
    );

    return {
      hasAccess,
      dataType: body.dataType,
      purpose: body.purpose,
      timestamp: new Date(),
      userId: req.user.id,
    };
  }

  @Get('privacy-controls/data-sharing-level')
  @ApiOperation({ summary: 'Get current data sharing level' })
  @ApiResponse({
    status: 200,
    description: 'Data sharing level retrieved successfully',
  })
  async getDataSharingLevel(@Request() req) {
    const level = await this.privacySettingsService.getDataSharingLevel(
      req.user.id
    );

    return {
      dataSharingLevel: level,
      description: this.getDataSharingDescription(level),
      timestamp: new Date(),
    };
  }

  private getDataSharingDescription(level: string): string {
    switch (level) {
      case 'none':
        return 'No data sharing allowed';
      case 'anonymous':
        return 'Only anonymous, aggregated data';
      case 'aggregated':
        return 'Aggregated data with minimal personal information';
      case 'personal':
        return 'Personal data sharing allowed with consent';
      default:
        return 'Unknown sharing level';
    }
  }
}
