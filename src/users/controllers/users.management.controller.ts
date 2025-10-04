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
import { UsersService } from '../users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../user.entity';
import { AuthGuard } from '../../guards/auth.guard';
import { CsrfGuard } from '../../guards/csrf.guard';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { UserDto, UserResponseDto } from '../dto/user.dto';

@ApiTags('users')
@Controller('users')
export class UsersManagementController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ 
    summary: 'Get all users or search by email',
    description: 'Retrieve a list of all users in the system or search for users by email address. Returns user data excluding sensitive information.'
  })
  @ApiQuery({ 
    name: 'email', 
    description: 'Email address to search for (optional). If provided, returns only users matching this email.',
    required: false,
    example: 'john.doe@example.com',
    type: 'string'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully',
    type: [UserResponseDto],
    schema: {
      example: [
        {
          id: 1,
          email: 'john.doe@example.com',
          name: 'John Doe',
          phone: '+1-555-123-4567',
          role: 'tenant',
          profile_image_url: 'https://example.com/images/profile1.jpg',
          is_active: true,
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-20T14:45:00.000Z'
        },
        {
          id: 2,
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
          phone: '+1-555-987-6543',
          role: 'landlord',
          profile_image_url: 'https://example.com/images/profile2.jpg',
          is_active: true,
          created_at: '2024-01-10T09:15:00.000Z',
          updated_at: '2024-01-18T11:20:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - No valid access token provided or token expired',
    schema: {
      example: {
        message: 'Unauthorized | No valid access token provided or token expired',
        errorType: 'UNAUTHORIZED',
        statusCode: 401
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error - Database or system error',
    schema: {
      example: {
        message: 'Internal server error',
        errorType: 'INTERNAL_ERROR',
        statusCode: 500
      }
    }
  })
  @ApiCookieAuth('access_token')
  @UseGuards(AuthGuard)
  @Get()
  @Serialize(UserResponseDto)
  async findAllUsers(@Query('email') email?: string) {
    if (email) {
      return this.usersService.findByEmail(email);
    }
    return this.usersService.findAll();
  }

  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieve detailed information about a specific user by their ID. Returns user data excluding sensitive information like password hash.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the user',
    example: 1,
    type: 'integer'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User found successfully',
    type: UserResponseDto,
    schema: {
      example: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        phone: '+1-555-123-4567',
        role: 'tenant',
        profile_image_url: 'https://example.com/images/profile.jpg',
        is_active: true,
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-20T14:45:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - No valid access token provided or token expired',
    schema: {
      example: {
        message: 'Unauthorized | No valid access token provided or token expired',
        errorType: 'UNAUTHORIZED',
        statusCode: 401
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    schema: {
      example: {
        message: 'user not found',
        errorType: 'USER_NOT_FOUND',
        statusCode: 404
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error - Database or system error',
    schema: {
      example: {
        message: 'Internal server error',
        errorType: 'INTERNAL_ERROR',
        statusCode: 500
      }
    }
  })
  @ApiCookieAuth('access_token')
  @UseGuards(AuthGuard)
  @Get(':id')
  @Serialize(UserResponseDto)
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  @ApiOperation({ 
    summary: 'Get users by portfolio ID',
    description: 'Retrieve all users associated with a specific portfolio. This is useful for finding tenants, managers, and other users related to a rental portfolio.'
  })
  @ApiParam({ 
    name: 'portfolioId', 
    description: 'Unique identifier of the portfolio to find users for',
    example: 1,
    type: 'integer'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Portfolio users retrieved successfully',
    type: [UserResponseDto],
    schema: {
      example: [
        {
          id: 1,
          email: 'tenant@example.com',
          name: 'John Tenant',
          phone: '+1-555-123-4567',
          role: 'tenant',
          profile_image_url: 'https://example.com/images/tenant.jpg',
          is_active: true,
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-20T14:45:00.000Z'
        },
        {
          id: 2,
          email: 'manager@example.com',
          name: 'Sarah Manager',
          phone: '+1-555-987-6543',
          role: 'manager',
          profile_image_url: 'https://example.com/images/manager.jpg',
          is_active: true,
          created_at: '2024-01-10T09:15:00.000Z',
          updated_at: '2024-01-18T11:20:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - No valid access token provided or token expired',
    schema: {
      example: {
        message: 'Unauthorized | No valid access token provided or token expired',
        errorType: 'UNAUTHORIZED',
        statusCode: 401
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error - Database or system error',
    schema: {
      example: {
        message: 'Internal server error',
        errorType: 'INTERNAL_ERROR',
        statusCode: 500
      }
    }
  })
  @ApiCookieAuth('access_token')
  @UseGuards(AuthGuard)
  @Get('portfolio/:portfolioId')
  @Serialize(UserResponseDto)
  async findUsersByPortfolio(@Param('portfolioId') portfolioId: string) {
    return this.usersService.findByPortfolio(portfolioId);
  }

  @ApiOperation({ 
    summary: 'Update user by ID',
    description: 'Update specific user information. Only provided fields will be updated. Password updates will be automatically hashed.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier (UUID) of the user to update',
    schema: {
      type: 'string',
      format: 'uuid',
      example: '123e4567-e89b-12d3-a456-426614174000'
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully',
    type: UserResponseDto,
    schema: {
      example: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Smith',
        phone: '+1-555-987-6543',
        role: 'tenant',
        profile_image_url: 'https://example.com/images/new-profile.jpg',
        is_active: true,
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-20T16:30:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid data provided',
    schema: {
      example: {
        message: ['email must be an email', 'role must be one of the following values: super_admin, landlord, manager, tenant'],
        errorType: 'VALIDATION_ERROR',
        statusCode: 400
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - No valid access token provided or token expired',
    schema: {
      example: {
        message: 'Unauthorized | No valid access token provided or token expired',
        errorType: 'UNAUTHORIZED',
        statusCode: 401
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - CSRF token missing or invalid',
    schema: {
      example: {
        message: 'CSRF token missing or invalid',
        errorType: 'CSRF_ERROR',
        statusCode: 403
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    schema: {
      example: {
        message: 'user not found',
        errorType: 'USER_NOT_FOUND',
        statusCode: 404
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error - Database or system error',
    schema: {
      example: {
        message: 'Internal server error',
        errorType: 'INTERNAL_ERROR',
        statusCode: 500
      }
    }
  })
  @ApiCookieAuth('access_token')
  @Patch(':id')
  @UseGuards(AuthGuard, CsrfGuard)
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @ApiOperation({ 
    summary: 'Delete user by ID',
    description: 'Permanently remove a user from the system. This action cannot be undone and will also remove associated data.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier (UUID) of the user to delete',
    schema: {
      type: 'string',
      format: 'uuid',
      example: '123e4567-e89b-12d3-a456-426614174000'
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User deleted successfully',
    schema: {
      example: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        phone: '+1-555-123-4567',
        role: 'tenant',
        profile_image_url: 'https://example.com/images/profile.jpg',
        is_active: true,
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-20T14:45:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - No valid access token provided or token expired',
    schema: {
      example: {
        message: 'Unauthorized | No valid access token provided or token expired',
        errorType: 'UNAUTHORIZED',
        statusCode: 401
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - CSRF token missing or invalid',
    schema: {
      example: {
        message: 'CSRF token missing or invalid',
        errorType: 'CSRF_ERROR',
        statusCode: 403
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    schema: {
      example: {
        message: 'user not found',
        errorType: 'USER_NOT_FOUND',
        statusCode: 404
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error - Database or system error',
    schema: {
      example: {
        message: 'Internal server error',
        errorType: 'INTERNAL_ERROR',
        statusCode: 500
      }
    }
  })
  @ApiCookieAuth('access_token')
  @Delete(':id')
  @UseGuards(AuthGuard, CsrfGuard)
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}


