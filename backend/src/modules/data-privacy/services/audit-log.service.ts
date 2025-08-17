import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, In } from 'typeorm';
import {
  AuditLog,
  AuditAction,
  AuditSeverity,
} from '../../../database/entities/audit-log.entity';
import { AuditLogFilterDto, AuditLogSummaryDto } from '../dto/audit-log.dto';

export interface CreateAuditLogParams {
  userId?: string;
  action: AuditAction;
  severity: AuditSeverity;
  resource: string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  isSuccessful: boolean;
  errorMessage?: string;
  requestData?: Record<string, any>;
  responseData?: Record<string, any>;
  processingTimeMs?: number;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>
  ) {}

  async createAuditLog(params: CreateAuditLogParams): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create({
        ...params,
        retentionDate: this.calculateRetentionDate(params.severity),
      });

      const savedLog = await this.auditLogRepository.save(auditLog);

      // Log high severity events to console for immediate attention
      if (
        params.severity === AuditSeverity.HIGH ||
        params.severity === AuditSeverity.CRITICAL
      ) {
        this.logger.warn(
          `High severity audit event: ${params.action} - ${params.description}`,
          {
            userId: params.userId,
            resource: params.resource,
            severity: params.severity,
          }
        );
      }

      return savedLog;
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      // Don't throw error to avoid breaking the main flow
      return null;
    }
  }

  async getAuditLogs(
    filter: AuditLogFilterDto
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('auditLog');

    // Apply filters
    if (filter.action) {
      queryBuilder.andWhere('auditLog.action = :action', {
        action: filter.action,
      });
    }

    if (filter.severity) {
      queryBuilder.andWhere('auditLog.severity = :severity', {
        severity: filter.severity,
      });
    }

    if (filter.resource) {
      queryBuilder.andWhere('auditLog.resource LIKE :resource', {
        resource: `%${filter.resource}%`,
      });
    }

    if (filter.resourceId) {
      queryBuilder.andWhere('auditLog.resourceId = :resourceId', {
        resourceId: filter.resourceId,
      });
    }

    if (filter.ipAddress) {
      queryBuilder.andWhere('auditLog.ipAddress = :ipAddress', {
        ipAddress: filter.ipAddress,
      });
    }

    if (filter.sessionId) {
      queryBuilder.andWhere('auditLog.sessionId = :sessionId', {
        sessionId: filter.sessionId,
      });
    }

    if (filter.isSuccessful !== undefined) {
      queryBuilder.andWhere('auditLog.isSuccessful = :isSuccessful', {
        isSuccessful: filter.isSuccessful,
      });
    }

    if (filter.startDate && filter.endDate) {
      queryBuilder.andWhere(
        'auditLog.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(filter.startDate),
          endDate: new Date(filter.endDate),
        }
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    if (filter.limit) {
      queryBuilder.limit(filter.limit);
    }
    if (filter.offset) {
      queryBuilder.offset(filter.offset);
    }

    // Order by creation date (newest first)
    queryBuilder.orderBy('auditLog.createdAt', 'DESC');

    const logs = await queryBuilder.getMany();

    return { logs, total };
  }

  async getAuditLogById(id: string): Promise<AuditLog> {
    return this.auditLogRepository.findOne({ where: { id } });
  }

  async getUserAuditLogs(userId: string, limit = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getAuditLogSummary(
    filter: AuditLogFilterDto
  ): Promise<AuditLogSummaryDto> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('auditLog');

    // Apply date filters if provided
    if (filter.startDate && filter.endDate) {
      queryBuilder.andWhere(
        'auditLog.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(filter.startDate),
          endDate: new Date(filter.endDate),
        }
      );
    }

    // Get total logs
    const totalLogs = await queryBuilder.getCount();

    // Get severity counts
    const severityCounts = await queryBuilder
      .select('auditLog.severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auditLog.severity')
      .getRawMany();

    const severityMap = {
      [AuditSeverity.LOW]: 0,
      [AuditSeverity.MEDIUM]: 0,
      [AuditSeverity.HIGH]: 0,
      [AuditSeverity.CRITICAL]: 0,
    };

    severityCounts.forEach((item) => {
      severityMap[item.auditLog_severity] = parseInt(item.count);
    });

    // Get success/failure counts
    const successCount = await queryBuilder
      .andWhere('auditLog.isSuccessful = :success', { success: true })
      .getCount();

    const failedCount = totalLogs - successCount;

    // Get top actions
    const topActions = await queryBuilder
      .select('auditLog.action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auditLog.action')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topActionsMap = {};
    topActions.forEach((item) => {
      topActionsMap[item.auditLog_action] = parseInt(item.count);
    });

    // Get top resources
    const topResources = await queryBuilder
      .select('auditLog.resource')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auditLog.resource')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topResourcesMap = {};
    topResources.forEach((item) => {
      topResourcesMap[item.auditLog_resource] = parseInt(item.count);
    });

    // Get recent activity
    const recentActivity = await queryBuilder
      .orderBy('auditLog.createdAt', 'DESC')
      .limit(20)
      .getMany();

    return {
      totalLogs,
      highSeverityCount: severityMap[AuditSeverity.HIGH],
      mediumSeverityCount: severityMap[AuditSeverity.MEDIUM],
      lowSeverityCount: severityMap[AuditSeverity.LOW],
      criticalSeverityCount: severityMap[AuditSeverity.CRITICAL],
      successfulActions: successCount,
      failedActions: failedCount,
      topActions: topActionsMap,
      topResources: topResourcesMap,
      recentActivity,
    };
  }

  async getSecurityEvents(
    severity?: AuditSeverity,
    limit = 100
  ): Promise<AuditLog[]> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .where('auditLog.severity IN (:...severities)', {
        severities: severity
          ? [severity]
          : [AuditSeverity.HIGH, AuditSeverity.CRITICAL],
      })
      .orderBy('auditLog.createdAt', 'DESC')
      .limit(limit);

    return queryBuilder.getMany();
  }

  async getFailedLoginAttempts(
    userId: string,
    timeWindowMinutes = 15
  ): Promise<AuditLog[]> {
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    return this.auditLogRepository.find({
      where: {
        userId,
        action: AuditAction.FAILED_LOGIN_ATTEMPT,
        createdAt: Between(cutoffTime, new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getSuspiciousActivity(
    userId: string,
    timeWindowHours = 24
  ): Promise<AuditLog[]> {
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);

    return this.auditLogRepository.find({
      where: {
        userId,
        severity: In([AuditSeverity.HIGH, AuditSeverity.CRITICAL]),
        createdAt: Between(cutoffTime, new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async cleanupOldLogs(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 2); // Keep logs for 2 years

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .from(AuditLog)
      .where('auditLog.retentionDate < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  async exportAuditLogs(
    filter: AuditLogFilterDto,
    format: 'csv' | 'json' = 'json'
  ): Promise<string> {
    const { logs } = await this.getAuditLogs({ ...filter, limit: 10000 }); // Max 10k logs for export

    if (format === 'csv') {
      return this.convertToCSV(logs);
    } else {
      return JSON.stringify(logs, null, 2);
    }
  }

  private convertToCSV(logs: AuditLog[]): string {
    if (logs.length === 0) return '';

    const headers = [
      'ID',
      'User ID',
      'Action',
      'Severity',
      'Resource',
      'Resource ID',
      'Description',
      'IP Address',
      'User Agent',
      'Session ID',
      'Success',
      'Error Message',
      'Processing Time (ms)',
      'Created At',
    ];

    const rows = logs.map((log) => [
      log.id,
      log.userId || '',
      log.action,
      log.severity,
      log.resource,
      log.resourceId || '',
      log.description,
      log.ipAddress || '',
      log.userAgent || '',
      log.sessionId || '',
      log.isSuccessful ? 'Yes' : 'No',
      log.errorMessage || '',
      log.processingTimeMs || 0,
      log.createdAt.toISOString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  private calculateRetentionDate(severity: AuditSeverity): Date {
    const retentionDate = new Date();

    switch (severity) {
      case AuditSeverity.CRITICAL:
        retentionDate.setFullYear(retentionDate.getFullYear() + 7); // 7 years
        break;
      case AuditSeverity.HIGH:
        retentionDate.setFullYear(retentionDate.getFullYear() + 5); // 5 years
        break;
      case AuditSeverity.MEDIUM:
        retentionDate.setFullYear(retentionDate.getFullYear() + 3); // 3 years
        break;
      case AuditSeverity.LOW:
      default:
        retentionDate.setFullYear(retentionDate.getFullYear() + 2); // 2 years
        break;
    }

    return retentionDate;
  }
}
