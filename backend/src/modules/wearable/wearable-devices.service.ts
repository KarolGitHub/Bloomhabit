import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import {
  WearableDevice,
  ConnectionStatus,
  WearableProvider,
} from '../../database/entities/wearable-device.entity';
import { HealthData } from '../../database/entities/health-data.entity';
import { ConnectDeviceDto } from './dto/connect-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Request } from 'express';

@Injectable()
export class WearableDevicesService {
  constructor(
    @InjectRepository(WearableDevice)
    private wearableDeviceRepository: Repository<WearableDevice>,
    @InjectRepository(HealthData)
    private healthDataRepository: Repository<HealthData>
  ) {}

  async create(
    userId: number,
    connectDeviceDto: ConnectDeviceDto
  ): Promise<WearableDevice> {
    // Check if user already has a device from this provider
    const existingDevice = await this.wearableDeviceRepository.findOne({
      where: { userId, provider: connectDeviceDto.provider },
    });

    if (existingDevice) {
      throw new ConflictException(
        `User already has a device from ${connectDeviceDto.provider}`
      );
    }

    // Set default sync settings if not provided
    const defaultSyncSettings = {
      steps: true,
      heartRate: true,
      sleep: true,
      calories: true,
      distance: true,
      weight: false,
      bloodPressure: false,
      glucose: false,
      oxygenSaturation: false,
      temperature: false,
      customMetrics: [],
    };

    const device = this.wearableDeviceRepository.create({
      ...connectDeviceDto,
      userId,
      status: ConnectionStatus.PENDING,
      syncSettings: connectDeviceDto.syncSettings || defaultSyncSettings,
      capabilities: connectDeviceDto.capabilities || [],
      metadata: connectDeviceDto.metadata || {},
    });

    return this.wearableDeviceRepository.save(device);
  }

  async findAll(userId: number): Promise<WearableDevice[]> {
    return this.wearableDeviceRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, id: number): Promise<WearableDevice> {
    const device = await this.wearableDeviceRepository.findOne({
      where: { id, userId },
    });

    if (!device) {
      throw new NotFoundException(`Wearable device with ID ${id} not found`);
    }

    return device;
  }

  async findByProvider(
    userId: number,
    provider: WearableProvider
  ): Promise<WearableDevice | null> {
    return this.wearableDeviceRepository.findOne({
      where: { userId, provider },
    });
  }

  async update(
    userId: number,
    id: number,
    updateDeviceDto: UpdateDeviceDto
  ): Promise<WearableDevice> {
    const device = await this.findOne(userId, id);

    // Update the device
    Object.assign(device, updateDeviceDto);

    // If status is being updated to CONNECTED, update lastSyncAt
    if (
      updateDeviceDto.status === ConnectionStatus.CONNECTED &&
      device.status !== ConnectionStatus.CONNECTED
    ) {
      device.lastSyncAt = new Date();
    }

    return this.wearableDeviceRepository.save(device);
  }

  async remove(userId: number, id: number): Promise<void> {
    const device = await this.findOne(userId, id);
    await this.wearableDeviceRepository.remove(device);
  }

  async updateConnectionStatus(
    userId: number,
    id: number,
    status: ConnectionStatus,
    errorMessage?: string
  ): Promise<WearableDevice> {
    const device = await this.findOne(userId, id);

    device.status = status;
    if (errorMessage) {
      device.errorMessage = errorMessage;
    }

    if (status === ConnectionStatus.CONNECTED) {
      device.lastSyncAt = new Date();
      device.errorMessage = null;
    }

    return this.wearableDeviceRepository.save(device);
  }

  async updateLastSync(userId: number, id: number): Promise<WearableDevice> {
    const device = await this.findOne(userId, id);
    device.lastSyncAt = new Date();
    return this.wearableDeviceRepository.save(device);
  }

  async updateLastDataReceived(
    userId: number,
    id: number
  ): Promise<WearableDevice> {
    const device = await this.findOne(userId, id);
    device.lastDataReceivedAt = new Date();
    return this.wearableDeviceRepository.save(device);
  }

  async getDeviceStats(userId: number, id: number): Promise<any> {
    const device = await this.findOne(userId, id);

    // Get health data count for this device
    const dataCount = await this.healthDataRepository.count({
      where: { deviceId: id },
    });

    // Get data count by type
    const dataByType = await this.healthDataRepository
      .createQueryBuilder('healthData')
      .select('healthData.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('healthData.deviceId = :deviceId', { deviceId: id })
      .groupBy('healthData.type')
      .getRawMany();

    // Get last 7 days of data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentDataCount = await this.healthDataRepository.count({
      where: {
        deviceId: id,
        timestamp: Between(sevenDaysAgo, new Date()),
      },
    });

    return {
      deviceId: id,
      totalDataPoints: dataCount,
      recentDataPoints: recentDataCount,
      dataByType: dataByType,
      lastSync: device.lastSyncAt,
      lastDataReceived: device.lastDataReceivedAt,
      status: device.status,
      capabilities: device.capabilities,
      syncSettings: device.syncSettings,
    };
  }

  async getConnectedDevices(userId: number): Promise<WearableDevice[]> {
    return this.wearableDeviceRepository.find({
      where: { userId, status: ConnectionStatus.CONNECTED, isActive: true },
      order: { lastSyncAt: 'DESC' },
    });
  }

  async getDevicesByType(
    userId: number,
    type: string
  ): Promise<WearableDevice[]> {
    return this.wearableDeviceRepository.find({
      where: { userId, type: type as any },
      order: { createdAt: 'DESC' },
    });
  }

  async getDevicesByProvider(
    userId: number,
    provider: string
  ): Promise<WearableDevice[]> {
    return this.wearableDeviceRepository.find({
      where: { userId, provider: provider as any },
      order: { createdAt: 'DESC' },
    });
  }

  async getDeviceHealthSummary(userId: number): Promise<any> {
    const devices = await this.findAll(userId);

    const summary = {
      totalDevices: devices.length,
      connectedDevices: devices.filter(
        (d) => d.status === ConnectionStatus.CONNECTED
      ).length,
      disconnectedDevices: devices.filter(
        (d) => d.status === ConnectionStatus.DISCONNECTED
      ).length,
      errorDevices: devices.filter((d) => d.status === ConnectionStatus.ERROR)
        .length,
      pendingDevices: devices.filter(
        (d) => d.status === ConnectionStatus.PENDING
      ).length,
      devicesByProvider: {},
      devicesByType: {},
      lastSync: null,
      totalDataPoints: 0,
    };

    // Group by provider and type
    devices.forEach((device) => {
      if (!summary.devicesByProvider[device.provider]) {
        summary.devicesByProvider[device.provider] = 0;
      }
      summary.devicesByProvider[device.provider]++;

      if (!summary.devicesByType[device.type]) {
        summary.devicesByType[device.type] = 0;
      }
      summary.devicesByType[device.type]++;

      // Find most recent sync
      if (
        device.lastSyncAt &&
        (!summary.lastSync || device.lastSyncAt > summary.lastSync)
      ) {
        summary.lastSync = device.lastSyncAt;
      }
    });

    // Get total data points across all devices
    if (devices.length > 0) {
      const deviceIds = devices.map((d) => d.id);
      summary.totalDataPoints = await this.healthDataRepository.count({
        where: { deviceId: In(deviceIds) },
      });
    }

    return summary;
  }

  async refreshDeviceConnection(
    userId: number,
    id: number
  ): Promise<WearableDevice> {
    const device = await this.findOne(userId, id);

    // Simulate connection refresh (in real implementation, this would call the provider's API)
    device.status = ConnectionStatus.CONNECTED;
    device.lastSyncAt = new Date();
    device.errorMessage = null;

    return this.wearableDeviceRepository.save(device);
  }

  async bulkUpdateSyncSettings(
    userId: number,
    updates: { deviceId: number; syncSettings: any }[]
  ): Promise<WearableDevice[]> {
    const devices: WearableDevice[] = [];

    for (const update of updates) {
      const device = await this.findOne(userId, update.deviceId);
      device.syncSettings = { ...device.syncSettings, ...update.syncSettings };
      devices.push(await this.wearableDeviceRepository.save(device));
    }

    return devices;
  }
}
