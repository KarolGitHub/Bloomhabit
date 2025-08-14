import { IsString, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePushSubscriptionDto {
  @ApiProperty()
  @IsString()
  endpoint: string;

  @ApiProperty()
  @IsObject()
  keys: {
    p256dh: string;
    auth: string;
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  preferences?: {
    habitReminders?: boolean;
    streakMilestones?: boolean;
    goalAchievements?: boolean;
    aiInsights?: boolean;
    systemUpdates?: boolean;
    friendActivity?: boolean;
  };
}
