import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';
import { Lease } from '../tenancy/lease.entity';
import { AuthGuard } from '../guards/auth.guard';
import { AccountScopeGuard } from '../guards/account.guard';

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
  @UseGuards(AuthGuard, AccountScopeGuard)
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
@Controller('accounts/:accountId/leases')
export class LeasesController {
  constructor(private readonly leasesService: LeasesService) {}

  @ApiOperation({ summary: 'Create a new lease for an account' })
  @ApiResponse({ status: 201, description: 'Lease created successfully', type: Lease })
  @Post()
  @UseGuards(AuthGuard, AccountScopeGuard)
  create(@Param('accountId', ParseIntPipe) accountId: number, @Body() dto: CreateLeaseDto) {
    return this.leasesService.create({ ...dto, account_id: accountId });
  }

  @ApiOperation({ summary: 'Get all leases for an account' })
  @ApiResponse({ status: 200, description: 'Leases retrieved successfully', type: [Lease] })
  @Get()
  findByAccount(@Param('accountId', ParseIntPipe) accountId: number) {
    return this.leasesService.findByAccount(accountId);
  }
}


