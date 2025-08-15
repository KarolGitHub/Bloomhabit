import {
  IsEnum,
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  WearableProvider,
  WearableType,
} from '../../../database/entities/wearable-device.entity';

export class ConnectDeviceDto {
  @ApiProperty({
    description: 'The wearable device provider (e.g., fitbit, apple_health)',
    enum: WearableProvider,
    example: WearableProvider.FITBIT,
  })
  @IsEnum(WearableProvider)
  provider: WearableProvider;

  @ApiProperty({
    description: 'The type of wearable device',
    enum: WearableType,
    example: WearableType.FITNESS_TRACKER,
  })
  @IsEnum(WearableType)
  type: WearableType;

  @ApiProperty({
    description: 'Display name for the device',
    example: 'My Fitbit Charge 5',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Device model information',
    example: 'Charge 5',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'External device ID from the provider',
    example: 'device_12345',
  })
  @IsOptional()
  @IsString()
  externalDeviceId?: string;

  @ApiPropertyOptional({
    description: 'Device capabilities',
    example: ['steps', 'heart_rate', 'sleep'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  capabilities?: string[];

  @ApiPropertyOptional({
    description: 'Additional device metadata',
    example: { firmware: '1.2.3', battery: 85 },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Sync settings for the device',
    example: {
      steps: true,
      heartRate: true,
      sleep: true,
      calories: true,
      distance: true,
      weight: false,
      bloodPressure: false,
      glucose: false,
      oxygenSaturation: false,
      temperature: false,
      customMetrics: [],
    },
  })
  @IsOptional()
  @IsObject()
  syncSettings?: {
    steps: boolean;
    heartRate: boolean;
    sleep: boolean;
    calories: boolean;
    distance: boolean;
    weight: boolean;
    bloodPressure: boolean;
    glucose: boolean;
    oxygenSaturation: boolean;
    temperature: boolean;
    customMetrics: string[];
  };
}
