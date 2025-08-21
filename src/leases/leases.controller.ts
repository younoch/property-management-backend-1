import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';
import { Lease } from '../tenancy/lease.entity';
import { AuthGuard } from '../guards/auth.guard';
import { PortfolioScopeGuard } from '../guards/portfolio.guard';

@ApiTags('leases')
@Controller('leases')
export class LeasesGlobalController {
  constructor(private readonly leasesService: LeasesService) {}

  @ApiOperation({ summary: 'Get all leases' })
  @ApiResponse({ status: 200, description: 'Leases retrieved successfully', type: [Lease] })
  @Get()
  findAll() {
    return this.leasesService.findAll();
  }

  @ApiOperation({ summary: 'Get lease by ID' })
  @ApiParam({ name: 'id', description: 'Lease ID' })
  @ApiResponse({ status: 200, description: 'Lease found successfully', type: Lease })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leasesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update lease by ID' })
  @ApiParam({ name: 'id', description: 'Lease ID' })
  @ApiResponse({ status: 200, description: 'Lease updated successfully', type: Lease })
  @Patch(':id')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLeaseDto) {
    return this.leasesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete lease by ID' })
  @ApiParam({ name: 'id', description: 'Lease ID' })
  @ApiResponse({ status: 200, description: 'Lease deleted successfully' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leasesService.remove(id);
  }
}

@ApiTags('leases')
@Controller('portfolios/:portfolioId/units/:unitId/leases')
export class LeasesController {
  constructor(private readonly leasesService: LeasesService) {}

  @ApiOperation({ summary: 'Create a new lease for a unit' })
  @ApiResponse({ status: 201, description: 'Lease created successfully', type: Lease })
  @Post()
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  create(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
    @Body() dto: CreateLeaseDto,
  ) {
    return this.leasesService.create({ ...dto, portfolio_id: portfolioId, unit_id: unitId });
  }

  @ApiOperation({ summary: 'Get all leases for a unit' })
  @ApiResponse({ status: 200, description: 'Leases retrieved successfully', type: [Lease] })
  @Get()
  findByUnit(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
  ) {
    return this.leasesService.findByUnit(portfolioId, unitId);
  }
}


