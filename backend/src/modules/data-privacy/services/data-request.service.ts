import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DataRequest,
  DataRequestType,
  DataRequestStatus,
  DataFormat,
} from '../../../database/entities/data-request.entity';
import {
  CreateDataRequestDto,
  UpdateDataRequestDto,
  DataRequestFilterDto,
} from '../dto/data-request.dto';
import { AuditLogService } from './audit-log.service';
import {
  AuditAction,
  AuditSeverity,
} from '../../../database/entities/audit-log.entity';

@Injectable()
export class DataRequestService {
  private readonly logger = new Logger(DataRequestService.name);

  constructor(
    @InjectRepository(DataRequest)
    private dataRequestRepository: Repository<DataRequest>,
    private auditLogService: AuditLogService
  ) {}

  async createDataRequest(
    userId: string,
    createDto: CreateDataRequestDto
  ): Promise<DataRequest> {
    const existingRequest = await this.dataRequestRepository.findOne({
      where: {
        userId,
        requestType: createDto.requestType,
        status: DataRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException(
        `A pending ${createDto.requestType} request already exists`
      );
    }

    const dataRequest = this.dataRequestRepository.create({
      ...createDto,
      userId,
      status: DataRequestStatus.PENDING,
    });

    const savedRequest = await this.dataRequestRepository.save(dataRequest);

    await this.auditLogService.createAuditLog({
      userId,
      action: this.getAuditAction(createDto.requestType),
      severity: AuditSeverity.MEDIUM,
      resource: 'data_request',
      resourceId: savedRequest.id,
      description: `Data request created: ${createDto.requestType}`,
      metadata: {
        requestType: createDto.requestType,
        description: createDto.description,
      },
      isSuccessful: true,
    });

    this.processDataRequest(savedRequest.id).catch((error) => {
      this.logger.error(
        `Failed to process data request ${savedRequest.id}`,
        error
      );
    });

    return savedRequest;
  }

  async getDataRequestById(id: string): Promise<DataRequest> {
    const request = await this.dataRequestRepository.findOne({ where: { id } });
    if (!request) {
      throw new NotFoundException('Data request not found');
    }
    return request;
  }

  async getUserDataRequests(
    userId: string,
    filter?: DataRequestFilterDto
  ): Promise<{ requests: DataRequest[]; total: number }> {
    const queryBuilder = this.dataRequestRepository
      .createQueryBuilder('dataRequest')
      .where('dataRequest.userId = :userId', { userId });

    if (filter?.requestType) {
      queryBuilder.andWhere('dataRequest.requestType = :requestType', {
        requestType: filter.requestType,
      });
    }

    if (filter?.isUrgent !== undefined) {
      queryBuilder.andWhere('dataRequest.isUrgent = :isUrgent', {
        isUrgent: filter.isUrgent,
      });
    }

    if (filter?.status) {
      queryBuilder.andWhere('dataRequest.status = :status', {
        status: filter.status,
      });
    }

    const total = await queryBuilder.getCount();
    const requests = await queryBuilder
      .orderBy('dataRequest.createdAt', 'DESC')
      .getMany();

    return { requests, total };
  }

  async updateDataRequest(
    id: string,
    updateDto: UpdateDataRequestDto
  ): Promise<DataRequest> {
    const request = await this.getDataRequestById(id);

    if (request.status !== DataRequestStatus.PENDING) {
      throw new BadRequestException('Cannot update non-pending data request');
    }

    Object.assign(request, updateDto);
    const updatedRequest = await this.dataRequestRepository.save(request);

    await this.auditLogService.createAuditLog({
      userId: request.userId,
      action: AuditAction.DATA_UPDATE,
      severity: AuditSeverity.LOW,
      resource: 'data_request',
      resourceId: request.id,
      description: 'Data request updated',
      metadata: { changes: updateDto },
      isSuccessful: true,
    });

    return updatedRequest;
  }

  async cancelDataRequest(id: string): Promise<DataRequest> {
    const request = await this.getDataRequestById(id);

    if (request.status === DataRequestStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed data request');
    }

    request.status = DataRequestStatus.CANCELLED;
    const cancelledRequest = await this.dataRequestRepository.save(request);

    await this.auditLogService.createAuditLog({
      userId: request.userId,
      action: AuditAction.DATA_DELETE,
      severity: AuditSeverity.LOW,
      resource: 'data_request',
      resourceId: request.id,
      description: 'Data request cancelled',
      metadata: { previousStatus: request.status },
      isSuccessful: true,
    });

    return cancelledRequest;
  }

  async retryDataRequest(id: string): Promise<DataRequest> {
    const request = await this.getDataRequestById(id);

    if (request.status !== DataRequestStatus.FAILED) {
      throw new BadRequestException('Can only retry failed data requests');
    }

    request.status = DataRequestStatus.PENDING;
    request.retryCount += 1;
    request.nextRetryAt = null;
    request.errorMessage = null;

    const retriedRequest = await this.dataRequestRepository.save(request);

    this.processDataRequest(retriedRequest.id).catch((error) => {
      this.logger.error(
        `Failed to retry data request ${retriedRequest.id}`,
        error
      );
    });

    return retriedRequest;
  }

  async getDataRequestStats(userId: string): Promise<any> {
    const requests = await this.dataRequestRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const stats = {
      total: requests.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      byType: {},
    };

    requests.forEach((request) => {
      stats[request.status]++;

      if (!stats.byType[request.requestType]) {
        stats.byType[request.requestType] = 0;
      }
      stats.byType[request.requestType]++;
    });

    return stats;
  }

  private async processDataRequest(requestId: string): Promise<void> {
    const request = await this.getDataRequestById(requestId);

    try {
      request.status = DataRequestStatus.PROCESSING;
      request.startedProcessingAt = new Date();
      await this.dataRequestRepository.save(request);

      await this.delay(2000 + Math.random() * 3000);

      let result;
      switch (request.requestType) {
        case DataRequestType.DATA_PORTABILITY:
          result = await this.processDataPortability(request);
          break;
        case DataRequestType.RIGHT_TO_BE_FORGOTTEN:
          result = await this.processRightToBeForgotten(request);
          break;
        default:
          throw new Error(`Unknown request type: ${request.requestType}`);
      }

      request.status = DataRequestStatus.COMPLETED;
      request.completedAt = new Date();
      request.resultUrl = result.url;
      request.resultChecksum = result.checksum;
      request.resultSizeBytes = result.size;
      request.processingMetadata = result.metadata;

      await this.dataRequestRepository.save(request);

      await this.auditLogService.createAuditLog({
        userId: request.userId,
        action: this.getAuditAction(request.requestType),
        severity: AuditSeverity.LOW,
        resource: 'data_request',
        resourceId: request.id,
        description: `Data request completed: ${request.requestType}`,
        metadata: { result },
        isSuccessful: true,
      });
    } catch (error) {
      this.logger.error(`Failed to process data request ${requestId}`, error);

      request.status = DataRequestStatus.FAILED;
      request.errorMessage = error.message;
      request.retryCount += 1;

      if (request.retryCount < 3) {
        request.nextRetryAt = new Date(Date.now() + 30 * 60 * 1000);
      }

      await this.dataRequestRepository.save(request);

      await this.auditLogService.createAuditLog({
        userId: request.userId,
        action: this.getAuditAction(request.requestType),
        severity: AuditSeverity.HIGH,
        resource: 'data_request',
        resourceId: request.id,
        description: `Data request failed: ${request.requestType}`,
        metadata: { error: error.message, retryCount: request.retryCount },
        isSuccessful: false,
        errorMessage: error.message,
      });
    }
  }

  private async processDataPortability(request: DataRequest): Promise<any> {
    const mockData = {
      user: { id: request.userId, email: 'user@example.com' },
      habits: [{ id: '1', name: 'Exercise', description: 'Daily workout' }],
      logs: [{ id: '1', habitId: '1', completed: true, date: new Date() }],
      settings: { theme: 'dark', notifications: true },
    };

    const dataString = JSON.stringify(mockData, null, 2);
    const checksum = this.generateChecksum(dataString);

    return {
      url: `/api/data-requests/${request.id}/download`,
      checksum,
      size: Buffer.byteLength(dataString, 'utf8'),
      metadata: {
        format: request.preferredFormat,
        dataTypes: Object.keys(mockData),
      },
    };
  }

  private async processRightToBeForgotten(request: DataRequest): Promise<any> {
    const deletedData = {
      user: { id: request.userId },
      habits: 5,
      logs: 150,
      settings: 1,
      analytics: 1000,
    };

    return {
      url: null,
      checksum: null,
      size: 0,
      metadata: { deletedData, confirmation: 'Data deletion completed' },
    };
  }

  private getAuditAction(requestType: DataRequestType): AuditAction {
    switch (requestType) {
      case DataRequestType.DATA_PORTABILITY:
        return AuditAction.DATA_PORTABILITY_REQUEST;
      case DataRequestType.RIGHT_TO_BE_FORGOTTEN:
        return AuditAction.RIGHT_TO_BE_FORGOTTEN_REQUEST;
      default:
        return AuditAction.DATA_ACCESS;
    }
  }

  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
