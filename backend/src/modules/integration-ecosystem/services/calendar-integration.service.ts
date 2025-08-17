import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarIntegration, CalendarProvider, CalendarSyncStatus, CalendarEventType } from '../../../database/entities/calendar-integration.entity';
import { CreateCalendarIntegrationDto, UpdateCalendarIntegrationDto, CalendarIntegrationResponseDto } from '../dto/calendar-integration.dto';

@Injectable()
export class CalendarIntegrationService {
  constructor(
    @InjectRepository(CalendarIntegration)
    private calendarIntegrationRepository: Repository<CalendarIntegration>,
  ) {}

  async createCalendarIntegration(
    userId: string,
    createDto: CreateCalendarIntegrationDto,
  ): Promise<CalendarIntegrationResponseDto> {
    // Check if user already has an integration with this provider
    const existingIntegration = await this.calendarIntegrationRepository.findOne({
      where: { userId, provider: createDto.provider },
    });

    if (existingIntegration) {
      throw new BadRequestException(`Integration with ${createDto.provider} already exists`);
    }

    // Create default sync settings if not provided
    const defaultSyncSettings = {
      syncHabits: true,
      syncGoals: true,
      syncMilestones: true,
      syncReminders: true,
      autoCreateEvents: true,
      eventDuration: 30,
      bufferTime: 5,
      workingHours: {
        start: '09:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5], // Monday to Friday
      },
    };

    const integration = this.calendarIntegrationRepository.create({
      userId,
      ...createDto,
      syncSettings: createDto.syncSettings || defaultSyncSettings,
      syncStatus: CalendarSyncStatus.ACTIVE,
      isActive: true,
    });

    const savedIntegration = await this.calendarIntegrationRepository.save(integration);
    return this.mapToResponseDto(savedIntegration);
  }

  async getUserCalendarIntegrations(userId: string): Promise<CalendarIntegrationResponseDto[]> {
    const integrations = await this.calendarIntegrationRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    return integrations.map(integration => this.mapToResponseDto(integration));
  }

  async getCalendarIntegrationById(
    userId: string,
    integrationId: string,
  ): Promise<CalendarIntegrationResponseDto> {
    const integration = await this.calendarIntegrationRepository.findOne({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Calendar integration not found');
    }

    return this.mapToResponseDto(integration);
  }

  async updateCalendarIntegration(
    userId: string,
    integrationId: string,
    updateDto: UpdateCalendarIntegrationDto,
  ): Promise<CalendarIntegrationResponseDto> {
    const integration = await this.calendarIntegrationRepository.findOne({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Calendar integration not found');
    }

    // Update the integration
    Object.assign(integration, updateDto);
    const updatedIntegration = await this.calendarIntegrationRepository.save(integration);

    return this.mapToResponseDto(updatedIntegration);
  }

  async deleteCalendarIntegration(userId: string, integrationId: string): Promise<void> {
    const integration = await this.calendarIntegrationRepository.findOne({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Calendar integration not found');
    }

    await this.calendarIntegrationRepository.remove(integration);
  }

  async syncCalendarEvents(integrationId: string): Promise<void> {
    const integration = await this.calendarIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException('Calendar integration not found');
    }

    try {
      // Update sync status and timestamp
      integration.syncStatus = CalendarSyncStatus.ACTIVE;
      integration.lastSyncAt = new Date();
      integration.nextSyncAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Next sync in 24 hours

      await this.calendarIntegrationRepository.save(integration);

      // TODO: Implement actual calendar sync logic based on provider
      // This would involve calling the respective calendar API
      await this.performCalendarSync(integration);
    } catch (error) {
      integration.syncStatus = CalendarSyncStatus.ERROR;
      integration.metadata = {
        ...integration.metadata,
        syncErrors: [...(integration.metadata?.syncErrors || []), error.message],
      };
      await this.calendarIntegrationRepository.save(integration);
      throw error;
    }
  }

  async createCalendarEvent(
    integrationId: string,
    eventData: {
      title: string;
      description?: string;
      startTime: Date;
      endTime: Date;
      eventType: CalendarEventType;
      habitId?: string;
      goalId?: string;
    },
  ): Promise<void> {
    const integration = await this.calendarIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException('Calendar integration not found');
    }

    if (!integration.syncSettings.autoCreateEvents) {
      return; // Auto-creation is disabled
    }

    // TODO: Implement actual event creation based on provider
    // This would involve calling the respective calendar API
    await this.createEventInCalendar(integration, eventData);
  }

  async getCalendarSyncStatus(integrationId: string): Promise<{
    status: CalendarSyncStatus;
    lastSync: Date | null;
    nextSync: Date | null;
    errorCount: number;
  }> {
    const integration = await this.calendarIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException('Calendar integration not found');
    }

    return {
      status: integration.syncStatus,
      lastSync: integration.lastSyncAt || null,
      nextSync: integration.nextSyncAt || null,
      errorCount: integration.metadata?.syncErrors?.length || 0,
    };
  }

  private async performCalendarSync(integration: CalendarIntegration): Promise<void> {
    // Mock implementation - in real app, this would call the respective calendar API
    switch (integration.provider) {
      case CalendarProvider.GOOGLE:
        // Call Google Calendar API
        break;
      case CalendarProvider.OUTLOOK:
        // Call Microsoft Graph API
        break;
      case CalendarProvider.APPLE:
        // Call Apple Calendar API
        break;
      default:
        // Handle other providers
        break;
    }
  }

  private async createEventInCalendar(
    integration: CalendarIntegration,
    eventData: any,
  ): Promise<void> {
    // Mock implementation - in real app, this would create events in the respective calendar
    switch (integration.provider) {
      case CalendarProvider.GOOGLE:
        // Create event in Google Calendar
        break;
      case CalendarProvider.OUTLOOK:
        // Create event in Outlook Calendar
        break;
      case CalendarProvider.APPLE:
        // Create event in Apple Calendar
        break;
      default:
        // Handle other providers
        break;
    }
  }

  private mapToResponseDto(integration: CalendarIntegration): CalendarIntegrationResponseDto {
    return {
      id: integration.id,
      userId: integration.userId,
      provider: integration.provider,
      externalCalendarId: integration.externalCalendarId,
      calendarName: integration.calendarName,
      calendarDescription: integration.calendarDescription,
      calendarColor: integration.calendarColor,
      timezone: integration.timezone,
      syncStatus: integration.syncStatus,
      syncSettings: integration.syncSettings,
      isActive: integration.isActive,
      lastSyncAt: integration.lastSyncAt,
      nextSyncAt: integration.nextSyncAt,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  }
}
