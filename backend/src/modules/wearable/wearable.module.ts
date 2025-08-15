import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WearableController } from './wearable.controller';
import { WearableDevicesService } from './wearable-devices.service';
import { HealthDataService } from './health-data.service';
import { WearableIntegrationsService } from './wearable-integrations.service';
import { WearableDevice } from '../../database/entities/wearable-device.entity';
import { HealthData } from '../../database/entities/health-data.entity';
import { WearableIntegration } from '../../database/entities/wearable-integration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WearableDevice, HealthData, WearableIntegration]),
  ],
  controllers: [WearableController],
  providers: [
    WearableDevicesService,
    HealthDataService,
    WearableIntegrationsService,
  ],
  exports: [
    WearableDevicesService,
    HealthDataService,
    WearableIntegrationsService,
  ],
})
export class WearableModule {}
