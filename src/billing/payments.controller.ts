import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './payment.entity';
import { AuthGuard } from '../guards/auth.guard';
import { PortfolioScopeGuard } from '../guards/portfolio.guard';

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
  @UseGuards(AuthGuard, PortfolioScopeGuard)
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
@Controller('portfolios/:portfolioId/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Record a new payment for a portfolio' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully', type: Payment })
  @Post()
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  create(@Param('portfolioId', ParseIntPipe) portfolioId: number, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create({ ...dto, portfolio_id: portfolioId });
  }

  @ApiOperation({ summary: 'Get all payments for a portfolio' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully', type: [Payment] })
  @Get()
  findByPortfolio(@Param('portfolioId', ParseIntPipe) portfolioId: number) {
    return this.paymentsService.findByPortfolio(portfolioId);
  }
}


