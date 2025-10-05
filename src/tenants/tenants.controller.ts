// src/tenants/tenants.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
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
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @ApiOperation({ 
    summary: 'Update tenant by ID',
    description: 'Update a tenant. This endpoint supports partial updates. Only the fields provided in the request body will be updated.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'The ID of the tenant to update',
    example: '69f7bb02-a487-40dc-86f8-8d09dcaedcc8'
  })
  @ApiBody({
    type: UpdateTenantDto,
    description: 'The tenant data to update. Only include the fields you want to update.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tenant updated successfully', 
    type: Tenant 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tenant not found' 
  })
  @Patch(':id')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  async update(
    @Param('id') id: string, 
    @Body() dto: UpdateTenantDto
  ) {
    return this.tenantsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete tenant by ID' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
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
  create(@Param('portfolioId') portfolioId: string, @Body() dto: CreateTenantDto) {
    return this.tenantsService.create({ ...dto, portfolio_id: portfolioId });
  }

  @ApiOperation({ summary: 'Get all tenants for a portfolio (paginated + search)' })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully', type: PaginatedTenantsResponseDto })
  @Get()
  findByPortfolio(@Param('portfolioId') portfolioId: string, @Query() query: FindTenantsDto) {
    return this.tenantsService.findByPortfolio(portfolioId, query);
  }

  @ApiOperation({ 
    summary: 'Update a tenant in a portfolio',
    description: 'Update a tenant. This endpoint supports both full and partial updates. Only the fields provided in the request body will be updated.'
  })
  @ApiParam({ 
    name: 'portfolioId', 
    description: 'The ID of the portfolio',
    example: 'cf395326-9591-49b9-94de-7abcdfa1f123'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'The ID of the tenant to update',
    example: '69f7bb02-a487-40dc-86f8-8d09dcaedcc8'
  })
  @ApiBody({
    type: UpdateTenantDto,
    description: 'The tenant data to update. Only include the fields you want to update.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tenant updated successfully', 
    type: Tenant 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tenant not found' 
  })
  @Patch(':id')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  async updateInPortfolio(
    @Param('portfolioId') portfolioId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.updateInPortfolio(portfolioId, id, dto);
  }
}


