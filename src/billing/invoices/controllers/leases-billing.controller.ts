import { Controller, Get, Post, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { InvoicesService } from '../invoices.service';
import { PaymentsService } from '../../payments/payments.service';
import { CreatePaymentLeaseDto } from '../dto/create-payment-lease.dto';
import { AuthGuard } from '../../../guards/auth.guard';
import { PortfolioScopeGuard } from '../../../guards/portfolio.guard';
import { In } from 'typeorm';
import { Payment } from '../../payments/entities/payment.entity';
import { Invoice } from '../entities/invoice.entity';

@ApiTags('Lease Billing')
@Controller('leases/:leaseId')
@ApiBearerAuth()
@ApiParam({ 
  name: 'leaseId', 
  description: 'Unique identifier of the lease',
  example: '123e4567-e89b-12d3-a456-426614174000',
  required: true 
})
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@UseGuards(AuthGuard, PortfolioScopeGuard)
export class LeaseBillingController {
  constructor(
    private readonly invoicesService: InvoicesService, 
    private readonly paymentsService: PaymentsService
  ) {}

  @Get('invoices')
  @ApiOperation({ 
    summary: 'Get all invoices for a lease',
    description: 'Retrieves a list of all invoices associated with the specified lease.'
  })
  @ApiOkResponse({ 
    description: 'Successfully retrieved lease invoices',
    type: [Invoice]
  })
  @ApiNotFoundResponse({ description: 'Lease not found' })
  async findInvoices(@Param('leaseId') leaseId: string) {
    return this.invoicesService.findByLease(leaseId);
  }

  @Post('invoices/generate-next')
  @ApiOperation({ 
    summary: 'Generate next invoice for lease',
    description: 'Generates the next scheduled invoice for the lease based on the billing cycle.'
  })
  @ApiCreatedResponse({ 
    description: 'Successfully generated next invoice',
    type: Invoice
  })
  @ApiNotFoundResponse({ description: 'Lease not found or no more invoices to generate' })
  generateNextInvoice(@Param('leaseId') leaseId: string) {
    return this.invoicesService.generateNextForLease(leaseId);
  }

  @Get('payments')
  @ApiOperation({ 
    summary: 'Get all payments for a lease',
    description: 'Retrieves all payments associated with invoices for the specified lease.'
  })
  @ApiOkResponse({ 
    description: 'Successfully retrieved lease payments',
    type: [Payment]
  })
  @ApiNotFoundResponse({ description: 'Lease not found' })
  async findPayments(@Param('leaseId') leaseId: string) {
    return this.paymentsService.findByLease(leaseId);
  }

  @Post('payments')
  @ApiOperation({ 
    summary: 'Create a new payment for a lease invoice',
    description: 'Records a payment against a specific invoice for the lease.'
  })
  @ApiBody({ 
    type: CreatePaymentLeaseDto,
    description: 'Payment details',
    required: true
  })
  @ApiCreatedResponse({ 
    description: 'Payment successfully created',
    type: Payment
  })
  @ApiNotFoundResponse({ 
    description: 'Invoice not found or does not belong to the specified lease' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  async createPayment(
    @Param('leaseId') leaseId: string, 
    @Body() dto: CreatePaymentLeaseDto
  ) {
    // Get the invoice and verify it belongs to this lease
    const invoice = await this.invoicesService.findOne(dto.invoice_id);

    if (!invoice || invoice.lease_id !== leaseId) {
      throw new NotFoundException(`No invoice found with ID ${dto.invoice_id} for lease ${leaseId}`);
    }

    // Create the payment using the existing create method
    return this.paymentsService.create({
      invoice_id: dto.invoice_id,
      user_id: dto.user_id,
      received_at: dto.received_at || new Date().toISOString(),
      payment_method: dto.payment_method,
      notes: dto.notes,
      amount: dto.amount,
      reference: dto.reference,
      status: 'succeeded',
      // Apply full payment to the specified invoice
      applications: [{
        invoice_id: dto.invoice_id,
        amount: dto.amount
      }]
    });
  }
}
