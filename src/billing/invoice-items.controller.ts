import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InvoiceItemsService } from './invoice-items.service';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';
import { InvoiceItem } from './invoice-item.entity';
import { AuthGuard } from '../guards/auth.guard';
import { AccountScopeGuard } from '../guards/account.guard';

@ApiTags('invoice-items')
@Controller('invoice-items')
export class InvoiceItemsGlobalController {
  constructor(private readonly invoiceItemsService: InvoiceItemsService) {}

  @ApiOperation({ summary: 'Get all invoice items' })
  @ApiResponse({ status: 200, description: 'Invoice items retrieved successfully', type: [InvoiceItem] })
  @Get()
  findAll() {
    return this.invoiceItemsService.findAll();
  }

  @ApiOperation({ summary: 'Get invoice item by ID' })
  @ApiParam({ name: 'id', description: 'Invoice item ID' })
  @ApiResponse({ status: 200, description: 'Invoice item found successfully', type: InvoiceItem })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceItemsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update invoice item by ID' })
  @ApiParam({ name: 'id', description: 'Invoice item ID' })
  @ApiResponse({ status: 200, description: 'Invoice item updated successfully', type: InvoiceItem })
  @Patch(':id')
  @UseGuards(AuthGuard, AccountScopeGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInvoiceItemDto) {
    return this.invoiceItemsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete invoice item by ID' })
  @ApiParam({ name: 'id', description: 'Invoice item ID' })
  @ApiResponse({ status: 200, description: 'Invoice item deleted successfully' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceItemsService.remove(id);
  }
}

@ApiTags('invoice-items')
@Controller('invoices/:invoiceId/items')
export class InvoiceItemsController {
  constructor(private readonly invoiceItemsService: InvoiceItemsService) {}

  @ApiOperation({ summary: 'Create a new invoice item for an invoice' })
  @ApiResponse({ status: 201, description: 'Invoice item created successfully', type: InvoiceItem })
  @Post()
  @UseGuards(AuthGuard, AccountScopeGuard)
  create(@Param('invoiceId', ParseIntPipe) invoiceId: number, @Body() dto: CreateInvoiceItemDto) {
    return this.invoiceItemsService.create({ ...dto, invoice_id: invoiceId });
  }

  @ApiOperation({ summary: 'Get all items for an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice items retrieved successfully', type: [InvoiceItem] })
  @Get()
  findByInvoice(@Param('invoiceId', ParseIntPipe) invoiceId: number) {
    return this.invoiceItemsService.findByInvoice(invoiceId);
  }
}


