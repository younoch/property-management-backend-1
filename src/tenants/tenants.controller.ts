import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from '../tenancy/tenant.entity';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully', type: Tenant })
  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete tenant by ID' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tenantsService.remove(id);
  }
}


