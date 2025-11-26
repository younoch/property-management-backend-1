import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query, DefaultValuePipe, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from '../invoices/dto/create-payment.dto';
import { UpdatePaymentDto } from '../invoices/dto/update-payment.dto';
import { Payment } from '../payments/entities/payment.entity';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('billing-payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully', type: Payment })
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully', type: [Payment] })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment found successfully', type: Payment })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully', type: Payment })
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully' })
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }

  @Get('property/:propertyId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get payments by property ID with pagination' })
  @ApiParam({
    name: 'propertyId',
    required: true,
    description: 'Property ID (UUID)',
    type: 'string',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (starts from 1)', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number, example: 10 })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    description: 'Field to sort by', 
    enum: ['payment_date', 'amount', 'created_at'],
    example: 'payment_date' 
  })
  @ApiQuery({ 
    name: 'sortOrder', 
    required: false, 
    description: 'Sort order', 
    enum: ['ASC', 'DESC'],
    example: 'DESC' 
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date in YYYY-MM-DD format',
    example: '2023-01-01',
    type: String
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date in YYYY-MM-DD format',
    example: '2023-12-31',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Payments retrieved successfully', 
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(Payment) } },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
  })
  async findByPropertyId(
    @Param('propertyId', new ParseUUIDPipe({ version: '4' })) propertyId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('sortBy') sortBy: string = 'payment_date',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    // Ensure limit isn't too high
    limit = Math.min(100, Math.max(1, limit));
    page = Math.max(1, page);
    
    return this.paymentsService.findByPropertyId(propertyId, {
      page,
      limit,
      sortBy,
      sortOrder,
      startDate,
      endDate
    });
  }
}
