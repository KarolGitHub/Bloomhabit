import {
  IsEnum,
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  IsUUID,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  AuditAction,
  AuditSeverity,
} from '../../../database/entities/audit-log.entity';

export class AuditLogFilterDto {
  @ApiProperty({ enum: AuditAction, required: false })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiProperty({ enum: AuditSeverity, required: false })
  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isSuccessful?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  offset?: number;
}

export class AuditLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: AuditAction })
  action: AuditAction;

  @ApiProperty({ enum: AuditSeverity })
  severity: AuditSeverity;

  @ApiProperty()
  resource: string;

  @ApiProperty()
  resourceId: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  metadata: Record<string, any>;

  @ApiProperty()
  ipAddress: string;

  @ApiProperty()
  userAgent: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  isSuccessful: boolean;

  @ApiProperty()
  errorMessage: string;

  @ApiProperty()
  requestData: Record<string, any>;

  @ApiProperty()
  responseData: Record<string, any>;

  @ApiProperty()
  processingTimeMs: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  retentionDate: Date;
}

export class AuditLogSummaryDto {
  @ApiProperty()
  totalLogs: number;

  @ApiProperty()
  highSeverityCount: number;

  @ApiProperty()
  mediumSeverityCount: number;

  @ApiProperty()
  lowSeverityCount: number;

  @ApiProperty()
  criticalSeverityCount: number;

  @ApiProperty()
  successfulActions: number;

  @ApiProperty()
  failedActions: number;

  @ApiProperty()
  topActions: Record<string, number>;

  @ApiProperty()
  topResources: Record<string, number>;

  @ApiProperty()
  recentActivity: AuditLogResponseDto[];
}
