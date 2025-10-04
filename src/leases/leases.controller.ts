import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';
import { AttachTenantsDto } from './dto/attach-tenants.dto';
import { Lease } from './lease.entity';
import { AuthGuard } from '../guards/auth.guard';
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
    @Param('id') id: string
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
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id') id: string, 
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
  remove(@Param('id') id: string) {
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
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async attachTenants(
    @Param('id') id: string, 
    @Body() dto: AttachTenantsDto
  ): Promise<LeaseResponseDto> {
    // Convert tenant_ids to strings if they're numbers
    const tenantIds = dto.tenant_ids.map(id => String(id));
    await this.leasesService.attachTenants(id, tenantIds);
    const lease = await this.leasesService.findOne(id);
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
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async activate(
    @Param('id') id: string
  ): Promise<LeaseResponseDto> {
    const lease = await this.leasesService.activate(id);
    return this.leaseMapper.toResponseDto(lease);
  }
}

@ApiTags('leases')
@Controller('units/:unitId/leases')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
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
  async create(
    @Param('unitId') unitId: string,
    @Body() dto: CreateLeaseDto,
  ): Promise<LeaseResponseDto> {
    const lease = await this.leasesService.create({
      ...dto,
      unit_id: unitId,
    } as any);
    return this.leaseMapper.toResponseDto(lease);
  }

  @ApiOperation({ summary: 'Get all leases' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leases retrieved successfully', 
    type: [LeaseResponseDto] 
  })
  @Get('/all')
  async findAll(): Promise<LeaseResponseDto[]> {
    const leases = await this.leasesService.findAll();
    return this.leaseMapper.toResponseDtos(leases);
  }

  @ApiOperation({ summary: 'Get all leases for a unit' })
  @ApiResponse({ 
    status: 200, 
    description: 'Leases retrieved successfully', 
    type: [LeaseResponseDto] 
  })
  @Get()
  async findByUnit(
    @Param('unitId') unitId: string,
  ): Promise<LeaseResponseDto[]> {
    const leases = await this.leasesService.findByUnit(unitId);
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
  async findOne(
    @Param('id') id: string
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
  async update(
    @Param('id') id: string, 
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
  remove(@Param('id') id: string) {
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
  @UseGuards(AuthGuard)
  async attachTenants(
    @Param('id') id: string, 
    @Body() dto: AttachTenantsDto
  ): Promise<LeaseResponseDto> {
    // Convert tenant_ids to strings if they're numbers
    const tenantIds = dto.tenant_ids.map(id => String(id));
    await this.leasesService.attachTenants(id, tenantIds);
    const lease = await this.leasesService.findOne(id);
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
  @UseGuards(AuthGuard)
  async activate(
    @Param('id') id: string
  ): Promise<LeaseResponseDto> {
    const lease = await this.leasesService.activate(id);
    return this.leaseMapper.toResponseDto(lease);
  }

  @ApiOperation({ summary: 'End a lease' })
  @ApiParam({ name: 'id', description: 'Lease ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lease ended successfully',
    type: LeaseResponseDto
  })
  @Post(':id/end')
  @UseGuards(AuthGuard)
  async endLease(
    @Param('id') leaseId: string,
    @Body() dto: EndLeaseDto,
  ): Promise<LeaseResponseDto> {
    const lease = await this.leasesService.endLease(leaseId, dto.end_date);
    return this.leaseMapper.toResponseDto(lease);
  }
}
