import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InvoicesService } from '../invoices.service';
import { PaymentsService } from '../../payments/payments.service';
import { CreatePaymentLeaseDto } from '../dto/create-payment-lease.dto';
import { AuthGuard } from '../../../guards/auth.guard';
import { PortfolioScopeGuard } from '../../../guards/portfolio.guard';

@ApiTags('lease-billing')
@Controller('leases/:leaseId')
export class LeaseBillingController {
  constructor(private readonly invoicesService: InvoicesService, private readonly paymentsService: PaymentsService) {}

  @Get('invoices')
  async findInvoices(@Param('leaseId') leaseId: string) {
    const invoices = await this.invoicesService.findByLease(leaseId);
    return invoices;
  }

  @Post('invoices/generate-next')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  generateNextInvoice(@Param('leaseId') leaseId: string) {
    return this.invoicesService.generateNextForLease(leaseId);
  }

  @Get('payments')
  findPayments(@Param('leaseId') leaseId: string) {
    return this.paymentsService.findByLease(leaseId);
  }

  @Post('payments')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  createPayment(@Param('leaseId') leaseId: string, @Body() dto: CreatePaymentLeaseDto) {
    return this.paymentsService.createForLease(leaseId, dto as any);
  }
}
