import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { MaintenanceRequest } from './maintenance-request.entity';
import { WorkOrder } from './work-order.entity';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('maintenance')
@Controller('maintenance')
@UseGuards(AuthGuard)
export class MaintenanceController {
  constructor(private readonly svc: MaintenanceService) {}

  // Maintenance Requests
  @Post('requests')
  @ApiOperation({ summary: 'Create a new maintenance request' })
  @ApiResponse({ status: 201, description: 'Request created', type: MaintenanceRequest })
  createRequest(@Body() dto: CreateMaintenanceRequestDto) {
    return this.svc.createRequest(dto);
  }

  @Get('requests')
  @ApiOperation({ summary: 'List all maintenance requests' })
  @ApiResponse({ status: 200, description: 'Requests list', type: [MaintenanceRequest] })
  listRequests() {
    return this.svc.findAllRequests();
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get maintenance request by ID' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request found', type: MaintenanceRequest })
  getRequest(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findRequest(id);
  }

  @Patch('requests/:id')
  @ApiOperation({ summary: 'Update maintenance request' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request updated', type: MaintenanceRequest })
  updateRequest(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMaintenanceRequestDto) {
    return this.svc.updateRequest(id, dto);
  }

  @Delete('requests/:id')
  @ApiOperation({ summary: 'Delete maintenance request' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request deleted' })
  removeRequest(@Param('id', ParseIntPipe) id: number) {
    return this.svc.removeRequest(id);
  }

  // Work Orders
  @Post('work-orders')
  @ApiOperation({ summary: 'Create a new work order' })
  @ApiResponse({ status: 201, description: 'Work order created', type: WorkOrder })
  createWorkOrder(@Body() dto: CreateWorkOrderDto) {
    return this.svc.createWorkOrder(dto);
  }

  @Get('work-orders')
  @ApiOperation({ summary: 'List all work orders' })
  @ApiResponse({ status: 200, description: 'Work orders list', type: [WorkOrder] })
  listWorkOrders() {
    return this.svc.findAllWorkOrders();
  }

  @Get('work-orders/:id')
  @ApiOperation({ summary: 'Get work order by ID' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @ApiResponse({ status: 200, description: 'Work order found', type: WorkOrder })
  getWorkOrder(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findWorkOrder(id);
  }

  @Patch('work-orders/:id')
  @ApiOperation({ summary: 'Update work order' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @ApiResponse({ status: 200, description: 'Work order updated', type: WorkOrder })
  updateWorkOrder(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkOrderDto) {
    return this.svc.updateWorkOrder(id, dto);
  }

  @Delete('work-orders/:id')
  @ApiOperation({ summary: 'Delete work order' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @ApiResponse({ status: 200, description: 'Work order deleted' })
  removeWorkOrder(@Param('id', ParseIntPipe) id: number) {
    return this.svc.removeWorkOrder(id);
  }
}
