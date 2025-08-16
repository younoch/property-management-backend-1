import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LeaseChargesService } from './lease-charges.service';
import { CreateLeaseChargeDto } from './dto/create-lease-charge.dto';
import { UpdateLeaseChargeDto } from './dto/update-lease-charge.dto';
import { LeaseCharge } from './lease-charge.entity';
import { AuthGuard } from '../guards/auth.guard';
import { AccountScopeGuard } from '../guards/account.guard';

@ApiTags('lease-charges')
@Controller('lease-charges')
export class LeaseChargesController {
  constructor(private readonly svc: LeaseChargesService) {}

  @ApiOperation({ summary: 'Create a recurring lease charge template' })
  @ApiResponse({ status: 201, description: 'Lease charge created successfully', type: LeaseCharge })
  @Post()
  @UseGuards(AuthGuard, AccountScopeGuard)
  create(@Body() dto: CreateLeaseChargeDto) {
    return this.svc.create(dto);
  }

  @ApiOperation({ summary: 'Get all lease charges' })
  @ApiResponse({ status: 200, description: 'Lease charges retrieved successfully', type: [LeaseCharge] })
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @ApiOperation({ summary: 'Get lease charge by ID' })
  @ApiParam({ name: 'id', description: 'Lease charge ID' })
  @ApiResponse({ status: 200, description: 'Lease charge found successfully', type: LeaseCharge })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @ApiOperation({ summary: 'Update lease charge' })
  @ApiParam({ name: 'id', description: 'Lease charge ID' })
  @ApiResponse({ status: 200, description: 'Lease charge updated successfully', type: LeaseCharge })
  @Patch(':id')
  @UseGuards(AuthGuard, AccountScopeGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLeaseChargeDto) {
    return this.svc.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete lease charge' })
  @ApiParam({ name: 'id', description: 'Lease charge ID' })
  @ApiResponse({ status: 200, description: 'Lease charge deleted successfully' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}


