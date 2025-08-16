import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './payment.entity';
import { AuthGuard } from '../guards/auth.guard';
import { AccountScopeGuard } from '../guards/account.guard';

@ApiTags('billing-payments')
@Controller('payments')
export class PaymentsGlobalController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully', type: [Payment] })
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment found successfully', type: Payment })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully', type: Payment })
  @Patch(':id')
  @UseGuards(AuthGuard, AccountScopeGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.remove(id);
  }
}

@ApiTags('billing-payments')
@Controller('accounts/:accountId/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Record a new payment for an account' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully', type: Payment })
  @Post()
  @UseGuards(AuthGuard, AccountScopeGuard)
  create(@Param('accountId', ParseIntPipe) accountId: number, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create({ ...dto, account_id: accountId });
  }

  @ApiOperation({ summary: 'Get all payments for an account' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully', type: [Payment] })
  @Get()
  findByAccount(@Param('accountId', ParseIntPipe) accountId: number) {
    return this.paymentsService.findByAccount(accountId);
  }
}


