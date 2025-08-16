import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Document as Doc } from './document.entity';
import { AuthGuard } from '../guards/auth.guard';
import { AccountScopeGuard } from '../guards/account.guard';

@ApiTags('documents')
@Controller('documents')
export class DocumentsGlobalController {
  constructor(private readonly svc: DocumentsService) {}

  @ApiOperation({ summary: 'List all documents' })
  @ApiResponse({ status: 200, description: 'Documents list', type: [Doc] })
  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @ApiOperation({ summary: 'Get document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document found', type: Doc })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @ApiOperation({ summary: 'Update document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document updated', type: Doc })
  @Patch(':id')
  @UseGuards(AuthGuard, AccountScopeGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDocumentDto) {
    return this.svc.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}

@ApiTags('documents')
@Controller('accounts/:accountId/documents')
export class AccountDocumentsController {
  constructor(private readonly svc: DocumentsService) {}

  @ApiOperation({ summary: 'Create document record for an account (metadata only)' })
  @ApiResponse({ status: 201, description: 'Document created', type: Doc })
  @Post()
  @UseGuards(AuthGuard, AccountScopeGuard)
  create(@Param('accountId', ParseIntPipe) accountId: number, @Body() dto: CreateDocumentDto) {
    return this.svc.create({ ...dto, account_id: accountId });
  }

  @ApiOperation({ summary: 'List documents for an account' })
  @ApiResponse({ status: 200, description: 'Documents list', type: [Doc] })
  @Get()
  findByAccount(@Param('accountId', ParseIntPipe) accountId: number) {
    return this.svc.findByAccount(accountId);
  }
}


