import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InvoicesService } from '../invoices.service';
import { PaymentsService } from '../payments.service';
import { CreatePaymentLeaseDto } from '../dto/create-payment-lease.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { PortfolioScopeGuard } from '../../guards/portfolio.guard';

@ApiTags('lease-billing')
@Controller('leases/:leaseId')
export class LeaseBillingController {
  constructor(private readonly invoicesService: InvoicesService, private readonly paymentsService: PaymentsService) {}

  @Get('invoices')
  findInvoices(@Param('leaseId', ParseIntPipe) leaseId: number) {
    return this.invoicesService.findByLease(leaseId.toString());
  }

  @Post('invoices/generate-next')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  generateNextInvoice(@Param('leaseId', ParseIntPipe) leaseId: number) {
    return this.invoicesService.generateNextForLease(leaseId.toString());
  }

  @Get('payments')
  findPayments(@Param('leaseId', ParseIntPipe) leaseId: number) {
    return this.paymentsService.findByLease(leaseId.toString());
  }

  @Post('payments')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  createPayment(@Param('leaseId', ParseIntPipe) leaseId: number, @Body() dto: CreatePaymentLeaseDto) {
    return this.paymentsService.createForLease(leaseId.toString(), dto as any);
  }
}
