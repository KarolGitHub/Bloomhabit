import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import {
  SecurityEvent,
  SecurityEventType,
  SecurityEventSeverity,
  SecurityEventStatus,
} from '../../../database/entities/security-event.entity';
import { AuditLogService } from './audit-log.service';
import {
  AuditAction,
  AuditSeverity,
} from '../../../database/entities/audit-log.entity';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @InjectRepository(SecurityEvent)
    private securityEventRepository: Repository<SecurityEvent>,
    private auditLogService: AuditLogService
  ) {}

  async createSecurityEvent(params: {
    userId?: string;
    eventType: SecurityEventType;
    severity: SecurityEventSeverity;
    description: string;
    eventData?: Record<string, any>;
    sourceIpAddress?: string;
    userAgent?: string;
    sessionId?: string;
    location?: string;
    geoLocation?: Record<string, any>;
    threatIndicators?: string;
    iocData?: Record<string, any>;
  }): Promise<SecurityEvent> {
    try {
      const securityEvent = this.securityEventRepository.create({
        ...params,
        status: SecurityEventStatus.OPEN,
        isAutomated: true,
        automatedResponse: this.generateAutomatedResponse(
          params.eventType,
          params.severity
        ),
        responseActions: this.generateResponseActions(
          params.eventType,
          params.severity
        ),
        riskScore: this.calculateRiskScore(
          params.eventType,
          params.severity,
          params.eventData
        ),
      });

      const savedEvent = await this.securityEventRepository.save(securityEvent);

      // Log the security event
      await this.auditLogService.createAuditLog({
        userId: params.userId,
        action: AuditAction.SUSPICIOUS_ACTIVITY,
        severity: this.mapSecuritySeverityToAuditSeverity(params.severity),
        resource: 'security_event',
        resourceId: savedEvent.id,
        description: `Security event: ${params.eventType}`,
        metadata: { securityEvent: params },
        isSuccessful: true,
      });

      // Handle critical events immediately
      if (params.severity === SecurityEventSeverity.CRITICAL) {
        await this.handleCriticalEvent(savedEvent);
      }

      return savedEvent;
    } catch (error) {
      this.logger.error('Failed to create security event', error);
      return null;
    }
  }

  async getSecurityEvents(filter?: {
    severity?: SecurityEventSeverity;
    status?: SecurityEventStatus;
    eventType?: SecurityEventType;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<{ events: SecurityEvent[]; total: number }> {
    const queryBuilder =
      this.securityEventRepository.createQueryBuilder('securityEvent');

    if (filter?.severity) {
      queryBuilder.andWhere('securityEvent.severity = :severity', {
        severity: filter.severity,
      });
    }

    if (filter?.status) {
      queryBuilder.andWhere('securityEvent.status = :status', {
        status: filter.status,
      });
    }

    if (filter?.eventType) {
      queryBuilder.andWhere('securityEvent.eventType = :eventType', {
        eventType: filter.eventType,
      });
    }

    if (filter?.userId) {
      queryBuilder.andWhere('securityEvent.userId = :userId', {
        userId: filter.userId,
      });
    }

    if (filter?.startDate && filter?.endDate) {
      queryBuilder.andWhere(
        'securityEvent.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate: filter.startDate,
          endDate: filter.endDate,
        }
      );
    }

    const total = await queryBuilder.getCount();
    const events = await queryBuilder
      .orderBy('securityEvent.createdAt', 'DESC')
      .limit(filter?.limit || 100)
      .getMany();

    return { events, total };
  }

  async getSecurityEventById(id: string): Promise<SecurityEvent> {
    return this.securityEventRepository.findOne({ where: { id } });
  }

  async updateSecurityEventStatus(
    id: string,
    status: SecurityEventStatus,
    notes?: string
  ): Promise<SecurityEvent> {
    const event = await this.getSecurityEventById(id);
    if (!event) {
      throw new Error('Security event not found');
    }

    event.status = status;
    if (notes) {
      event.investigationNotes = notes;
    }

    if (
      status === SecurityEventStatus.INVESTIGATING &&
      !event.investigationStartedAt
    ) {
      event.investigationStartedAt = new Date();
    }

    if (status === SecurityEventStatus.RESOLVED) {
      event.resolvedAt = new Date();
    }

    const updatedEvent = await this.securityEventRepository.save(event);

    // Log the status update
    await this.auditLogService.createAuditLog({
      userId: event.userId,
      action: AuditAction.PERMISSION_CHANGE,
      severity: AuditSeverity.MEDIUM,
      resource: 'security_event',
      resourceId: event.id,
      description: `Security event status updated to ${status}`,
      metadata: { previousStatus: event.status, newStatus: status, notes },
      isSuccessful: true,
    });

    return updatedEvent;
  }

  async assignSecurityEvent(
    id: string,
    assignedTo: string
  ): Promise<SecurityEvent> {
    const event = await this.getSecurityEventById(id);
    if (!event) {
      throw new Error('Security event not found');
    }

    event.assignedTo = assignedTo;
    const updatedEvent = await this.securityEventRepository.save(event);

    await this.auditLogService.createAuditLog({
      userId: event.userId,
      action: AuditAction.PERMISSION_CHANGE,
      severity: AuditSeverity.LOW,
      resource: 'security_event',
      resourceId: event.id,
      description: `Security event assigned to ${assignedTo}`,
      metadata: { assignedTo },
      isSuccessful: true,
    });

    return updatedEvent;
  }

  async getSecurityDashboard(): Promise<any> {
    const [criticalEvents, highEvents, openEvents, recentEvents] =
      await Promise.all([
        this.securityEventRepository.count({
          where: { severity: SecurityEventSeverity.CRITICAL },
        }),
        this.securityEventRepository.count({
          where: { severity: SecurityEventSeverity.HIGH },
        }),
        this.securityEventRepository.count({
          where: { status: SecurityEventStatus.OPEN },
        }),
        this.securityEventRepository.find({
          order: { createdAt: 'DESC' },
          take: 10,
        }),
      ]);

    const eventTypeStats = await this.securityEventRepository
      .createQueryBuilder('securityEvent')
      .select('securityEvent.eventType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('securityEvent.eventType')
      .getRawMany();

    const eventTypeMap = {};
    eventTypeStats.forEach((item) => {
      eventTypeMap[item.securityEvent_eventType] = parseInt(item.count);
    });

    return {
      criticalEvents,
      highEvents,
      openEvents,
      recentEvents,
      eventTypeStats: eventTypeMap,
      riskLevel: this.calculateOverallRiskLevel(criticalEvents, highEvents),
    };
  }

  async detectSuspiciousActivity(
    userId: string,
    action: string,
    metadata: any
  ): Promise<boolean> {
    const suspiciousPatterns = await this.analyzeUserBehavior(
      userId,
      action,
      metadata
    );

    if (suspiciousPatterns.length > 0) {
      await this.createSecurityEvent({
        userId,
        eventType: SecurityEventType.UNUSUAL_ACTIVITY_PATTERN,
        severity: SecurityEventSeverity.MEDIUM,
        description: `Suspicious activity detected: ${action}`,
        eventData: { action, metadata, patterns: suspiciousPatterns },
        threatIndicators: suspiciousPatterns.join(', '),
      });
      return true;
    }

    return false;
  }

  async monitorFailedLogins(
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    const recentFailures = await this.auditLogService.getFailedLoginAttempts(
      userId,
      15
    );

    if (recentFailures.length >= 5) {
      await this.createSecurityEvent({
        userId,
        eventType: SecurityEventType.MULTIPLE_FAILED_LOGINS,
        severity: SecurityEventSeverity.HIGH,
        description: 'Multiple failed login attempts detected',
        eventData: {
          failedAttempts: recentFailures.length,
          timeWindow: '15 minutes',
        },
        sourceIpAddress: ipAddress,
        userAgent,
        threatIndicators: 'Brute force attack attempt',
        requiresEscalation: true,
      });
    }
  }

  async checkIpReputation(ipAddress: string): Promise<boolean> {
    // Mock IP reputation check
    const suspiciousIPs = ['192.168.1.100', '10.0.0.50'];
    const isSuspicious = suspiciousIPs.includes(ipAddress);

    if (isSuspicious) {
      await this.createSecurityEvent({
        eventType: SecurityEventType.SUSPICIOUS_IP_ADDRESS,
        severity: SecurityEventSeverity.MEDIUM,
        description: `Suspicious IP address detected: ${ipAddress}`,
        sourceIpAddress: ipAddress,
        threatIndicators: 'Known malicious IP',
        iocData: { ipAddress, reputation: 'malicious' },
      });
    }

    return isSuspicious;
  }

  private generateAutomatedResponse(
    eventType: SecurityEventType,
    severity: SecurityEventSeverity
  ): string {
    switch (eventType) {
      case SecurityEventType.MULTIPLE_FAILED_LOGINS:
        return 'Account temporarily locked, user notified';
      case SecurityEventType.SUSPICIOUS_IP_ADDRESS:
        return 'IP blocked, additional verification required';
      case SecurityEventType.UNUSUAL_ACTIVITY_PATTERN:
        return 'Activity flagged for review, enhanced monitoring enabled';
      default:
        return 'Event logged for investigation';
    }
  }

  private generateResponseActions(
    eventType: SecurityEventType,
    severity: SecurityEventSeverity
  ): Record<string, any> {
    const actions = {};

    if (severity === SecurityEventSeverity.CRITICAL) {
      actions.immediate = [
        'Block access',
        'Notify security team',
        'Enable enhanced monitoring',
      ];
    }

    if (severity === SecurityEventSeverity.HIGH) {
      actions.high = [
        'Require additional verification',
        'Monitor closely',
        'Log all activity',
      ];
    }

    if (eventType === SecurityEventType.MULTIPLE_FAILED_LOGINS) {
      actions.specific = [
        'Temporary account lockout',
        'Password reset required',
        'IP monitoring',
      ];
    }

    return actions;
  }

  private calculateRiskScore(
    eventType: SecurityEventType,
    severity: SecurityEventSeverity,
    eventData?: Record<string, any>
  ): Record<string, any> {
    let baseScore = 0;

    switch (severity) {
      case SecurityEventSeverity.CRITICAL:
        baseScore = 90;
        break;
      case SecurityEventSeverity.HIGH:
        baseScore = 70;
        break;
      case SecurityEventSeverity.MEDIUM:
        baseScore = 50;
        break;
      case SecurityEventSeverity.LOW:
        baseScore = 30;
        break;
    }

    // Adjust score based on event type
    switch (eventType) {
      case SecurityEventType.ACCOUNT_TAKEOVER_ATTEMPT:
        baseScore += 20;
        break;
      case SecurityEventType.DATA_LEAK_ATTEMPT:
        baseScore += 15;
        break;
      case SecurityEventType.BRUTE_FORCE_ATTACK:
        baseScore += 10;
        break;
    }

    return {
      overall: Math.min(baseScore, 100),
      factors: { severity, eventType, baseScore },
      timestamp: new Date(),
    };
  }

  private calculateOverallRiskLevel(
    criticalEvents: number,
    highEvents: number
  ): string {
    if (criticalEvents > 0) return 'CRITICAL';
    if (highEvents > 5) return 'HIGH';
    if (highEvents > 0) return 'MEDIUM';
    return 'LOW';
  }

  private async analyzeUserBehavior(
    userId: string,
    action: string,
    metadata: any
  ): Promise<string[]> {
    const patterns = [];

    // Mock behavior analysis
    if (action === 'data_export' && metadata?.size > 1000000) {
      patterns.push('Large data export');
    }

    if (action === 'login' && metadata?.location !== 'usual_location') {
      patterns.push('Unusual login location');
    }

    if (
      action === 'permission_change' &&
      metadata?.permissions?.includes('admin')
    ) {
      patterns.push('Admin permission request');
    }

    return patterns;
  }

  private mapSecuritySeverityToAuditSeverity(
    securitySeverity: SecurityEventSeverity
  ): AuditSeverity {
    switch (securitySeverity) {
      case SecurityEventSeverity.CRITICAL:
        return AuditSeverity.CRITICAL;
      case SecurityEventSeverity.HIGH:
        return AuditSeverity.HIGH;
      case SecurityEventSeverity.MEDIUM:
        return AuditSeverity.MEDIUM;
      case SecurityEventSeverity.LOW:
        return AuditSeverity.LOW;
      default:
        return AuditSeverity.MEDIUM;
    }
  }

  private async handleCriticalEvent(event: SecurityEvent): Promise<void> {
    this.logger.error(`CRITICAL SECURITY EVENT: ${event.eventType}`, {
      eventId: event.id,
      userId: event.userId,
      description: event.description,
    });

    // In production, implement immediate response actions
    // - Send alerts to security team
    // - Block suspicious IPs
    // - Lock compromised accounts
    // - Initiate incident response procedures
  }
}
