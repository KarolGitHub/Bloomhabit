import {
  IsEnum,
  IsBoolean,
  IsOptional,
  IsObject,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DataSharingLevel } from '../../../database/entities/privacy-settings.entity';

export class CreatePrivacySettingsDto {
  @ApiProperty({
    enum: DataSharingLevel,
    description: 'Level of data sharing allowed',
  })
  @IsEnum(DataSharingLevel)
  dataSharingLevel: DataSharingLevel;

  @ApiProperty({ description: 'Allow analytics data collection' })
  @IsBoolean()
  allowAnalytics: boolean;

  @ApiProperty({ description: 'Allow marketing communications' })
  @IsBoolean()
  allowMarketing: boolean;

  @ApiProperty({ description: 'Allow third-party data sharing' })
  @IsBoolean()
  allowThirdParty: boolean;

  @ApiProperty({ description: 'Allow location data collection' })
  @IsBoolean()
  allowLocationData: boolean;

  @ApiProperty({ description: 'Allow health data collection' })
  @IsBoolean()
  allowHealthData: boolean;

  @ApiProperty({ description: 'Allow social features and sharing' })
  @IsBoolean()
  allowSocialFeatures: boolean;

  @ApiProperty({ description: 'Allow essential cookies' })
  @IsBoolean()
  allowEssentialCookies: boolean;

  @ApiProperty({ description: 'Allow performance cookies' })
  @IsBoolean()
  allowPerformanceCookies: boolean;

  @ApiProperty({ description: 'Allow targeting cookies' })
  @IsBoolean()
  allowTargetingCookies: boolean;

  @ApiProperty({ description: 'Custom privacy preferences', required: false })
  @IsOptional()
  @IsObject()
  customPreferences?: Record<string, any>;
}

export class UpdatePrivacySettingsDto {
  @ApiProperty({ enum: DataSharingLevel, required: false })
  @IsOptional()
  @IsEnum(DataSharingLevel)
  dataSharingLevel?: DataSharingLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowAnalytics?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowMarketing?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowThirdParty?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowLocationData?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowHealthData?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowSocialFeatures?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowEssentialCookies?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowPerformanceCookies?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowTargetingCookies?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  customPreferences?: Record<string, any>;
}

export class PrivacySettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: DataSharingLevel })
  dataSharingLevel: DataSharingLevel;

  @ApiProperty()
  allowAnalytics: boolean;

  @ApiProperty()
  allowMarketing: boolean;

  @ApiProperty()
  allowThirdParty: boolean;

  @ApiProperty()
  allowLocationData: boolean;

  @ApiProperty()
  allowHealthData: boolean;

  @ApiProperty()
  allowSocialFeatures: boolean;

  @ApiProperty()
  allowEssentialCookies: boolean;

  @ApiProperty()
  allowPerformanceCookies: boolean;

  @ApiProperty()
  allowTargetingCookies: boolean;

  @ApiProperty()
  customPreferences: Record<string, any>;

  @ApiProperty()
  lastConsentUpdate: Date;

  @ApiProperty()
  gdprConsentDate: Date;

  @ApiProperty()
  dataPortabilityEnabled: boolean;

  @ApiProperty()
  rightToBeForgotten: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
