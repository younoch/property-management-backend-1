import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LeaseChargesService } from './lease-charges.service';
import { CreateLeaseChargeDto } from './dto/create-lease-charge.dto';
import { UpdateLeaseChargeDto } from './dto/update-lease-charge.dto';
import { LeaseCharge } from './lease-charge.entity';
import { AuthGuard } from '../guards/auth.guard';
import { PortfolioScopeGuard } from '../guards/portfolio.guard';

@ApiTags('lease-charges')
@Controller('lease-charges')
export class LeaseChargesGlobalController {
  constructor(private readonly leaseChargesService: LeaseChargesService) {}

  @ApiOperation({ summary: 'Get all lease charges' })
  @ApiResponse({ status: 200, description: 'Lease charges retrieved successfully', type: [LeaseCharge] })
  @Get()
  findAll() {
    return this.leaseChargesService.findAll();
  }

  @ApiOperation({ summary: 'Get lease charge by ID' })
  @ApiParam({ name: 'id', description: 'Lease charge ID' })
  @ApiResponse({ status: 200, description: 'Lease charge found successfully', type: LeaseCharge })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaseChargesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update lease charge by ID' })
  @ApiParam({ name: 'id', description: 'Lease charge ID' })
  @ApiResponse({ status: 200, description: 'Lease charge updated successfully', type: LeaseCharge })
  @Patch(':id')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  update(@Param('id') id: string, @Body() dto: UpdateLeaseChargeDto) {
    return this.leaseChargesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete lease charge by ID' })
  @ApiParam({ name: 'id', description: 'Lease charge ID' })
  @ApiResponse({ status: 200, description: 'Lease charge deleted successfully' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.leaseChargesService.remove(id);
  }
}

@ApiTags('lease-charges')
@Controller('leases/:leaseId/charges')
export class LeaseChargesController {
  constructor(private readonly leaseChargesService: LeaseChargesService) {}

  @ApiOperation({ summary: 'Create a new lease charge for a lease' })
  @ApiResponse({ status: 201, description: 'Lease charge created successfully', type: LeaseCharge })
  @Post()
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  create(@Param('leaseId') leaseId: string, @Body() dto: CreateLeaseChargeDto) {
    return this.leaseChargesService.create({ 
      ...dto, 
      lease_id: leaseId 
    });
  }

  @ApiOperation({ summary: 'Get all charges for a lease' })
  @ApiResponse({ status: 200, description: 'Lease charges retrieved successfully', type: [LeaseCharge] })
  @Get()
  findByLease(@Param('leaseId') leaseId: string) {
    return this.leaseChargesService.findByLease(leaseId);
  }
}


