// src/leases/leases.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';
import { AttachTenantsDto } from './dto/attach-tenants.dto';
import { Lease } from '../tenancy/lease.entity';
import { AuthGuard } from '../guards/auth.guard';
import { PortfolioScopeGuard } from '../guards/portfolio.guard';
import { EndLeaseDto } from './dto/end-lease.dto';
import { LeaseResponseDto } from '../tenancy/dto/lease-response.dto';
import { LeaseMapper } from '../tenancy/mappers/lease.mapper';

@ApiTags('leases')
@Controller('leases')
export class LeasesGlobalController {
  constructor(private readonly leasesService: LeasesService) {}

  private readonly leaseMapper = new LeaseMapper();

  @ApiOperation({ summary: 'Get all leases' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leases retrieved successfully', 
    type: [LeaseResponseDto] 
  })
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(): Promise<LeaseResponseDto[]> {
    const leases = await this.leasesService.findAll();
    return this.leaseMapper.toResponseDtos(leases);
  }

  @ApiOperation({ summary: 'Get lease by ID' })
  @ApiParam({ name: 'id', description: 'Lease ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lease found successfully', 
    type: LeaseResponseDto 
  })
  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(
    @Param('id', ParseIntPipe) id: number
  ): Promise<LeaseResponseDto> {
    const lease = await this.leasesService.findOne(id);
    return this.leaseMapper.toResponseDto(lease);
  }

  @ApiOperation({ summary: 'Update lease by ID' })
  @ApiParam({ name: 'id', description: 'Lease ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lease updated successfully', 
    type: LeaseResponseDto 
  })
  @Patch(':id')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() dto: UpdateLeaseDto
  ): Promise<LeaseResponseDto> {
    const lease = await this.leasesService.update(id, dto);
    return this.leaseMapper.toResponseDto(lease);
  }

  @ApiOperation({ summary: 'Delete lease by ID' })
  @ApiParam({ name: 'id', description: 'Lease ID' })
  @ApiResponse({ status: 200, description: 'Lease deleted successfully' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leasesService.remove(id);
  }

  @ApiOperation({ summary: 'Attach tenants to a lease' })
  @ApiParam({ name: 'id', description: 'Lease ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tenants attached successfully',
    type: LeaseResponseDto
  })
  @Post(':id/tenants')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async attachTenants(
    @Param('id', ParseIntPipe) id: number, 
    @Body() dto: AttachTenantsDto
  ): Promise<LeaseResponseDto> {
    const lease = await this.leasesService.findOne(id);
    await this.leasesService.attachTenants(id, dto.tenant_ids);
    return this.leaseMapper.toResponseDto(lease);
  }

  @ApiOperation({ summary: 'Activate a lease' })
  @ApiParam({ name: 'id', description: 'Lease ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lease activated successfully', 
    type: LeaseResponseDto 
  })
  @Post(':id/activate')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async activate(
    @Param('id', ParseIntPipe) id: number
  ): Promise<LeaseResponseDto> {
    const lease = await this.leasesService.activate(id);
    return this.leaseMapper.toResponseDto(lease);
  }
}

@ApiTags('leases')
@Controller('portfolios/:portfolioId/units/:unitId/leases')
@UseInterceptors(ClassSerializerInterceptor)
export class LeasesController {
  constructor(
    private readonly leasesService: LeasesService,
    private readonly leaseMapper: LeaseMapper
  ) {}

  @ApiOperation({ summary: 'Create a new lease for a unit' })
  @ApiResponse({ 
    status: 201, 
    description: 'Lease created successfully', 
    type: LeaseResponseDto 
  })
  @Post()
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  async create(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
    @Body() dto: CreateLeaseDto,
  ): Promise<LeaseResponseDto> {
    const lease = await this.leasesService.create({ 
      ...dto, 
      portfolio_id: portfolioId, 
      unit_id: unitId 
    });
    return this.leaseMapper.toResponseDto(lease);
  }

  @ApiOperation({ summary: 'Get all leases for a unit' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leases retrieved successfully', 
    type: [LeaseResponseDto] 
  })
  @Get()
  async findByUnit(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
  ): Promise<LeaseResponseDto[]> {
    // Get the leases from the service
    const leases = await this.leasesService.findByUnit(portfolioId, unitId);
    
    // If no leases found, return empty array
    if (!leases || leases.length === 0) {
      return [];
    }
    
    // Map each lease to its DTO representation
    return leases.map(lease => this.leaseMapper.toResponseDto(lease));
  }
}

@ApiTags('leases')
@Controller('portfolios/:portfolioId/leases')
@UseInterceptors(ClassSerializerInterceptor)
export class PortfoliosLeasesController {
  constructor(
    private readonly leasesService: LeasesService,
    private readonly leaseMapper: LeaseMapper
  ) {}

  @ApiOperation({ summary: 'End a lease and set unit vacant if ending' })
  @ApiParam({ name: 'portfolioId', description: 'Portfolio ID' })
  @ApiParam({ name: 'leaseId', description: 'Lease ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lease ended successfully',
    type: LeaseResponseDto
  })
  @Post(':leaseId/end')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  async endLease(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Param('leaseId', ParseIntPipe) leaseId: number,
    @Body() dto: EndLeaseDto,
  ): Promise<LeaseResponseDto> {
    const lease = await this.leasesService.endLease(portfolioId, leaseId, dto.end_date);
    return this.leaseMapper.toResponseDto(lease);
  }
}


