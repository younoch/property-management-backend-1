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
import { PortfolioScopeGuard } from '../guards/portfolio.guard';

@ApiTags('billing-invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesGlobalController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @ApiOperation({ 
    summary: 'Get all invoices',
    description: 'Retrieves a list of all invoices across all portfolios (admin only)'
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
  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Query('billing_month') billingMonth?: string) {
    if (billingMonth && !/^\d{4}-(0[1-9]|1[0-2])$/.test(billingMonth)) {
      throw new BadRequestException('Invalid billing month format. Use YYYY-MM');
    }
    return this.invoicesService.findAll(billingMonth);
  }

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
  findOne(@Param('id', ParseIntPipe) id: number) {
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
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  update(
    @Param('id', ParseIntPipe) id: number, 
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.remove(id);
  }
}

@ApiTags('billing-invoices')
@ApiBearerAuth()
@Controller('portfolios/:portfolioId/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @ApiOperation({ 
    summary: 'Create a new invoice',
    description: 'Creates a new invoice for the specified portfolio. The billing_month must be unique per lease.'
  })
  @ApiParam({ 
    name: 'portfolioId', 
    description: 'ID of the portfolio to create the invoice for',
    example: 1
  })
  @ApiBody({ 
    type: CreateInvoiceDto,
    description: 'Invoice data to create',
    required: true
  })
  @ApiCreatedResponse({ 
    description: 'Invoice created successfully',
    type: Invoice
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data or missing required fields' 
  })
  @ApiConflictResponse({ 
    description: 'An invoice already exists for this lease and billing month' 
  })
  @Post()
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  create(
    @Param('portfolioId', ParseIntPipe) portfolioId: number, 
    @Body() dto: CreateInvoiceDto
  ) {
    return this.invoicesService.create(dto);
  }
  
  @ApiOperation({
    summary: 'Find invoices by lease and billing month',
    description: 'Finds invoices for a specific lease and billing month (YYYY-MM format)'
  })
  @ApiParam({ 
    name: 'portfolioId',
    description: 'ID of the portfolio',
    example: 1
  })
  @ApiQuery({
    name: 'leaseId',
    required: true,
    description: 'ID of the lease to filter by',
    example: 1
  })
  @ApiQuery({
    name: 'billingMonth',
    required: true,
    description: 'Billing month in YYYY-MM format',
    example: '2025-09'
  })
  @ApiOkResponse({
    description: 'List of invoices matching the criteria',
    type: [Invoice]
  })
  @Get('by-lease-month')
  @UseGuards(AuthGuard, PortfolioScopeGuard)
  findByLeaseAndMonth(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query('leaseId', ParseIntPipe) leaseId: number,
    @Query('billingMonth') billingMonth: string
  ) {
    return this.invoicesService.findByLeaseAndMonth(portfolioId, leaseId, billingMonth);
  }

  @ApiOperation({ summary: 'Get all invoices for a portfolio' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully', type: [Invoice] })
  @Get()
  findByPortfolio(@Param('portfolioId', ParseIntPipe) portfolioId: number) {
    return this.invoicesService.findByPortfolio(portfolioId);
  }
}


