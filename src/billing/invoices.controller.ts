// src/billing/invoices.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse
} from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './entities/invoice.entity';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('billing-invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @ApiOperation({ 
    summary: 'Get invoice by ID',
    description: 'Retrieves a single invoice by its ID'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Invoice ID',
    example: 1
  })
  @ApiOkResponse({ 
    description: 'Invoice found successfully', 
    type: Invoice 
  })
  @ApiNotFoundResponse({ description: 'Invoice not found' })
  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @ApiOperation({ 
    summary: 'Update invoice by ID',
    description: 'Updates an existing invoice. Note: Changing billing_month may be restricted.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Invoice ID to update',
    example: 1
  })
  @ApiBody({ 
    type: UpdateInvoiceDto,
    description: 'Updated invoice data'
  })
  @ApiOkResponse({ 
    description: 'Invoice updated successfully', 
    type: Invoice 
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'Invoice with this billing month already exists for the lease' })
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string, 
    @Body() dto: UpdateInvoiceDto
  ) {
    return this.invoicesService.update(id, dto);
  }


  @ApiOperation({ 
    summary: 'Delete invoice by ID',
    description: 'Marks an invoice as void (soft delete)'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Invoice ID to delete',
    example: 1
  })
  @ApiOkResponse({ 
    description: 'Invoice marked as void successfully' 
  })
  @ApiNotFoundResponse({ description: 'Invoice not found' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ 
    summary: 'Create a new invoice',
    description: 'Creates a new invoice'
  })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiCreatedResponse({ 
    description: 'Invoice created successfully', 
    type: Invoice 
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Lease not found' })
  @ApiConflictResponse({ description: 'Invoice already exists for this lease and billing month' })
  async create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  @Get('by-lease')
  @UseGuards(AuthGuard)
  @ApiOperation({ 
    summary: 'Get invoice by lease and billing month',
    description: 'Retrieves an invoice for the specified lease and billing month'
  })
  @ApiQuery({ 
    name: 'leaseId', 
    required: true, 
    description: 'ID of the lease',
    type: Number 
  })
  @ApiQuery({ 
    name: 'billingMonth', 
    required: true, 
    description: 'Billing month in YYYY-MM format',
    example: '2025-09' 
  })
  @ApiOkResponse({ 
    description: 'Invoice found', 
    type: Invoice 
  })
  @ApiNotFoundResponse({ description: 'Invoice not found' })
  async findByLeaseAndMonth(
    @Query('leaseId') leaseId: string,
    @Query('billingMonth') billingMonth: string
  ) {
    if (!billingMonth || !/^\d{4}-(0[1-9]|1[0-2])$/.test(billingMonth)) {
      throw new BadRequestException('Valid billing month (YYYY-MM) is required');
    }
    return this.invoicesService.findByLeaseAndMonth(leaseId, billingMonth);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ 
    summary: 'Get all invoices',
    description: 'Retrieves all invoices'
  })
  @ApiQuery({
    name: 'billing_month',
    required: false,
    description: 'Filter invoices by billing month (YYYY-MM format)',
    example: '2025-09'
  })
  @ApiOkResponse({ 
    description: 'Invoices retrieved successfully', 
    type: [Invoice] 
  })
  async findAll(@Query('billing_month') billingMonth?: string) {
    if (billingMonth && !/^\d{4}-(0[1-9]|1[0-2])$/.test(billingMonth)) {
      throw new BadRequestException('Invalid billing month format. Use YYYY-MM');
    }
    return this.invoicesService.findAll(billingMonth);
  }
}
