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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { SigninDto } from './dtos/signin.dto';
import { SigninResponseDto } from './dtos/signin-response.dto';
import { UsersService } from './users.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { CsrfGuard } from '../guards/csrf.guard';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
@Serialize(UserDto)
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
    type: SigninResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User): SigninResponseDto {
    return user;
  }

  @ApiOperation({ 
    summary: 'Sign out user',
    description: 'Sign out the currently authenticated user. Clears authentication cookies and CSRF token.'
  })
  @ApiResponse({ status: 200, description: 'User signed out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @Post('/signout')
  @UseGuards(AuthGuard)
  signOut(@Res({ passthrough: true }) res: Response) {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    
    // Clear both JWT and CSRF cookies
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      expires: new Date(0),
      path: '/',
      maxAge: 0,
    });
    
    res.cookie('csrf_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      expires: new Date(0),
      path: '/',
      maxAge: 0,
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
  async createUser(@Body() body: CreateUserDto, @Res({ passthrough: true }) res: Response): Promise<SigninResponseDto> {
    const user = await this.authService.signup(
      body.email, 
      body.password, 
      body.name, 
      body.phone, 
      body.role || 'tenant'
    );
    const login = this.authService.issueLoginResponse(user);
    res.setHeader('Set-Cookie', login.setCookie);
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
  async signin(@Body() body: SigninDto, @Res({ passthrough: true }) res: Response): Promise<SigninResponseDto> {
    const user = await this.authService.signin(body.email, body.password);
    const login = this.authService.issueLoginResponse(user);
    res.setHeader('Set-Cookie', login.setCookie);
    return login;
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('/:id')
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
