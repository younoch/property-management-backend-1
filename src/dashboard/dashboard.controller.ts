import { Controller, Get, Query, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiTags, 
  ApiParam,
  ApiQuery 
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { DashboardService } from './dashboard.service';
import { DashboardStatsResponseDto, DashboardFilterDto } from './dto/dashboard-stats.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get dashboard statistics for all properties',
    description: 'Retrieves aggregated statistics across all properties. Use query parameters to filter by date range.'
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date in YYYY-MM-DD format',
    example: '2023-01-01',
    type: String
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date in YYYY-MM-DD format',
    example: '2023-12-31',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved dashboard statistics for all properties',
    type: DashboardStatsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid access token',
  })
  async getDashboardStats(
    @Query() filter?: Omit<DashboardFilterDto, 'propertyId'>,
  ): Promise<DashboardStatsResponseDto> {
    return this.dashboardService.getDashboardStats(filter);
  }

  @Get('properties/:propertyId/stats')
  @ApiOperation({ 
    summary: 'Get dashboard statistics for a specific property',
    description: 'Retrieves statistics for a single property. The property ID is specified in the URL path.'
  })
  @ApiParam({
    name: 'propertyId',
    required: true,
    description: 'ID of the property to get statistics for',
    type: Number,
    example: 1
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date in YYYY-MM-DD format',
    example: '2023-01-01',
    type: String
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date in YYYY-MM-DD format',
    example: '2023-12-31',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved dashboard statistics for the specified property',
    type: DashboardStatsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid access token',
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found - The specified property ID does not exist',
  })
  async getPropertyDashboardStats(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Query() filter?: Omit<DashboardFilterDto, 'propertyId'>,
  ): Promise<DashboardStatsResponseDto> {
    return this.dashboardService.getDashboardStats({
      ...filter,
      propertyId,
    });
  }
}
