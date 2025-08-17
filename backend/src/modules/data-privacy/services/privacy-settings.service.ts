import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PrivacySettings,
  DataSharingLevel,
} from '../../../database/entities/privacy-settings.entity';
import {
  CreatePrivacySettingsDto,
  UpdatePrivacySettingsDto,
} from '../dto/privacy-settings.dto';
import { AuditLogService } from './audit-log.service';
import {
  AuditAction,
  AuditSeverity,
} from '../../../database/entities/audit-log.entity';

@Injectable()
export class PrivacySettingsService {
  constructor(
    @InjectRepository(PrivacySettings)
    private privacySettingsRepository: Repository<PrivacySettings>,
    private auditLogService: AuditLogService
  ) {}

  async createPrivacySettings(
    userId: string,
    createDto: CreatePrivacySettingsDto
  ): Promise<PrivacySettings> {
    // Check if user already has privacy settings
    const existingSettings = await this.privacySettingsRepository.findOne({
      where: { userId },
    });

    if (existingSettings) {
      throw new BadRequestException(
        'Privacy settings already exist for this user'
      );
    }

    const privacySettings = this.privacySettingsRepository.create({
      ...createDto,
      userId,
      lastConsentUpdate: new Date(),
      gdprConsentDate: new Date(),
    });

    const savedSettings =
      await this.privacySettingsRepository.save(privacySettings);

    // Log the creation
    await this.auditLogService.createAuditLog({
      userId,
      action: AuditAction.CONSENT_UPDATE,
      severity: AuditSeverity.LOW,
      resource: 'privacy_settings',
      resourceId: savedSettings.id,
      description: 'Privacy settings created',
      metadata: { settings: createDto },
      isSuccessful: true,
    });

    return savedSettings;
  }

  async getUserPrivacySettings(userId: string): Promise<PrivacySettings> {
    const settings = await this.privacySettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      // Create default privacy settings if none exist
      return this.createDefaultPrivacySettings(userId);
    }

    return settings;
  }

  async updatePrivacySettings(
    userId: string,
    updateDto: UpdatePrivacySettingsDto
  ): Promise<PrivacySettings> {
    const settings = await this.privacySettingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      throw new NotFoundException('Privacy settings not found');
    }

    // Update settings
    Object.assign(settings, updateDto);
    settings.lastConsentUpdate = new Date();

    const updatedSettings = await this.privacySettingsRepository.save(settings);

    // Log the update
    await this.auditLogService.createAuditLog({
      userId,
      action: AuditAction.PRIVACY_SETTINGS_CHANGE,
      severity: AuditSeverity.LOW,
      resource: 'privacy_settings',
      resourceId: settings.id,
      description: 'Privacy settings updated',
      metadata: { changes: updateDto },
      isSuccessful: true,
    });

    return updatedSettings;
  }

  async updateConsent(
    userId: string,
    consentType: string,
    granted: boolean
  ): Promise<PrivacySettings> {
    const settings = await this.getUserPrivacySettings(userId);

    // Update specific consent
    if (consentType in settings) {
      settings[consentType] = granted;
      settings.lastConsentUpdate = new Date();

      if (granted) {
        settings.gdprConsentDate = new Date();
      }
    }

    const updatedSettings = await this.privacySettingsRepository.save(settings);

    // Log consent update
    await this.auditLogService.createAuditLog({
      userId,
      action: AuditAction.CONSENT_UPDATE,
      severity: AuditSeverity.LOW,
      resource: 'privacy_settings',
      resourceId: settings.id,
      description: `Consent ${consentType} ${granted ? 'granted' : 'withdrawn'}`,
      metadata: { consentType, granted },
      isSuccessful: true,
    });

    return updatedSettings;
  }

  async enableDataPortability(userId: string): Promise<PrivacySettings> {
    const settings = await this.getUserPrivacySettings(userId);
    settings.dataPortabilityEnabled = true;
    settings.lastConsentUpdate = new Date();

    const updatedSettings = await this.privacySettingsRepository.save(settings);

    // Log data portability enablement
    await this.auditLogService.createAuditLog({
      userId,
      action: AuditAction.DATA_PORTABILITY_REQUEST,
      severity: AuditSeverity.MEDIUM,
      resource: 'privacy_settings',
      resourceId: settings.id,
      description: 'Data portability enabled',
      metadata: { dataPortabilityEnabled: true },
      isSuccessful: true,
    });

    return updatedSettings;
  }

  async requestRightToBeForgotten(userId: string): Promise<PrivacySettings> {
    const settings = await this.getUserPrivacySettings(userId);
    settings.rightToBeForgotten = true;
    settings.lastConsentUpdate = new Date();

    const updatedSettings = await this.privacySettingsRepository.save(settings);

    // Log right to be forgotten request
    await this.auditLogService.createAuditLog({
      userId,
      action: AuditAction.RIGHT_TO_BE_FORGOTTEN_REQUEST,
      severity: AuditSeverity.HIGH,
      resource: 'privacy_settings',
      resourceId: settings.id,
      description: 'Right to be forgotten requested',
      metadata: { rightToBeForgotten: true },
      isSuccessful: true,
    });

    return updatedSettings;
  }

  async getPrivacySettingsSummary(userId: string): Promise<any> {
    const settings = await this.getUserPrivacySettings(userId);

    return {
      dataSharingLevel: settings.dataSharingLevel,
      consentSummary: {
        analytics: settings.allowAnalytics,
        marketing: settings.allowMarketing,
        thirdParty: settings.allowThirdParty,
        location: settings.allowLocationData,
        health: settings.allowHealthData,
        social: settings.allowSocialFeatures,
        cookies: {
          essential: settings.allowEssentialCookies,
          performance: settings.allowPerformanceCookies,
          targeting: settings.allowTargetingCookies,
        },
      },
      gdprRights: {
        dataPortability: settings.dataPortabilityEnabled,
        rightToBeForgotten: settings.rightToBeForgotten,
      },
      lastUpdated: settings.lastConsentUpdate,
      gdprConsentDate: settings.gdprConsentDate,
    };
  }

  async validateDataAccess(userId: string, dataType: string): Promise<boolean> {
    const settings = await this.getUserPrivacySettings(userId);

    switch (dataType) {
      case 'analytics':
        return settings.allowAnalytics;
      case 'marketing':
        return settings.allowMarketing;
      case 'thirdParty':
        return settings.allowThirdParty;
      case 'location':
        return settings.allowLocationData;
      case 'health':
        return settings.allowHealthData;
      case 'social':
        return settings.allowSocialFeatures;
      default:
        return false;
    }
  }

  async getDataSharingLevel(userId: string): Promise<DataSharingLevel> {
    const settings = await this.getUserPrivacySettings(userId);
    return settings.dataSharingLevel;
  }

  private async createDefaultPrivacySettings(
    userId: string
  ): Promise<PrivacySettings> {
    const defaultSettings = this.privacySettingsRepository.create({
      userId,
      dataSharingLevel: DataSharingLevel.NONE,
      allowAnalytics: false,
      allowMarketing: false,
      allowThirdParty: false,
      allowLocationData: false,
      allowHealthData: false,
      allowSocialFeatures: false,
      allowEssentialCookies: true,
      allowPerformanceCookies: false,
      allowTargetingCookies: false,
      customPreferences: {},
      lastConsentUpdate: new Date(),
      gdprConsentDate: new Date(),
      dataPortabilityEnabled: false,
      rightToBeForgotten: false,
    });

    return this.privacySettingsRepository.save(defaultSettings);
  }

  async deletePrivacySettings(userId: string): Promise<void> {
    const settings = await this.privacySettingsRepository.findOne({
      where: { userId },
    });

    if (settings) {
      await this.privacySettingsRepository.remove(settings);
    }
  }
}
