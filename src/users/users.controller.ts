import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  NotFoundException,
  UseGuards,
  ForbiddenException,
  InternalServerErrorException,
  HttpException,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { SigninDto } from './dtos/signin.dto';
import { SigninResponseDto, SigninDataDto } from './dtos/signin-response.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dtos/refresh-token.dto';
import { UsersService } from './users.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto, UserResponseDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { CsrfGuard } from '../guards/csrf.guard';
import { CookieOptions, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ErrorResponseDto, SuccessResponseDto } from '../common/dtos/api-response.dto';
import { TokenRefreshInterceptor } from './interceptors/token-refresh.interceptor';
import { Public } from '../common/decorators/public.decorator';
import { Req, Res } from '@nestjs/common';

@ApiTags('auth')
@Controller('auth')
@Public()
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({ 
    summary: 'Get current user information',
    description: 'Retrieve complete information about the currently authenticated user including owned portfolios and notifications. Returns full user data excluding sensitive information like password hash.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Current user information retrieved successfully',
    type: UserResponseDto,
    schema: {
      example: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        phone: '+1-555-123-4567',
        role: 'landlord',
        profile_image_url: 'https://example.com/images/profile.jpg',
        is_active: true,
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-20T14:45:00.000Z',
        owned_portfolios: [
          {
            id: 1,
            name: 'Rental Portfolio A',
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z'
          }
        ],
        notifications: [
          {
            id: 1,
            title: 'Maintenance Request Update',
            message: 'Your maintenance request has been updated',
            is_read: false,
            created_at: '2024-01-01T00:00:00.000Z'
          }
        ]
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - No valid access token provided or token expired',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - User account is deactivated',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Not Found - User not found in database',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal Server Error - Database or system error',
    type: ErrorResponseDto
  })
  @Get('/whoami')
  @UseGuards(AuthGuard)
  @UseInterceptors(TokenRefreshInterceptor)
  @Serialize(UserResponseDto)
  async whoAmI(@CurrentUser() user: User): Promise<User> {
    try {
      // Check if user exists and is active
      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
          errorType: 'USER_NOT_FOUND'
        });
      }

      // Check if user account is active
      if (!user.is_active) {
        throw new ForbiddenException({
          message: 'User account is deactivated',
          errorType: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Fetch the full user data with relationships from the database
      const fullUser = await this.usersService.findOne(user.id);
      if (!fullUser) {
        throw new NotFoundException({
          message: 'User not found in database',
          errorType: 'USER_NOT_FOUND'
        });
      }

      return fullUser;
    } catch (error) {
      // Re-throw HTTP exceptions as they are already properly formatted
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Handle unexpected errors
      throw new InternalServerErrorException({
        message: 'Internal server error occurred while retrieving user information',
        errorType: 'INTERNAL_ERROR'
      });
    }
  }

  @ApiOperation({ 
    summary: 'Complete user onboarding',
    description: 'Mark the onboarding process as completed for the current user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Onboarding completed successfully',
    schema: {
      example: {
        success: true,
        message: 'Onboarding completed successfully',
        requires_onboarding: false,
        onboarding_completed_at: '2024-01-15T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Onboarding already completed',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - User not authenticated',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Not Found - User not found',
    type: ErrorResponseDto
  })
  @Post('/complete-onboarding')
  @UseGuards(AuthGuard)
  @Serialize(UserResponseDto)
  async completeOnboarding(@CurrentUser() user: User) {
    try {
      // Check if onboarding is already completed
      if (!user.requires_onboarding) {
        throw new BadRequestException({
          message: 'Onboarding already completed',
          errorType: 'ONBOARDING_ALREADY_COMPLETED'
        });
      }

      // Update user to mark onboarding as completed
      const updatedUser = await this.usersService.update(user.id, {
        requires_onboarding: false,
        onboarding_completed_at: new Date()
      });

      return {
        success: true,
        message: 'Onboarding completed successfully',
        requires_onboarding: updatedUser.requires_onboarding,
        onboarding_completed_at: updatedUser.onboarding_completed_at
      };
    } catch (error) {
      // Re-throw HTTP exceptions as they are already properly formatted
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Handle unexpected errors
      throw new InternalServerErrorException({
        message: 'Failed to complete onboarding',
        errorType: 'INTERNAL_ERROR'
      });
    }
  }

  @ApiOperation({ 
    summary: 'Sign out user',
    description: 'Sign out the currently authenticated user. Clears authentication cookies and CSRF token.'
  })
  @ApiResponse({ status: 200, description: 'User signed out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @Post('/signout')
  @UseGuards(AuthGuard)
  async signout(@Res({ passthrough: true }) res: Response): Promise<any> {
    const clearOpts: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: '/',
      expires: new Date(0),
    };

    res.cookie('access_token', '', clearOpts);
    res.cookie('refresh_token', '', clearOpts);
    res.cookie('csrf_token', '', clearOpts);

    return { success: true, message: 'Signed out successfully' };
  }

  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new user account and automatically sign them in. Returns full user data including owned portfolios and notifications, along with access and refresh tokens.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: SigninResponseDto,
    schema: {
      example: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        phone: '+1-555-123-4567',
        role: 'tenant',
        profile_image_url: null,
        is_active: true,
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-15T10:30:00.000Z',
        owned_portfolios: [],
        notifications: [],
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Email already in use' })
  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Res({ passthrough: true }) res: Response): Promise<any> {
    const user = await this.authService.signup(
      body.email, 
      body.password, 
      body.name, 
      body.phone, 
      body.role || 'tenant'
    );
    const login = this.authService.issueLoginResponse(user);
    
    // Set cookies with proper configuration
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.COOKIE_DOMAIN;
    const cookieHttpOnly = process.env.COOKIE_HTTP_ONLY !== 'false';
    const cookieSameSite = (process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax')) as 'lax' | 'none' | 'strict';
    const cookieSecure = process.env.COOKIE_SECURE === 'true' || isProduction;
    
    const cookieOpts: any = {
      httpOnly: cookieHttpOnly,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      path: '/',
    };
    if (cookieDomain) cookieOpts.domain = cookieDomain;
    
    // Set access token cookie (15 minutes)
    res.cookie('access_token', login.accessToken, {
      ...cookieOpts,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    
    // Set refresh token cookie (7 days)
    res.cookie('refresh_token', login.refreshToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    // Return just the user data with tokens
    return login;
  }

  @ApiOperation({ 
    summary: 'Sign in user',
    description: 'Sign in with user credentials. Only email and password are required. Returns full user data including owned portfolios and notifications, along with access and refresh tokens.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User signed in successfully',
    type: SigninResponseDto,
    schema: {
      example: {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        phone: '+1-555-123-4567',
        role: 'landlord',
        profile_image_url: 'https://example.com/images/profile.jpg',
        is_active: true,
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-20T14:45:00.000Z',
        owned_portfolios: [
          {
            id: 1,
            name: 'Rental Portfolio A',
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z'
          }
        ],
        notifications: [
          {
            id: 1,
            title: 'Maintenance Request Update',
            message: 'Your maintenance request has been updated',
            is_read: false,
            created_at: '2024-01-01T00:00:00.000Z'
          }
        ],
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('/signin')
  async signin(@Body() body: SigninDto, @Res({ passthrough: true }) res: Response): Promise<any> {
    const user = await this.authService.signin(body.email, body.password);
    const login = this.authService.issueLoginResponse(user);
    
    // Set cookies with proper configuration
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.COOKIE_DOMAIN;
    const cookieHttpOnly = process.env.COOKIE_HTTP_ONLY !== 'false';
    const cookieSameSite = (process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax')) as 'lax' | 'none' | 'strict';
    const cookieSecure = process.env.COOKIE_SECURE === 'true' || isProduction;
    
    const cookieOpts: any = {
      httpOnly: cookieHttpOnly,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      path: '/',
    };
    if (cookieDomain) cookieOpts.domain = cookieDomain;
    
    // Set access token cookie (15 minutes)
    res.cookie('access_token', login.accessToken, {
      ...cookieOpts,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    
    // Set refresh token cookie (7 days)
    res.cookie('refresh_token', login.refreshToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    // Return just the user data with tokens
    return login;
  }

  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Get a new access token using a valid refresh token. Returns full user data including owned portfolios and notifications, along with the new access token.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Access token refreshed successfully',
    type: RefreshTokenResponseDto,
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'john.doe@example.com',
          name: 'John Doe',
          phone: '+1-555-123-4567',
          role: 'landlord',
          profile_image_url: 'https://example.com/images/profile.jpg',
          is_active: true,
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-20T14:45:00.000Z',
          owned_portfolios: [
            {
              id: 1,
              name: 'Rental Portfolio A',
              status: 'active',
              created_at: '2024-01-01T00:00:00.000Z'
            }
          ],
          notifications: [
            {
              id: 1,
              title: 'Maintenance Request Update',
              message: 'Your maintenance request has been updated',
              is_read: false,
              created_at: '2024-01-01T00:00:00.000Z'
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired refresh token',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid refresh token',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    type: ErrorResponseDto
  })
  @Post('/refresh')
  @Public()
  async refreshToken(
    @Body() body: RefreshTokenDto, 
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<any> {
    // Get refresh token from request body, cookies, or Authorization header
    let refreshToken = body.refresh_token || 
                      req.cookies?.refresh_token || 
                      req.signedCookies?.refresh_token ||
                      (req.headers.authorization?.startsWith('Bearer ') ? 
                        req.headers.authorization.split(' ')[1] : 
                        null);
    
    if (!refreshToken) {
      throw new BadRequestException({
        message: 'Refresh token is required. Please sign in again.',
        errorType: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    try {
      // Refresh the access token
      const result = await this.authService.refreshAccessToken(refreshToken);
      
      // Set new access token cookie
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieDomain = process.env.COOKIE_DOMAIN;
      const cookieOpts: any = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        ...(cookieDomain && { domain: cookieDomain })
      };
      
      // Set access token cookie (15 minutes)
      res.cookie('access_token', result.access_token, {
        ...cookieOpts,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      
      return result;
    } catch (error) {
      // Clear invalid refresh token cookie
      res.clearCookie('refresh_token', { path: '/' });
      throw error;
    }
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
  @Get('/:id')
  @Serialize(UserResponseDto)
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

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
  @Get()
  @Serialize(UserResponseDto)
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  @ApiOperation({ 
    summary: 'Update user by ID',
    description: 'Update specific user information. Only provided fields will be updated. Password updates will be automatically hashed.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the user to update',
    example: 1,
    type: 'integer'
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
        message: 'Unauthorized',
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
  @Patch('/:id')
  @UseGuards(AuthGuard, CsrfGuard)
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }

  @ApiOperation({ 
    summary: 'Delete user by ID',
    description: 'Permanently remove a user from the system. This action cannot be undone and will also remove associated data.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the user to delete',
    example: 1,
    type: 'integer'
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
        message: 'Unauthorized',
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
  @Delete('/:id')
  @UseGuards(AuthGuard, CsrfGuard)
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }
}
