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
export class InvoiceItemsController {
  constructor(private readonly svc: InvoiceItemsService) {}

  @ApiOperation({ summary: 'Create invoice item' })
  @ApiResponse({ status: 201, description: 'Invoice item created', type: InvoiceItem })
  @Post()
  @UseGuards(AuthGuard)
  create(@Body() dto: CreateInvoiceItemDto) {
    return this.svc.create(dto);
  }

  @ApiOperation({ summary: 'List invoice items' })
  @ApiResponse({ status: 200, description: 'Invoice items list', type: [InvoiceItem] })
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @ApiOperation({ summary: 'Get invoice item by ID' })
  @ApiParam({ name: 'id', description: 'Invoice item ID' })
  @ApiResponse({ status: 200, description: 'Invoice item found', type: InvoiceItem })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @ApiOperation({ summary: 'Update invoice item' })
  @ApiParam({ name: 'id', description: 'Invoice item ID' })
  @ApiResponse({ status: 200, description: 'Invoice item updated', type: InvoiceItem })
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInvoiceItemDto) {
    return this.svc.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete invoice item' })
  @ApiParam({ name: 'id', description: 'Invoice item ID' })
  @ApiResponse({ status: 200, description: 'Invoice item deleted' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}


