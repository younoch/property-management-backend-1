import {
  Body,
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  NotFoundException,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiCookieAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { CsrfGuard } from '../guards/csrf.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto, UserResponseDto } from './dtos/user.dto';

@ApiTags('users')
@Controller('users')
export class UsersManagementController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users or search by email' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: [User] })
  @ApiQuery({ name: 'email', description: 'Email to search for', required: false })
  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @Get()
  @Serialize(UserResponseDto)
  async findAllUsers(@Query('email') email?: string) {
    if (email) {
      return this.usersService.findByEmail(email);
    }
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found successfully', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  @Serialize(UserResponseDto)
  async findUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  @ApiOperation({ summary: 'Get users by account ID' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account users retrieved successfully', type: [User] })
  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @Get('account/:accountId')
  @Serialize(UserResponseDto)
  async findUsersByAccount(@Param('accountId', ParseIntPipe) accountId: number) {
    return this.usersService.findByAccount(accountId);
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiCookieAuth()
  @Patch(':id')
  @UseGuards(AuthGuard, CsrfGuard)
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiCookieAuth()
  @Delete(':id')
  @UseGuards(AuthGuard, CsrfGuard)
  removeUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}


