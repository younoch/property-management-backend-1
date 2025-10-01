import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, FindOptionsOrder, IsNull } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { AuditLogResponseDto, PaginatedAuditLogsResponseDto } from './dto/audit-log-response.dto';

import { AuditAction } from './enums/audit-action.enum';

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
    oldValue,
    newValue,
    description,
  }: {
    entityType: string;
    entityId: number | string;
    action: AuditAction;
    userId?: number;
    portfolioId?: number;
    metadata?: Record<string, any>;
    oldValue?: any;
    newValue?: any;
    description?: string;
  }): Promise<void> {
    const log = this.auditLogRepository.create({
      entity_type: entityType,
      entity_id: entityId.toString(),
      action,
      user_id: userId,
      portfolio_id: portfolioId,
      metadata: {
        ...(Object.keys(metadata).length > 0 ? metadata : {}),
        ...(oldValue ? { oldValue } : {}),
        ...(newValue ? { newValue } : {}),
      },
      description,
      timestamp: new Date(),
    });

    await this.auditLogRepository.save(log);
  }

  /**
   * Find audit logs with filtering and pagination
   */
  async findWithPagination(
    query: AuditLogQueryDto
  ): Promise<PaginatedAuditLogsResponseDto> {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      ...filters
    } = query;

    const skip = (page - 1) * limit;
    
    // Log the filters being applied
    console.log('=== APPLYING FILTERS ===');
    console.log('Pagination:', { page, limit, skip });
    console.log('Date range:', { startDate, endDate });
    console.log('Filters:', JSON.stringify(filters, null, 2));

    // Handle portfolio filtering
    if ('portfolioId' in filters && filters.portfolioId !== undefined) {
        const portfolioId = Number(filters.portfolioId);
        
        // First check if we need to filter by portfolio
        // This is a more complex query that might need to join with related tables
        // For now, we'll implement a basic version that checks both direct portfolio_id
        // and looks for propertyId in metadata that belongs to the portfolio
        
        // Define field mapping for sorting
        const fieldMap = {
          'createdAt': 'timestamp',
          'action': 'action',
          'entityType': 'entity_type',
          'entityId': 'entity_id',
          'timestamp': 'timestamp'
        };
        
        const sortField = fieldMap[query.sortBy] || 'timestamp';
        const sortOrder = (query.sortOrder || 'DESC').toUpperCase() as 'ASC' | 'DESC';
        
        // Create a complex where condition using QueryBuilder
        const queryBuilder = this.auditLogRepository.createQueryBuilder('audit_log');
        
        // Base query with pagination
        queryBuilder
          .where('audit_log.portfolio_id = :portfolioId', { portfolioId })
          .orWhere((qb) => {
            // For logs that have a propertyId in metadata, we need to check if that property belongs to the portfolio
            // This is a simplified version - you might need to adjust based on your actual schema
            const subQuery = qb.subQuery()
              .select('property.id')
              .from('properties', 'property')
              .where('property.portfolio_id = :portfolioId', { portfolioId })
              .getQuery();
              
            return 'audit_log.metadata::json->\'propertyId\' IS NOT NULL ' +
                   `AND audit_log.metadata::json->>'propertyId' IN (${subQuery})`;
          });
          
        // Apply pagination
        queryBuilder
          .skip(skip)
          .take(limit)
          .orderBy(`audit_log.${sortField}`, sortOrder);
          
        console.log('Executing portfolio-aware query:', queryBuilder.getSql());
        
        // Execute the query and return results
        const [results, total] = await queryBuilder.getManyAndCount();
        
        return new PaginatedAuditLogsResponseDto(
          results.map(log => new AuditLogResponseDto(log)),
          total,
          page,
          limit
        );
      }
      
      // If we get here, we're not filtering by portfolioId, so continue with regular filtering
      const where: FindOptionsWhere<AuditLog> = {};
      
      if (filters.userId) {
        where.user_id = filters.userId;
        console.log('Filtering by userId:', filters.userId);
      }
      
      if (filters.action) {
        where.action = filters.action;
        console.log('Filtering by action:', filters.action);
      }
      
      if (filters.entityType) {
        where.entity_type = filters.entityType;
        console.log('Filtering by entityType:', filters.entityType);
      }
      
      if (filters.entityId) {
        where.entity_id = filters.entityId;
        console.log('Filtering by entityId:', filters.entityId);
      }

    // Handle property filter (assuming it's stored in metadata)
    if (filters.propertyId) {
      where.metadata = { propertyId: filters.propertyId } as any;
      console.log('Filtering by propertyId:', filters.propertyId);
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
      console.log('Filtering by date range:', { start, end });
    }

    // Handle sorting based on query parameters
    const order: FindOptionsOrder<AuditLog> = {};
    // Map frontend field names to database column names
    const fieldMap = {
      'createdAt': 'timestamp',
      'action': 'action',
      'entityType': 'entity_type',
      'entityId': 'entity_id',
      'timestamp': 'timestamp'
    };
    
    const sortField = fieldMap[query.sortBy] || 'timestamp';
    order[sortField] = (query.sortOrder || 'DESC').toUpperCase() as 'ASC' | 'DESC';

    // Log the final query parameters
    console.log('Executing query with:', { 
      where, 
      order, 
      take: limit, 
      skip,
      queryParams: query // Log the original query params for debugging
    });

    try {
      // First, try to get a count to see if any records match the filters
      const count = await this.auditLogRepository.count({ where });
      console.log(`Found ${count} matching records`);

      // If no records match, return empty result early
      if (count === 0) {
        console.log('No records found matching the criteria');
        return new PaginatedAuditLogsResponseDto([], 0, page, limit);
      }

      // Now fetch the paginated results with the same where conditions
      const results = await this.auditLogRepository.find({
        where,
        order,
        take: limit,
        skip,
      });

      console.log(`Retrieved ${results.length} records`);
      
      // If we got results but count is still 0, something is wrong with the count query
      const total = results.length > 0 ? count : 0;
      
      // Log sample of results for debugging
      if (results.length > 0) {
        console.log('Sample result:', {
          id: results[0].id,
          entityType: results[0].entity_type,
          entityId: results[0].entity_id,
          portfolioId: results[0].portfolio_id,
          action: results[0].action,
          timestamp: results[0].timestamp
        });
      }

      return new PaginatedAuditLogsResponseDto(
        results.map(log => new AuditLogResponseDto(log)),
        total,
        page,
        limit
      );
    } catch (error) {
      console.error('Error in findWithPagination:', error);
      throw error; // Re-throw the error to be handled by the controller
    }
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
