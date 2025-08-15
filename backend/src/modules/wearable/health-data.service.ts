import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Raw } from 'typeorm';
import {
  HealthData,
  HealthDataType,
  DataQuality,
} from '../../database/entities/health-data.entity';
import { WearableDevice } from '../../database/entities/wearable-device.entity';
import { HealthDataQueryDto } from './dto/health-data-query.dto';

@Injectable()
export class HealthDataService {
  constructor(
    @InjectRepository(HealthData)
    private healthDataRepository: Repository<HealthData>,
    @InjectRepository(WearableDevice)
    private wearableDeviceRepository: Repository<WearableDevice>
  ) {}

  async create(
    userId: number,
    createData: {
      deviceId?: number;
      type: HealthDataType;
      timestamp: Date;
      value: any;
      unit?: string;
      quality?: DataQuality;
      metadata?: Record<string, any>;
      sourceData?: Record<string, any>;
      externalId?: string;
      notes?: string;
    }
  ): Promise<HealthData> {
    const healthData = this.healthDataRepository.create({
      ...createData,
      userId,
    });

    return this.healthDataRepository.save(healthData);
  }

  async findAll(
    userId: number,
    query: HealthDataQueryDto
  ): Promise<{
    data: HealthData[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const queryBuilder = this.healthDataRepository
      .createQueryBuilder('healthData')
      .where('healthData.userId = :userId', { userId });

    // Apply filters
    if (query.type) {
      queryBuilder.andWhere('healthData.type = :type', { type: query.type });
    }

    if (query.types && query.types.length > 0) {
      queryBuilder.andWhere('healthData.type IN (:...types)', {
        types: query.types,
      });
    }

    if (query.startDate) {
      queryBuilder.andWhere('healthData.timestamp >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('healthData.timestamp <= :endDate', {
        endDate: query.endDate,
      });
    }

    if (query.deviceId) {
      queryBuilder.andWhere('healthData.deviceId = :deviceId', {
        deviceId: query.deviceId,
      });
    }

    if (query.provider) {
      queryBuilder
        .leftJoin('healthData.device', 'device')
        .andWhere('device.provider = :provider', { provider: query.provider });
    }

    if (query.quality) {
      queryBuilder.andWhere('healthData.quality = :quality', {
        quality: query.quality,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    queryBuilder
      .orderBy(
        'healthData.timestamp',
        query.order?.toUpperCase() as 'ASC' | 'DESC'
      )
      .skip(query.offset || 0)
      .take(query.limit || 100);

    // Include relations if needed
    if (query.includeMetadata) {
      queryBuilder.leftJoinAndSelect('healthData.device', 'device');
    }

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      limit: query.limit || 100,
      offset: query.offset || 0,
    };
  }

  async findOne(userId: number, id: number): Promise<HealthData> {
    const healthData = await this.healthDataRepository.findOne({
      where: { id, userId },
      relations: ['device'],
    });

    if (!healthData) {
      throw new NotFoundException(`Health data with ID ${id} not found`);
    }

    return healthData;
  }

  async update(
    userId: number,
    id: number,
    updateData: Partial<HealthData>
  ): Promise<HealthData> {
    const healthData = await this.findOne(userId, id);

    Object.assign(healthData, updateData);
    return this.healthDataRepository.save(healthData);
  }

  async remove(userId: number, id: number): Promise<void> {
    const healthData = await this.findOne(userId, id);
    await this.healthDataRepository.remove(healthData);
  }

  async getDataSummary(
    userId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    const queryBuilder = this.healthDataRepository
      .createQueryBuilder('healthData')
      .where('healthData.userId = :userId', { userId });

    if (startDate) {
      queryBuilder.andWhere('healthData.timestamp >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('healthData.timestamp <= :endDate', { endDate });
    }

    // Get data by type
    const dataByType = await queryBuilder
      .select('healthData.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(CAST(healthData.value AS NUMERIC))', 'average')
      .addSelect('MIN(CAST(healthData.value AS NUMERIC))', 'min')
      .addSelect('MAX(CAST(healthData.value AS NUMERIC))', 'max')
      .groupBy('healthData.type')
      .getRawMany();

    // Get data by device
    const dataByDevice = await queryBuilder
      .leftJoin('healthData.device', 'device')
      .select('device.name', 'deviceName')
      .addSelect('device.provider', 'provider')
      .addSelect('COUNT(*)', 'count')
      .groupBy('device.name')
      .addGroupBy('device.provider')
      .getRawMany();

    // Get data by quality
    const dataByQuality = await queryBuilder
      .select('healthData.quality', 'quality')
      .addSelect('COUNT(*)', 'count')
      .groupBy('healthData.quality')
      .getRawMany();

    return {
      dataByType,
      dataByDevice,
      dataByQuality,
      totalDataPoints: await queryBuilder.getCount(),
    };
  }

  async getDataByType(
    userId: number,
    type: HealthDataType,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<HealthData[]> {
    const queryBuilder = this.healthDataRepository
      .createQueryBuilder('healthData')
      .where('healthData.userId = :userId', { userId })
      .andWhere('healthData.type = :type', { type })
      .orderBy('healthData.timestamp', 'DESC')
      .take(limit);

    if (startDate) {
      queryBuilder.andWhere('healthData.timestamp >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('healthData.timestamp <= :endDate', { endDate });
    }

    return queryBuilder.getMany();
  }

  async getLatestData(
    userId: number,
    type?: HealthDataType
  ): Promise<HealthData[]> {
    const queryBuilder = this.healthDataRepository
      .createQueryBuilder('healthData')
      .where('healthData.userId = :userId', { userId })
      .orderBy('healthData.timestamp', 'DESC')
      .take(10);

    if (type) {
      queryBuilder.andWhere('healthData.type = :type', { type });
    }

    return queryBuilder.getMany();
  }

  async getDataTrends(
    userId: number,
    type: HealthDataType,
    days: number = 30,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let dateFormat: string;
    switch (groupBy) {
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        dateFormat = 'YYYY-WW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }

    const trends = await this.healthDataRepository
      .createQueryBuilder('healthData')
      .select(`DATE_TRUNC('${groupBy}', healthData.timestamp)`, 'period')
      .addSelect('AVG(CAST(healthData.value AS NUMERIC))', 'average')
      .addSelect('COUNT(*)', 'count')
      .where('healthData.userId = :userId', { userId })
      .andWhere('healthData.type = :type', { type })
      .andWhere('healthData.timestamp >= :startDate', { startDate })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    return trends;
  }

  async bulkCreate(
    userId: number,
    dataArray: Array<{
      deviceId?: number;
      type: HealthDataType;
      timestamp: Date;
      value: any;
      unit?: string;
      quality?: DataQuality;
      metadata?: Record<string, any>;
      sourceData?: Record<string, any>;
      externalId?: string;
      notes?: string;
    }>
  ): Promise<HealthData[]> {
    const healthDataArray = dataArray.map((data) =>
      this.healthDataRepository.create({
        ...data,
        userId,
      })
    );

    return this.healthDataRepository.save(healthDataArray);
  }

  async processData(userId: number, id: number): Promise<HealthData> {
    const healthData = await this.findOne(userId, id);

    // Simple data processing example (in real implementation, this would be more sophisticated)
    const processedData: any = {
      originalValue: healthData.value,
      processedAt: new Date(),
      insights: [],
    };

    // Add basic insights based on data type
    switch (healthData.type) {
      case HealthDataType.STEPS:
        if (healthData.value >= 10000) {
          processedData.insights.push(
            'Great job! You reached your daily step goal.'
          );
        } else if (healthData.value >= 5000) {
          processedData.insights.push(
            'Good progress! Keep moving to reach your goal.'
          );
        }
        break;
      case HealthDataType.HEART_RATE:
        if (healthData.value >= 100) {
          processedData.insights.push(
            'Your heart rate is elevated. Consider taking a break.'
          );
        } else if (healthData.value >= 60 && healthData.value <= 100) {
          processedData.insights.push(
            'Your heart rate is in the normal range.'
          );
        }
        break;
      case HealthDataType.SLEEP:
        if (healthData.value >= 7) {
          processedData.insights.push('Excellent sleep duration!');
        } else if (healthData.value < 6) {
          processedData.insights.push(
            'Consider getting more sleep for better health.'
          );
        }
        break;
    }

    healthData.processedData = processedData;
    healthData.isProcessed = true;

    return this.healthDataRepository.save(healthData);
  }

  async getDataInsights(userId: number, days: number = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const insights = await this.healthDataRepository
      .createQueryBuilder('healthData')
      .where('healthData.userId = :userId', { userId })
      .andWhere('healthData.timestamp >= :startDate', { startDate })
      .andWhere('healthData.isProcessed = true')
      .andWhere('healthData.processedData IS NOT NULL')
      .orderBy('healthData.timestamp', 'DESC')
      .take(20)
      .getMany();

    return insights.map((data) => ({
      id: data.id,
      type: data.type,
      timestamp: data.timestamp,
      value: data.value,
      insights: data.processedData?.insights || [],
      processedAt: data.processedData?.processedAt,
    }));
  }
}
