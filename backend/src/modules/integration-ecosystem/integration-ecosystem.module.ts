import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarIntegration } from '../../database/entities/calendar-integration.entity';
import { TaskIntegration } from '../../database/entities/task-integration.entity';
import { SmartHomeIntegration } from '../../database/entities/smart-home-integration.entity';
import { CalendarIntegrationService } from './services/calendar-integration.service';
import { TaskIntegrationService } from './services/task-integration.service';
import { SmartHomeIntegrationService } from './services/smart-home-integration.service';
import { IntegrationEcosystemController } from './controllers/integration-ecosystem.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CalendarIntegration,
      TaskIntegration,
      SmartHomeIntegration,
    ]),
  ],
  controllers: [IntegrationEcosystemController],
  providers: [
    CalendarIntegrationService,
    TaskIntegrationService,
    SmartHomeIntegrationService,
  ],
  exports: [
    CalendarIntegrationService,
    TaskIntegrationService,
    SmartHomeIntegrationService,
  ],
})
export class IntegrationEcosystemModule {}
