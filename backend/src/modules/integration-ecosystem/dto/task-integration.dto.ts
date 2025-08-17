import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskProvider, TaskSyncStatus, TaskPriority, TaskStatus } from '../../../database/entities/task-integration.entity';

export class HabitCreationRulesDto {
  @ApiProperty({ description: 'Task duration in minutes', example: 30 })
  @IsNumber()
  taskDuration: number;

  @ApiProperty({ description: 'Frequency for habit creation', example: 'daily' })
  @IsString()
  frequency: string;

  @ApiProperty({ description: 'Priority threshold for habit creation', enum: TaskPriority })
  @IsEnum(TaskPriority)
  priorityThreshold: TaskPriority;

  @ApiProperty({ description: 'Tags to apply to created habits', example: ['work', 'important'] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

export class SyncSettingsDto {
  @ApiProperty({ description: 'Whether to sync tasks' })
  @IsBoolean()
  syncTasks: boolean;

  @ApiProperty({ description: 'Whether to sync subtasks' })
  @IsBoolean()
  syncSubtasks: boolean;

  @ApiProperty({ description: 'Whether to automatically create habits from tasks' })
  @IsBoolean()
  autoCreateHabits: boolean;

  @ApiProperty({ description: 'Rules for habit creation from tasks' })
  @ValidateNested()
  @Type(() => HabitCreationRulesDto)
  habitCreationRules: HabitCreationRulesDto;
}

export class CreateTaskIntegrationDto {
  @ApiProperty({ description: 'Task provider', enum: TaskProvider })
  @IsEnum(TaskProvider)
  provider: TaskProvider;

  @ApiProperty({ description: 'External project ID' })
  @IsString()
  externalProjectId: string;

  @ApiProperty({ description: 'Project name' })
  @IsString()
  projectName: string;

  @ApiProperty({ description: 'Sync settings', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SyncSettingsDto)
  syncSettings?: SyncSettingsDto;
}

export class UpdateTaskIntegrationDto {
  @ApiProperty({ description: 'Project name', required: false })
  @IsOptional()
  @IsString()
  projectName?: string;

  @ApiProperty({ description: 'Sync status', enum: TaskSyncStatus, required: false })
  @IsOptional()
  @IsEnum(TaskSyncStatus)
  syncStatus?: TaskSyncStatus;

  @ApiProperty({ description: 'Whether the integration is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TaskIntegrationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: TaskProvider })
  provider: TaskProvider;

  @ApiProperty()
  externalProjectId: string;

  @ApiProperty()
  projectName: string;

  @ApiProperty({ enum: TaskSyncStatus })
  syncStatus: TaskSyncStatus;

  @ApiProperty()
  syncSettings: SyncSettingsDto;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
