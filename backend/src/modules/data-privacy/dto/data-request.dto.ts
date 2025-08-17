import {
  IsEnum,
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  DataRequestType,
  DataFormat,
} from '../../../database/entities/data-request.entity';

export class CreateDataRequestDto {
  @ApiProperty({ enum: DataRequestType, description: 'Type of data request' })
  @IsEnum(DataRequestType)
  requestType: DataRequestType;

  @ApiProperty({ description: 'Description of the request' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Specific data being requested',
    required: false,
  })
  @IsOptional()
  @IsObject()
  requestedData?: Record<string, any>;

  @ApiProperty({
    enum: DataFormat,
    description: 'Preferred format for data export',
  })
  @IsEnum(DataFormat)
  preferredFormat: DataFormat;

  @ApiProperty({ description: 'Reason for the request', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Whether this is an urgent request',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiProperty({ description: 'Requested completion date', required: false })
  @IsOptional()
  @IsDateString()
  requestedCompletionDate?: string;
}

export class UpdateDataRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  requestedData?: Record<string, any>;

  @ApiProperty({ enum: DataFormat, required: false })
  @IsOptional()
  @IsEnum(DataFormat)
  preferredFormat?: DataFormat;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  requestedCompletionDate?: string;
}

export class DataRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: DataRequestType })
  requestType: DataRequestType;

  @ApiProperty()
  description: string;

  @ApiProperty()
  requestedData: Record<string, any>;

  @ApiProperty({ enum: DataFormat })
  preferredFormat: DataFormat;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  isUrgent: boolean;

  @ApiProperty()
  requestedCompletionDate: Date;

  @ApiProperty()
  startedProcessingAt: Date;

  @ApiProperty()
  completedAt: Date;

  @ApiProperty()
  resultUrl: string;

  @ApiProperty()
  resultChecksum: string;

  @ApiProperty()
  resultSizeBytes: number;

  @ApiProperty()
  errorMessage: string;

  @ApiProperty()
  processingMetadata: Record<string, any>;

  @ApiProperty()
  retryCount: number;

  @ApiProperty()
  nextRetryAt: Date;

  @ApiProperty()
  adminNotes: string;

  @ApiProperty()
  assignedTo: string;

  @ApiProperty()
  verificationData: Record<string, any>;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  verifiedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class DataRequestFilterDto {
  @ApiProperty({ enum: DataRequestType, required: false })
  @IsOptional()
  @IsEnum(DataRequestType)
  requestType?: DataRequestType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
