import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, FindOptionsOrder } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { AuditLogResponseDto, PaginatedAuditLogsResponseDto } from './dto/audit-log-response.dto';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  PAYMENT = 'PAYMENT',
  INVOICE_ISSUE = 'INVOICE_ISSUE',
  INVOICE_VOID = 'INVOICE_VOID'
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log({
    entityType,
    entityId,
    action,
    userId,
    portfolioId,
    metadata = {},
    description,
  }: {
    entityType: string;
    entityId: number | string;
    action: AuditAction;
    userId?: number;
    portfolioId?: number;
    metadata?: Record<string, any>;
    description?: string;
  }): Promise<void> {
    const log = this.auditLogRepository.create({
      entity_type: entityType,
      entity_id: entityId.toString(),
      action,
      user_id: userId,
      portfolio_id: portfolioId,
      metadata,
      description,
      timestamp: new Date(),
    });

    await this.auditLogRepository.save(log);
  }

  /**
   * Find audit logs with filtering and pagination
   */
  async findWithPagination(query: AuditLogQueryDto): Promise<PaginatedAuditLogsResponseDto> {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      ...filters
    } = query;

    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<AuditLog> = {};

    // Apply filters
    if (filters.portfolioId) where.portfolio_id = filters.portfolioId;
    if (filters.userId) where.user_id = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.entityType) where.entity_type = filters.entityType;
    if (filters.entityId) where.entity_id = filters.entityId;

    // Handle property filter (assuming it's stored in metadata)
    if (filters.propertyId) {
      where.metadata = { propertyId: filters.propertyId } as any;
    }

    // Apply date range filter
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      
      // Set time to end of day for end date
      if (endDate) {
        end.setHours(23, 59, 59, 999);
      }
      
      where.timestamp = Between(start, end);
    }

    // Always sort by timestamp in descending order to get newest first
    const order: FindOptionsOrder<AuditLog> = { timestamp: 'DESC' };

    const [results, total] = await this.auditLogRepository.findAndCount({
      where,
      order,
      take: limit,
      skip,
      relations: ['user'],
    });

    return new PaginatedAuditLogsResponseDto(
      results.map(log => new AuditLogResponseDto(log)),
      total,
      page,
      limit
    );
  }

  /**
   * Find a single audit log by ID
   */
  async findOne(id: number): Promise<AuditLogResponseDto> {
    const log = await this.auditLogRepository.findOne({ 
      where: { id },
      relations: ['user'] // Assuming there's a relation to User
    });
    
    if (!log) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }
    
    return new AuditLogResponseDto(log);
  }

  /**
   * Get logs for a specific entity
   */
  async getEntityLogs(
    entityType: string,
    entityId: number | string,
    limit = 50
  ): Promise<AuditLogResponseDto[]> {
    if (limit > 100) {
      limit = 100; // Enforce maximum limit
    }

    const logs = await this.auditLogRepository.find({
      where: { 
        entity_type: entityType, 
        entity_id: entityId.toString() 
      },
      order: { timestamp: 'DESC' },
      take: limit,
      relations: ['user']
    });

    return logs.map(log => new AuditLogResponseDto(log));
  }
}
