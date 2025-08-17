import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from '../tenancy/tenant.entity';
import { AuthGuard } from '../guards/auth.guard';
import { PortfolioScopeGuard } from '../guards/account.guard';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsGlobalController {
  constructor(private readonly tenantsService: TenantsService) {}

  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully', type: [Tenant] })
  @Get()
  findAll() {
    return this.tenantsService.findAll();
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

  @ApiOperation({ summary: 'Create a new tenant for an account' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully', type: Tenant })
  @Post()
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  create(@Param('portfolioId', ParseIntPipe) portfolioId: number, @Body() dto: CreateTenantDto) {
    return this.tenantsService.create({ ...dto, portfolio_id: portfolioId });
  }

  @ApiOperation({ summary: 'Get all tenants for an account' })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully', type: [Tenant] })
  @Get()
  findByPortfolio(@Param('portfolioId', ParseIntPipe) portfolioId: number) {
    return this.tenantsService.findByPortfolio(portfolioId);
  }
}


