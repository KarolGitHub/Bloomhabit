import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TaskIntegration,
  TaskProvider,
  TaskSyncStatus,
  TaskPriority,
  TaskStatus,
} from '../../../database/entities/task-integration.entity';
import {
  CreateTaskIntegrationDto,
  UpdateTaskIntegrationDto,
  TaskIntegrationResponseDto,
} from '../dto/task-integration.dto';

@Injectable()
export class TaskIntegrationService {
  constructor(
    @InjectRepository(TaskIntegration)
    private taskIntegrationRepository: Repository<TaskIntegration>
  ) {}

  async createTaskIntegration(
    userId: string,
    createDto: CreateTaskIntegrationDto
  ): Promise<TaskIntegrationResponseDto> {
    // Check if user already has an integration with this provider
    const existingIntegration = await this.taskIntegrationRepository.findOne({
      where: { userId, provider: createDto.provider },
    });

    if (existingIntegration) {
      throw new BadRequestException(
        `Integration with ${createDto.provider} already exists`
      );
    }

    // Create default sync settings if not provided
    const defaultSyncSettings = {
      syncTasks: true,
      syncSubtasks: true,
      autoCreateHabits: false,
      habitCreationRules: {
        taskDuration: 30,
        frequency: 'daily',
        priorityThreshold: TaskPriority.MEDIUM,
        tags: ['imported'],
      },
    };

    const integration = this.taskIntegrationRepository.create({
      userId,
      ...createDto,
      syncSettings: createDto.syncSettings || defaultSyncSettings,
      syncStatus: TaskSyncStatus.ACTIVE,
      isActive: true,
    });

    const savedIntegration =
      await this.taskIntegrationRepository.save(integration);
    return this.mapToResponseDto(savedIntegration);
  }

  async getUserTaskIntegrations(
    userId: string
  ): Promise<TaskIntegrationResponseDto[]> {
    const integrations = await this.taskIntegrationRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    return integrations.map((integration) =>
      this.mapToResponseDto(integration)
    );
  }

  async getTaskIntegrationById(
    userId: string,
    integrationId: string
  ): Promise<TaskIntegrationResponseDto> {
    const integration = await this.taskIntegrationRepository.findOne({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Task integration not found');
    }

    return this.mapToResponseDto(integration);
  }

  async updateTaskIntegration(
    userId: string,
    integrationId: string,
    updateDto: UpdateTaskIntegrationDto
  ): Promise<TaskIntegrationResponseDto> {
    const integration = await this.taskIntegrationRepository.findOne({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Task integration not found');
    }

    // Update the integration
    Object.assign(integration, updateDto);
    const updatedIntegration =
      await this.taskIntegrationRepository.save(integration);

    return this.mapToResponseDto(updatedIntegration);
  }

  async deleteTaskIntegration(
    userId: string,
    integrationId: string
  ): Promise<void> {
    const integration = await this.taskIntegrationRepository.findOne({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Task integration not found');
    }

    await this.taskIntegrationRepository.remove(integration);
  }

  async syncTasks(integrationId: string): Promise<void> {
    const integration = await this.taskIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException('Task integration not found');
    }

    try {
      // Update sync status and timestamp
      integration.syncStatus = TaskSyncStatus.ACTIVE;
      integration.lastSyncAt = new Date();
      integration.nextSyncAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Next sync in 24 hours

      await this.taskIntegrationRepository.save(integration);

      // TODO: Implement actual task sync logic based on provider
      // This would involve calling the respective task management API
      await this.performTaskSync(integration);
    } catch (error) {
      integration.syncStatus = TaskSyncStatus.ERROR;
      integration.metadata = {
        ...integration.metadata,
        syncErrors: [
          ...(integration.metadata?.syncErrors || []),
          error.message,
        ],
      };
      await this.taskIntegrationRepository.save(integration);
      throw error;
    }
  }

  async createHabitFromTask(
    integrationId: string,
    taskData: {
      title: string;
      description?: string;
      priority: TaskPriority;
      dueDate?: Date;
      tags: string[];
    }
  ): Promise<string> {
    const integration = await this.taskIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException('Task integration not found');
    }

    if (!integration.syncSettings.autoCreateHabits) {
      throw new BadRequestException(
        'Auto habit creation is disabled for this integration'
      );
    }

    // Check if task meets the priority threshold
    const priorityMap = {
      [TaskPriority.LOW]: 1,
      [TaskPriority.MEDIUM]: 2,
      [TaskPriority.HIGH]: 3,
      [TaskPriority.URGENT]: 4,
    };

    if (
      priorityMap[taskData.priority] <
      priorityMap[integration.syncSettings.habitCreationRules.priorityThreshold]
    ) {
      throw new BadRequestException(
        'Task priority does not meet the threshold for habit creation'
      );
    }

    // TODO: Implement actual habit creation logic
    // This would involve calling the habit service to create a new habit
    const habitId = await this.createHabitFromTaskData(integration, taskData);

    return habitId;
  }

  async getTaskSyncStatus(integrationId: string): Promise<{
    status: TaskSyncStatus;
    lastSync: Date | null;
    nextSync: Date | null;
    errorCount: number;
    taskCount: number;
  }> {
    const integration = await this.taskIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException('Task integration not found');
    }

    return {
      status: integration.syncStatus,
      lastSync: integration.lastSyncAt || null,
      nextSync: integration.nextSyncAt || null,
      errorCount: integration.metadata?.syncErrors?.length || 0,
      taskCount: integration.metadata?.taskCount || 0,
    };
  }

  async getTaskIntegrationStats(userId: string): Promise<{
    totalIntegrations: number;
    activeIntegrations: number;
    totalTasks: number;
    lastSync: Date | null;
  }> {
    const integrations = await this.taskIntegrationRepository.find({
      where: { userId },
    });

    const activeIntegrations = integrations.filter(
      (i) => i.isActive && i.syncStatus === TaskSyncStatus.ACTIVE
    );
    const totalTasks = integrations.reduce(
      (sum, i) => sum + (i.metadata?.taskCount || 0),
      0
    );
    const lastSync =
      integrations.length > 0
        ? new Date(
            Math.max(...integrations.map((i) => i.lastSyncAt?.getTime() || 0))
          )
        : null;

    return {
      totalIntegrations: integrations.length,
      activeIntegrations: activeIntegrations.length,
      totalTasks,
      lastSync,
    };
  }

  private async performTaskSync(integration: TaskIntegration): Promise<void> {
    // Mock implementation - in real app, this would call the respective task management API
    switch (integration.provider) {
      case TaskProvider.TODOIST:
        // Call Todoist API
        break;
      case TaskProvider.ASANA:
        // Call Asana API
        break;
      case TaskProvider.TRELLO:
        // Call Trello API
        break;
      case TaskProvider.NOTION:
        // Call Notion API
        break;
      default:
        // Handle other providers
        break;
    }
  }

  private async createHabitFromTaskData(
    integration: TaskIntegration,
    taskData: any
  ): Promise<string> {
    // Mock implementation - in real app, this would create a habit using the habit service
    // For now, return a mock habit ID
    return `habit_${Date.now()}`;
  }

  private mapToResponseDto(
    integration: TaskIntegration
  ): TaskIntegrationResponseDto {
    return {
      id: integration.id,
      userId: integration.userId,
      provider: integration.provider,
      externalProjectId: integration.externalProjectId,
      projectName: integration.projectName,
      syncStatus: integration.syncStatus,
      syncSettings: integration.syncSettings,
      isActive: integration.isActive,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  }
}
