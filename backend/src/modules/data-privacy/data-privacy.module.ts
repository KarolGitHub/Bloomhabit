import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataPrivacyController } from './controllers/data-privacy.controller';
import { PrivacySettingsService } from './services/privacy-settings.service';
import { AuditLogService } from './services/audit-log.service';
import { DataRequestService } from './services/data-request.service';
import { SecurityService } from './services/security.service';

// Entities
import { PrivacySettings } from '../../database/entities/privacy-settings.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { DataRequest } from '../../database/entities/data-request.entity';
import { SecurityEvent } from '../../database/entities/security-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PrivacySettings,
      AuditLog,
      DataRequest,
      SecurityEvent,
    ]),
  ],
  controllers: [DataPrivacyController],
  providers: [
    PrivacySettingsService,
    AuditLogService,
    DataRequestService,
    SecurityService,
  ],
  exports: [
    PrivacySettingsService,
    AuditLogService,
    DataRequestService,
    SecurityService,
  ],
})
export class DataPrivacyModule {}
