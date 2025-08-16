import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './invoice.entity';
import { AuthGuard } from '../guards/auth.guard';
import { AccountScopeGuard } from '../guards/account.guard';

@ApiTags('billing-invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully', type: Invoice })
  @Post()
  @UseGuards(AuthGuard, AccountScopeGuard)
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully', type: [Invoice] })
  @Get()
  findAll() {
    return this.invoicesService.findAll();
  }

  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 200, description: 'Invoice found successfully', type: Invoice })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully', type: Invoice })
  @Patch(':id')
  @UseGuards(AuthGuard, AccountScopeGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.remove(id);
  }
}


