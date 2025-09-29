// src/tenants/tenants.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './tenant.entity';
import { AuthGuard } from '../guards/auth.guard';
import { PortfolioScopeGuard } from '../guards/portfolio.guard';
import { FindTenantsDto } from './dto/find-tenants.dto';
import { PaginatedTenantsResponseDto } from './dto/paginated-tenants.dto';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsGlobalController {
  constructor(private readonly tenantsService: TenantsService) {}

  @ApiOperation({ summary: 'Get all tenants (paginated + search)' })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully', type: PaginatedTenantsResponseDto })
  @Get()
  findAll(@Query() query: FindTenantsDto) {
    return this.tenantsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant found successfully', type: Tenant })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update tenant by ID' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully', type: Tenant })
  @Patch(':id')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete tenant by ID' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.remove(id);
  }
}

@ApiTags('tenants')
@Controller('portfolios/:portfolioId/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @ApiOperation({ summary: 'Create a new tenant for a portfolio' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully', type: Tenant })
  @Post()
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  create(@Param('portfolioId', ParseIntPipe) portfolioId: number, @Body() dto: CreateTenantDto) {
    return this.tenantsService.create({ ...dto, portfolio_id: portfolioId });
  }

  @ApiOperation({ summary: 'Get all tenants for a portfolio (paginated + search)' })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully', type: PaginatedTenantsResponseDto })
  @Get()
  findByPortfolio(@Param('portfolioId', ParseIntPipe) portfolioId: number, @Query() query: FindTenantsDto) {
    return this.tenantsService.findByPortfolio(portfolioId, query);
  }
}


