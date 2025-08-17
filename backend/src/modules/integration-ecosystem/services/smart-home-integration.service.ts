import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SmartHomeIntegration,
  SmartHomeProvider,
  SmartHomeDeviceType,
  SmartHomeTriggerType,
  SmartHomeActionType,
} from '../../../database/entities/smart-home-integration.entity';
import {
  CreateSmartHomeIntegrationDto,
  UpdateSmartHomeIntegrationDto,
  SmartHomeIntegrationResponseDto,
  DeviceDto,
  AutomationRuleDto,
} from '../dto/smart-home-integration.dto';

@Injectable()
export class SmartHomeIntegrationService {
  constructor(
    @InjectRepository(SmartHomeIntegration)
    private smartHomeIntegrationRepository: Repository<SmartHomeIntegration>
  ) {}

  async createSmartHomeIntegration(
    userId: string,
    createDto: CreateSmartHomeIntegrationDto
  ): Promise<SmartHomeIntegrationResponseDto> {
    // Check if user already has an integration with this provider
    const existingIntegration =
      await this.smartHomeIntegrationRepository.findOne({
        where: { userId, provider: createDto.provider },
      });

    if (existingIntegration) {
      throw new BadRequestException(
        `Integration with ${createDto.provider} already exists`
      );
    }

    // Initialize empty devices and automation rules
    const integration = this.smartHomeIntegrationRepository.create({
      userId,
      ...createDto,
      devices: [],
      automationRules: [],
      isActive: true,
    });

    const savedIntegration =
      await this.smartHomeIntegrationRepository.save(integration);
    return this.mapToResponseDto(savedIntegration);
  }

  async getUserSmartHomeIntegrations(
    userId: string
  ): Promise<SmartHomeIntegrationResponseDto[]> {
    const integrations = await this.smartHomeIntegrationRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    return integrations.map((integration) =>
      this.mapToResponseDto(integration)
    );
  }

  async getSmartHomeIntegrationById(
    userId: string,
    integrationId: string
  ): Promise<SmartHomeIntegrationResponseDto> {
    const integration = await this.smartHomeIntegrationRepository.findOne({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Smart home integration not found');
    }

    return this.mapToResponseDto(integration);
  }

  async updateSmartHomeIntegration(
    userId: string,
    integrationId: string,
    updateDto: UpdateSmartHomeIntegrationDto
  ): Promise<SmartHomeIntegrationResponseDto> {
    const integration = await this.smartHomeIntegrationRepository.findOne({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Smart home integration not found');
    }

    // Update the integration
    Object.assign(integration, updateDto);
    const updatedIntegration =
      await this.smartHomeIntegrationRepository.save(integration);

    return this.mapToResponseDto(updatedIntegration);
  }

  async deleteSmartHomeIntegration(
    userId: string,
    integrationId: string
  ): Promise<void> {
    const integration = await this.smartHomeIntegrationRepository.findOne({
      where: { id: integrationId, userId },
    });

    if (!integration) {
      throw new NotFoundException('Smart home integration not found');
    }

    await this.smartHomeIntegrationRepository.remove(integration);
  }

  async syncDevices(integrationId: string): Promise<void> {
    const integration = await this.smartHomeIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException('Smart home integration not found');
    }

    try {
      // Update sync timestamp
      integration.lastSyncAt = new Date();
      integration.nextSyncAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Next sync in 24 hours

      // TODO: Implement actual device sync logic based on provider
      // This would involve calling the respective smart home API
      const devices = await this.performDeviceSync(integration);

      integration.devices = devices;
      integration.metadata = {
        ...integration.metadata,
        deviceCount: devices.length,
        lastSyncAt: new Date(),
      };

      await this.smartHomeIntegrationRepository.save(integration);
    } catch (error) {
      integration.metadata = {
        ...integration.metadata,
        syncErrors: [
          ...(integration.metadata?.syncErrors || []),
          error.message,
        ],
      };
      await this.smartHomeIntegrationRepository.save(integration);
      throw error;
    }
  }

  async addAutomationRule(
    integrationId: string,
    rule: Omit<AutomationRuleDto, 'id' | 'lastTriggered' | 'triggerCount'>
  ): Promise<AutomationRuleDto> {
    const integration = await this.smartHomeIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException('Smart home integration not found');
    }

    const newRule: AutomationRuleDto = {
      ...rule,
      id: `rule_${Date.now()}`,
      lastTriggered: undefined,
      triggerCount: 0,
    };

    integration.automationRules.push(newRule);

    // Sort rules by priority (highest first)
    integration.automationRules.sort((a, b) => b.priority - a.priority);

    await this.smartHomeIntegrationRepository.save(integration);
    return newRule;
  }

  async updateAutomationRule(
    integrationId: string,
    ruleId: string,
    updates: Partial<AutomationRuleDto>
  ): Promise<AutomationRuleDto> {
    const integration = await this.smartHomeIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException('Smart home integration not found');
    }

    const ruleIndex = integration.automationRules.findIndex(
      (r) => r.id === ruleId
    );
    if (ruleIndex === -1) {
      throw new NotFoundException('Automation rule not found');
    }

    // Update the rule
    integration.automationRules[ruleIndex] = {
      ...integration.automationRules[ruleIndex],
      ...updates,
    };

    // Re-sort rules by priority
    integration.automationRules.sort((a, b) => b.priority - a.priority);

    await this.smartHomeIntegrationRepository.save(integration);
    return integration.automationRules[ruleIndex];
  }

  async deleteAutomationRule(
    integrationId: string,
    ruleId: string
  ): Promise<void> {
    const integration = await this.smartHomeIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException('Smart home integration not found');
    }

    const ruleIndex = integration.automationRules.findIndex(
      (r) => r.id === ruleId
    );
    if (ruleIndex === -1) {
      throw new NotFoundException('Automation rule not found');
    }

    integration.automationRules.splice(ruleIndex, 1);
    await this.smartHomeIntegrationRepository.save(integration);
  }

  async triggerAutomation(
    integrationId: string,
    triggerType: SmartHomeTriggerType,
    triggerData: any
  ): Promise<void> {
    const integration = await this.smartHomeIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException('Smart home integration not found');
    }

    // Find matching automation rules
    const matchingRules = integration.automationRules.filter(
      (rule) =>
        rule.isActive &&
        rule.triggerType === triggerType &&
        this.evaluateTriggerConditions(rule.triggerConditions, triggerData)
    );

    // Execute rules in priority order
    for (const rule of matchingRules) {
      try {
        await this.executeAutomationRule(integration, rule, triggerData);

        // Update rule statistics
        rule.lastTriggered = new Date();
        rule.triggerCount++;

        await this.smartHomeIntegrationRepository.save(integration);
      } catch (error) {
        console.error(`Failed to execute automation rule ${rule.id}:`, error);
      }
    }
  }

  async getSmartHomeDashboard(userId: string): Promise<{
    totalIntegrations: number;
    totalDevices: number;
    totalAutomations: number;
    activeAutomations: number;
    recentTriggers: number;
  }> {
    const integrations = await this.smartHomeIntegrationRepository.find({
      where: { userId, isActive: true },
    });

    const totalDevices = integrations.reduce(
      (sum, i) => sum + (i.devices?.length || 0),
      0
    );
    const totalAutomations = integrations.reduce(
      (sum, i) => sum + (i.automationRules?.length || 0),
      0
    );
    const activeAutomations = integrations.reduce(
      (sum, i) =>
        sum + (i.automationRules?.filter((r) => r.isActive)?.length || 0),
      0
    );
    const recentTriggers = integrations.reduce(
      (sum, i) =>
        sum +
        (i.automationRules?.reduce(
          (ruleSum, r) => ruleSum + (r.triggerCount || 0),
          0
        ) || 0),
      0
    );

    return {
      totalIntegrations: integrations.length,
      totalDevices,
      totalAutomations,
      activeAutomations,
      recentTriggers,
    };
  }

  private async performDeviceSync(
    integration: SmartHomeIntegration
  ): Promise<any[]> {
    // Mock implementation - in real app, this would call the respective smart home API
    switch (integration.provider) {
      case SmartHomeProvider.PHILIPS_HUE:
        // Call Philips Hue API
        return this.mockHueDevices();
      case SmartHomeProvider.SMART_THINGS:
        // Call SmartThings API
        return this.mockSmartThingsDevices();
      case SmartHomeProvider.HOME_ASSISTANT:
        // Call Home Assistant API
        return this.mockHomeAssistantDevices();
      default:
        // Handle other providers
        return [];
    }
  }

  private async executeAutomationRule(
    integration: SmartHomeIntegration,
    rule: AutomationRuleDto,
    triggerData: any
  ): Promise<void> {
    // TODO: Implement actual device control based on provider
    // This would involve calling the respective smart home API
    for (const action of rule.actions) {
      if (action.delay) {
        await new Promise((resolve) =>
          setTimeout(resolve, action.delay * 1000)
        );
      }

      await this.executeDeviceAction(integration, action);
    }
  }

  private evaluateTriggerConditions(
    conditions: any,
    triggerData: any
  ): boolean {
    // Simple condition evaluation - in real app, this would be more sophisticated
    if (conditions.habitId && triggerData.habitId) {
      return conditions.habitId === triggerData.habitId;
    }

    if (conditions.goalId && triggerData.goalId) {
      return conditions.goalId === triggerData.goalId;
    }

    if (conditions.time && triggerData.time) {
      return conditions.time === triggerData.time;
    }

    return true; // Default to true if no specific conditions
  }

  private async executeDeviceAction(
    integration: SmartHomeIntegration,
    action: any
  ): Promise<void> {
    // Mock implementation - in real app, this would control actual devices
    console.log(
      `Executing action: ${action.actionType} on device ${action.deviceId}`
    );
  }

  private mockHueDevices(): any[] {
    return [
      {
        id: 'hue_light_1',
        name: 'Living Room Light',
        type: SmartHomeDeviceType.LIGHT,
        capabilities: ['on_off', 'dimming', 'color'],
        room: 'Living Room',
        isOnline: true,
      },
      {
        id: 'hue_light_2',
        name: 'Bedroom Light',
        type: SmartHomeDeviceType.LIGHT,
        capabilities: ['on_off', 'dimming'],
        room: 'Bedroom',
        isOnline: true,
      },
    ];
  }

  private mockSmartThingsDevices(): any[] {
    return [
      {
        id: 'st_switch_1',
        name: 'Kitchen Switch',
        type: SmartHomeDeviceType.SWITCH,
        capabilities: ['on_off'],
        room: 'Kitchen',
        isOnline: true,
      },
    ];
  }

  private mockHomeAssistantDevices(): any[] {
    return [
      {
        id: 'ha_thermostat_1',
        name: 'Home Thermostat',
        type: SmartHomeDeviceType.THERMOSTAT,
        capabilities: ['on_off', 'set_temperature'],
        room: 'Hallway',
        isOnline: true,
      },
    ];
  }

  private mapToResponseDto(
    integration: SmartHomeIntegration
  ): SmartHomeIntegrationResponseDto {
    return {
      id: integration.id,
      userId: integration.userId,
      provider: integration.provider,
      externalAccountId: integration.externalAccountId,
      accountName: integration.accountName,
      accountDescription: integration.accountDescription,
      accountIcon: integration.accountIcon,
      devices: integration.devices || [],
      automationRules: integration.automationRules || [],
      isActive: integration.isActive,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  }
}
