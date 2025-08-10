import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiCookieAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './account.entity';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully', type: Account })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully', type: [Account] })
  @Get()
  findAll() {
    return this.accountsService.findAll();
  }

  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account found successfully', type: Account })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Get accounts by landlord ID' })
  @ApiParam({ name: 'landlordId', description: 'Landlord ID' })
  @ApiResponse({ status: 200, description: 'Landlord accounts retrieved successfully', type: [Account] })
  @Get('landlord/:landlordId')
  findByLandlord(@Param('landlordId') landlordId: string) {
    return this.accountsService.findByLandlord(+landlordId);
  }

  @ApiOperation({ summary: 'Update account by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account updated successfully', type: Account })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(+id, updateAccountDto);
  }

  @ApiOperation({ summary: 'Delete account by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsService.remove(+id);
  }
} 