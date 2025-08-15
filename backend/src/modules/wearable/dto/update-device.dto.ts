import {
  IsEnum,
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ConnectionStatus } from '../../../database/entities/wearable-device.entity';

export class UpdateDeviceDto {
  @ApiPropertyOptional({
    description: 'Display name for the device',
    example: 'My Updated Fitbit',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Device model information',
    example: 'Charge 5',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Connection status of the device',
    enum: ConnectionStatus,
    example: ConnectionStatus.CONNECTED,
  })
  @IsOptional()
  @IsEnum(ConnectionStatus)
  status?: ConnectionStatus;

  @ApiPropertyOptional({
    description: 'Device capabilities',
    example: ['steps', 'heart_rate', 'sleep', 'calories'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  capabilities?: string[];

  @ApiPropertyOptional({
    description: 'Additional device metadata',
    example: { firmware: '1.2.4', battery: 90 },
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
      weight: true,
      bloodPressure: false,
      glucose: false,
      oxygenSaturation: false,
      temperature: false,
      customMetrics: ['stress', 'mood'],
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

  @ApiPropertyOptional({
    description: 'Whether the device is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Error message if device has issues',
    example: 'Connection timeout',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;
}
