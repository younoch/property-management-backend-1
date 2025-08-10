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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiCookieAuth } from '@nestjs/swagger';
import { CreateUserDto } from './dtos/create-user.dto';
import { SigninDto } from './dtos/signin.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { RefreshTokenResponseDto } from './dtos/refresh-token.dto';
import { SigninResponseDto } from './dtos/signin-response.dto';

@ApiTags('auth')
@Controller('auth')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'Current user information retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiCookieAuth('access_token')
  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @ApiOperation({ summary: 'Sign out user' })
  @ApiResponse({ status: 200, description: 'User signed out successfully' })
  @Post('/signout')
  signOut(@Res({ passthrough: true }) res: Response) {
    // Clear access token cookie
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      expires: new Date(0),
      path: '/',
    });
    
    // Clear refresh token cookie
    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      expires: new Date(0),
      path: '/',
    });
    
    return { message: 'Signed out' };
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully', 
    type: SigninResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Email already in use' })
  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.signup(
      body.email, 
      body.password, 
      body.name, 
      body.phone, 
      body.role || 'tenant'
    );
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);
    
    // Set access token cookie (short-lived)
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: this.parseMaxAge(process.env.JWT_ACCESS_EXPIRES_IN || '15m'),
    });

    // Set refresh token cookie (long-lived)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: this.parseMaxAge(process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
    });

    // Return only user data since tokens are set as HttpOnly cookies
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  @ApiOperation({ summary: 'Sign in user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User signed in successfully', 
    type: SigninResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('/signin')
  async signin(@Body() body: SigninDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.signin(body.email, body.password);
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);
    
    // Set access token cookie (short-lived)
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: this.parseMaxAge(process.env.JWT_ACCESS_EXPIRES_IN || '15m'),
    });

    // Set refresh token cookie (long-lived)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: this.parseMaxAge(process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
    });

    // Return only user data since tokens are set as HttpOnly cookies
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully', type: RefreshTokenResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired refresh token' })
  @ApiCookieAuth('refresh_token')
  @Post('/refresh')
  async refreshToken(@Res({ passthrough: true }) res: Response) {
    const refreshToken = res.req?.cookies?.refresh_token;
    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found');
    }

    const tokens = await this.authService.refreshAccessToken(refreshToken);
    
    // Set new access token cookie
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: this.parseMaxAge(process.env.JWT_ACCESS_EXPIRES_IN || '15m'),
    });

    // Set new refresh token cookie
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: this.parseMaxAge(process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
    });

    return { message: 'Tokens refreshed successfully' };
  }

  private parseMaxAge(exp: string): number {
    // Supports s, m, h, d (defaults to minutes if number)
    const match = /^([0-9]+)([smhd])?$/.exec(exp);
    if (!match) return 15 * 60 * 1000;
    const value = parseInt(match[1], 10);
    const unit = match[2] || 'm';
    const mult = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
    return value * mult;
  }

  @ApiOperation({ summary: 'Find user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found successfully', type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  @ApiOperation({ summary: 'Find all users' })
  @ApiQuery({ name: 'email', description: 'Filter users by email', required: false })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: [UserDto] })
  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  @ApiOperation({ summary: 'Remove user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserDto })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }
}
