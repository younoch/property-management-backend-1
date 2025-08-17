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
import { PortfolioScopeGuard } from '../guards/account.guard';

@ApiTags('maintenance')
@Controller('maintenance')
export class MaintenanceGlobalController {
  constructor(private readonly svc: MaintenanceService) {}

  // Requests
  @ApiOperation({ summary: 'List all maintenance requests' })
  @ApiResponse({ status: 200, description: 'Requests list', type: [MaintenanceRequest] })
  @Get('requests')
  listRequests() {
    return this.svc.findAllRequests();
  }

  @ApiOperation({ summary: 'Get maintenance request by ID' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request found', type: MaintenanceRequest })
  @Get('requests/:id')
  getRequest(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findRequest(id);
  }

  @ApiOperation({ summary: 'Update maintenance request' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request updated', type: MaintenanceRequest })
  @Patch('requests/:id')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  updateRequest(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMaintenanceRequestDto) {
    return this.svc.updateRequest(id, dto);
  }

  @ApiOperation({ summary: 'Delete maintenance request' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request deleted' })
  @Delete('requests/:id')
  @UseGuards(AuthGuard)
  removeRequest(@Param('id', ParseIntPipe) id: number) {
    return this.svc.removeRequest(id);
  }

  // Work Orders
  @ApiOperation({ summary: 'List all work orders' })
  @ApiResponse({ status: 200, description: 'Work orders list', type: [WorkOrder] })
  @Get('work-orders')
  listWorkOrders() {
    return this.svc.findAllWorkOrders();
  }

  @ApiOperation({ summary: 'Get work order by ID' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @ApiResponse({ status: 200, description: 'Work order found', type: WorkOrder })
  @Get('work-orders/:id')
  getWorkOrder(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findWorkOrder(id);
  }

  @ApiOperation({ summary: 'Update work order' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @ApiResponse({ status: 200, description: 'Work order updated', type: WorkOrder })
  @Patch('work-orders/:id')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  updateWorkOrder(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkOrderDto) {
    return this.svc.updateWorkOrder(id, dto);
  }

  @ApiOperation({ summary: 'Delete work order' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @ApiResponse({ status: 200, description: 'Work order deleted' })
  @Delete('work-orders/:id')
  @UseGuards(AuthGuard)
  removeWorkOrder(@Param('id', ParseIntPipe) id: number) {
    return this.svc.removeWorkOrder(id);
  }
}

@ApiTags('maintenance')
@Controller('portfolios/:portfolioId/maintenance')
export class MaintenanceController {
  constructor(private readonly svc: MaintenanceService) {}

  // Requests
  @ApiOperation({ summary: 'Create maintenance request for an account' })
  @ApiResponse({ status: 201, description: 'Request created', type: MaintenanceRequest })
  @Post('requests')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  createRequest(@Param('portfolioId', ParseIntPipe) portfolioId: number, @Body() dto: CreateMaintenanceRequestDto) {
    return this.svc.createRequest({ ...dto, portfolio_id: portfolioId });
  }

  @ApiOperation({ summary: 'List maintenance requests for an account' })
  @ApiResponse({ status: 200, description: 'Requests list', type: [MaintenanceRequest] })
  @Get('requests')
  listRequests(@Param('portfolioId', ParseIntPipe) portfolioId: number) {
    return this.svc.findRequestsByPortfolio(portfolioId);
  }

  // Work Orders
  @ApiOperation({ summary: 'Create work order for an account' })
  @ApiResponse({ status: 201, description: 'Work order created', type: WorkOrder })
  @Post('work-orders')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  createWorkOrder(@Param('portfolioId', ParseIntPipe) portfolioId: number, @Body() dto: CreateWorkOrderDto) {
    return this.svc.createWorkOrder({ ...dto, portfolio_id: portfolioId });
  }

  @ApiOperation({ summary: 'List work orders for an account' })
  @ApiResponse({ status: 200, description: 'Work orders list', type: [WorkOrder] })
  @Get('work-orders')
  listWorkOrders(@Param('portfolioId', ParseIntPipe) portfolioId: number) {
    return this.svc.findWorkOrdersByPortfolio(portfolioId);
  }
}


