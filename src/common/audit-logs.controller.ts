import { 
  Controller, 
  Get, 
  Query, 
  UseGuards, 
  Param, 
  ParseIntPipe, 
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery,
  ApiParam
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { AuditLogResponseDto, PaginatedAuditLogsResponseDto } from './dto/audit-log-response.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(AuthGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT)
export class AuditLogsController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get audit logs with filtering and pagination',
    description: 'Retrieve audit logs with various filtering options and pagination.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Audit logs retrieved successfully', 
    type: PaginatedAuditLogsResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Query() query: any // Access raw query parameters
  ): Promise<PaginatedAuditLogsResponseDto> {
    try {
      // Log raw query parameters for debugging
      console.log('=== RAW QUERY PARAMETERS ===');
      Object.entries(query).forEach(([key, value]) => {
        console.log(`${key}:`, value, `(type: ${typeof value})`);
      });
      
      // Transform query parameters
      const transformedQuery: AuditLogQueryDto = {
        ...query,
        // Convert page and limit to numbers
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 10,
        
        // Handle portfolioId (supports null/empty values)
        portfolioId: query.portfolioId !== undefined ? 
          (query.portfolioId === 'null' || query.portfolioId === '' ? null : query.portfolioId) : 
          undefined,
          
        // Other ID fields
        propertyId: query.propertyId || undefined,
        userId: query.userId || undefined,
        
        // Additional query parameters
        action: query.action,
        entityType: query.entityType,
        entityId: query.entityId,
        sortBy: query.sortBy || 'timestamp',
        sortOrder: query.sortOrder || 'DESC',
        startDate: query.startDate,
        endDate: query.endDate
      };
      
      console.log('=== TRANSFORMED QUERY ===');
      console.log(JSON.stringify(transformedQuery, null, 2));
      
      const result = await this.auditLogService.findWithPagination(transformedQuery);
      
      console.log('=== QUERY RESULT ===');
      console.log(`Found ${result.total} total records`);
      if (result.data.length > 0) {
        console.log('Sample record:', {
          id: result.data[0].id,
          entityType: result.data[0].entityType,
          entityId: result.data[0].entityId,
          portfolioId: result.data[0].portfolioId,
          action: result.data[0].action,
          timestamp: result.data[0].timestamp
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error in findAll:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
        throw new BadRequestException(error.message);
      }
  }
}

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a single audit log entry',
    description: 'Retrieve a specific audit log entry by its ID.'
  })
  @ApiParam({ name: 'id', type: String, description: 'Audit log ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Audit log entry',
    type: AuditLogResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(
    @Param('id') id: string
  ): Promise<AuditLogResponseDto> {
    try {
      return await this.auditLogService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid audit log ID');
    }
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ 
    summary: 'Get audit logs for a specific entity',
    description: 'Retrieve audit logs for a specific entity by its type and ID.'
  })
  @ApiParam({ name: 'entityType', description: 'Type of the entity (e.g., Payment, Invoice)' })
  @ApiParam({ name: 'entityId', description: 'ID of the entity' })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Maximum number of logs to return (default: 50, max: 100)',
    type: Number
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Audit logs retrieved successfully', 
    type: [AuditLogResponseDto] 
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getEntityLogs(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 50
  ): Promise<AuditLogResponseDto[]> {
    if (limit > 100) {
      throw new BadRequestException('Maximum limit is 100');
    }
    
    try {
      return await this.auditLogService.getEntityLogs(entityType, entityId, limit);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('portfolio/:portfolioId')
  @ApiOperation({ 
    summary: 'Get audit logs for a specific portfolio',
    description: 'Retrieve audit logs for a specific portfolio with optional date range filtering.'
  })
  @ApiParam({ name: 'portfolioId', description: 'ID of the portfolio' })
  @ApiQuery({ 
    name: 'startDate', 
    required: false, 
    description: 'Start date for filtering (ISO date string)' 
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: false, 
    description: 'End date for filtering (ISO date string)' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Maximum number of logs to return (default: 50, max: 100)',
    type: Number
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Audit logs retrieved successfully', 
    type: [AuditLogResponseDto] 
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPortfolioLogs(
    @Param('portfolioId', ParseIntPipe) portfolioId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 50
  ): Promise<AuditLogResponseDto[]> {
    if (limit > 100) {
      throw new BadRequestException('Maximum limit is 100');
    }

    const query: AuditLogQueryDto = {
      portfolioId,
      startDate,
      endDate,
      limit,
      page: 1, // Just get the first page
      sortBy: 'timestamp',
      sortOrder: 'DESC'
    };

    try {
      const result = await this.auditLogService.findWithPagination(query);
      return result.data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}