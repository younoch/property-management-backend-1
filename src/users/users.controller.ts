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
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorResponseDto, SuccessResponseDto } from '../common/dtos/api-response.dto';
import { TokenRefreshInterceptor } from './interceptors/token-refresh.interceptor';
import { CookieOptions } from 'express';

@ApiTags('auth')
@Controller('auth')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({ 
    summary: 'Get current user information',
    description: 'Retrieve complete information about the currently authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Current user information retrieved successfully',
    type: SigninDataDto
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

      return user;
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

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: SigninResponseDto
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
    description: 'Sign in with user credentials. Only email and password are required.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User signed in successfully',
    type: SigninResponseDto
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
    description: 'Get a new access token using a valid refresh token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Access token refreshed successfully',
    type: RefreshTokenResponseDto
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
  async refreshToken(@Body() body: RefreshTokenDto, @Res({ passthrough: true }) res: Response): Promise<any> {
    // Get refresh token from request body or cookies
    let refreshToken = body.refresh_token;
    
    // If not in body, try to get from cookies
    if (!refreshToken) {
      refreshToken = res.req.cookies?.refresh_token;
    }
    
    if (!refreshToken) {
      throw new BadRequestException({
        message: 'Refresh token is required',
        errorType: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    try {
      // Refresh the access token
      const result = await this.authService.refreshAccessToken(refreshToken);
      
      // Set new access token cookie
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
      
      // Set new access token cookie (15 minutes)
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

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('/:id')
  @Serialize(UserResponseDto)
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  @ApiOperation({ summary: 'Get all users or search by email' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @Get()
  @Serialize(UserResponseDto)
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete('/:id')
  @UseGuards(AuthGuard, CsrfGuard)
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch('/:id')
  @UseGuards(AuthGuard, CsrfGuard)
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }
}
