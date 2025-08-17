import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { SmartHomeProvider, SmartHomeDeviceType, SmartHomeTriggerType, SmartHomeActionType } from '../../../database/entities/smart-home-integration.entity';

export class DeviceDto {
  @ApiProperty({ description: 'Device ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Device name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Device type', enum: SmartHomeDeviceType })
  @IsEnum(SmartHomeDeviceType)
  type: SmartHomeDeviceType;

  @ApiProperty({ description: 'Device capabilities', example: ['on_off', 'dimming'] })
  @IsArray()
  @IsString({ each: true })
  capabilities: string[];

  @ApiProperty({ description: 'Room location', required: false })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({ description: 'Whether device is online' })
  @IsBoolean()
  isOnline: boolean;
}

export class TriggerConditionsDto {
  @ApiProperty({ description: 'Habit ID for habit-based triggers', required: false })
  @IsOptional()
  @IsString()
  habitId?: string;

  @ApiProperty({ description: 'Goal ID for goal-based triggers', required: false })
  @IsOptional()
  @IsString()
  goalId?: string;

  @ApiProperty({ description: 'Time for time-based triggers', required: false })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({ description: 'Location for location-based triggers', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}

export class ActionDto {
  @ApiProperty({ description: 'Device ID to control' })
  @IsString()
  deviceId: string;

  @ApiProperty({ description: 'Action type', enum: SmartHomeActionType })
  @IsEnum(SmartHomeActionType)
  actionType: SmartHomeActionType;

  @ApiProperty({ description: 'Action parameters', required: false })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiProperty({ description: 'Delay before action in seconds', required: false })
  @IsOptional()
  @IsNumber()
  delay?: number;
}

export class AutomationRuleDto {
  @ApiProperty({ description: 'Rule name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Rule description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Trigger type', enum: SmartHomeTriggerType })
  @IsEnum(SmartHomeTriggerType)
  triggerType: SmartHomeTriggerType;

  @ApiProperty({ description: 'Trigger conditions' })
  @ValidateNested()
  @Type(() => TriggerConditionsDto)
  triggerConditions: TriggerConditionsDto;

  @ApiProperty({ description: 'Actions to perform' })
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions: ActionDto[];

  @ApiProperty({ description: 'Whether rule is active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Rule priority', example: 1 })
  @IsNumber()
  priority: number;
}

export class CreateSmartHomeIntegrationDto {
  @ApiProperty({ description: 'Smart home provider', enum: SmartHomeProvider })
  @IsEnum(SmartHomeProvider)
  provider: SmartHomeProvider;

  @ApiProperty({ description: 'External account ID' })
  @IsString()
  externalAccountId: string;

  @ApiProperty({ description: 'Account name' })
  @IsString()
  accountName: string;

  @ApiProperty({ description: 'Account description', required: false })
  @IsOptional()
  @IsString()
  accountDescription?: string;

  @ApiProperty({ description: 'Account icon', required: false })
  @IsOptional()
  @IsString()
  accountIcon?: string;
}

export class UpdateSmartHomeIntegrationDto {
  @ApiProperty({ description: 'Account name', required: false })
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiProperty({ description: 'Account description', required: false })
  @IsOptional()
  @IsString()
  accountDescription?: string;

  @ApiProperty({ description: 'Account icon', required: false })
  @IsOptional()
  @IsString()
  accountIcon?: string;

  @ApiProperty({ description: 'Whether the integration is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SmartHomeIntegrationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: SmartHomeProvider })
  provider: SmartHomeProvider;

  @ApiProperty()
  externalAccountId: string;

  @ApiProperty()
  accountName: string;

  @ApiProperty({ required: false })
  accountDescription?: string;

  @ApiProperty({ required: false })
  accountIcon?: string;

  @ApiProperty()
  devices: DeviceDto[];

  @ApiProperty()
  automationRules: AutomationRuleDto[];

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
