import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { CalendarProvider, CalendarSyncStatus, CalendarEventType } from '../../../database/entities/calendar-integration.entity';

export class WorkingHoursDto {
  @ApiProperty({ description: 'Start time in HH:mm format', example: '09:00' })
  @IsString()
  start: string;

  @ApiProperty({ description: 'End time in HH:mm format', example: '17:00' })
  @IsString()
  end: string;

  @ApiProperty({ description: 'Working days (0-6, Sunday-Saturday)', example: [1, 2, 3, 4, 5] })
  @IsArray()
  @IsNumber({}, { each: true })
  days: number[];
}

export class SyncSettingsDto {
  @ApiProperty({ description: 'Whether to sync habits to calendar' })
  @IsBoolean()
  syncHabits: boolean;

  @ApiProperty({ description: 'Whether to sync goals to calendar' })
  @IsBoolean()
  syncGoals: boolean;

  @ApiProperty({ description: 'Whether to sync milestones to calendar' })
  @IsBoolean()
  syncMilestones: boolean;

  @ApiProperty({ description: 'Whether to sync reminders to calendar' })
  @IsBoolean()
  syncReminders: boolean;

  @ApiProperty({ description: 'Whether to automatically create calendar events' })
  @IsBoolean()
  autoCreateEvents: boolean;

  @ApiProperty({ description: 'Default event duration in minutes', example: 30 })
  @IsNumber()
  eventDuration: number;

  @ApiProperty({ description: 'Buffer time before/after events in minutes', example: 5 })
  @IsNumber()
  bufferTime: number;

  @ApiProperty({ description: 'Working hours configuration' })
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours: WorkingHoursDto;
}

export class CreateCalendarIntegrationDto {
  @ApiProperty({ description: 'Calendar provider', enum: CalendarProvider })
  @IsEnum(CalendarProvider)
  provider: CalendarProvider;

  @ApiProperty({ description: 'External calendar ID' })
  @IsString()
  externalCalendarId: string;

  @ApiProperty({ description: 'Calendar name' })
  @IsString()
  calendarName: string;

  @ApiProperty({ description: 'Calendar description', required: false })
  @IsOptional()
  @IsString()
  calendarDescription?: string;

  @ApiProperty({ description: 'Calendar color', required: false })
  @IsOptional()
  @IsString()
  calendarColor?: string;

  @ApiProperty({ description: 'Timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'Sync settings', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SyncSettingsDto)
  syncSettings?: SyncSettingsDto;
}

export class UpdateCalendarIntegrationDto {
  @ApiProperty({ description: 'Calendar name', required: false })
  @IsOptional()
  @IsString()
  calendarName?: string;

  @ApiProperty({ description: 'Calendar description', required: false })
  @IsOptional()
  @IsString()
  calendarDescription?: string;

  @ApiProperty({ description: 'Calendar color', required: false })
  @IsOptional()
  @IsString()
  calendarColor?: string;

  @ApiProperty({ description: 'Timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'Sync status', enum: CalendarSyncStatus, required: false })
  @IsOptional()
  @IsEnum(CalendarSyncStatus)
  syncStatus?: CalendarSyncStatus;

  @ApiProperty({ description: 'Sync settings', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SyncSettingsDto)
  syncSettings?: SyncSettingsDto;

  @ApiProperty({ description: 'Whether the integration is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CalendarIntegrationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: CalendarProvider })
  provider: CalendarProvider;

  @ApiProperty()
  externalCalendarId: string;

  @ApiProperty()
  calendarName: string;

  @ApiProperty({ required: false })
  calendarDescription?: string;

  @ApiProperty({ required: false })
  calendarColor?: string;

  @ApiProperty({ required: false })
  timezone?: string;

  @ApiProperty({ enum: CalendarSyncStatus })
  syncStatus: CalendarSyncStatus;

  @ApiProperty()
  syncSettings: SyncSettingsDto;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  lastSyncAt?: Date;

  @ApiProperty()
  nextSyncAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
