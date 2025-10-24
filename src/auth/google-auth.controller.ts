import { 
  Body, 
  Controller, 
  HttpCode, 
  HttpStatus, 
  Post, 
  Res, 
  UseInterceptors, 
  ClassSerializerInterceptor,
  BadRequestException
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GoogleAuthService } from './google-auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { GoogleLoginResponseDto } from './dto/google-login-response.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login or register with Google' })
  @ApiBody({ type: GoogleLoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged in with Google',
    type: GoogleLoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid Google token or email not verified',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async login(
    @Body() googleLoginDto: GoogleLoginDto, 
    @Res({ passthrough: true }) response: Response
  ) {
    console.log('[GoogleAuthController] Login request received:', {
      hasToken: !!googleLoginDto.token,
      hasAccessToken: !!googleLoginDto.accessToken,
      role: googleLoginDto.role
    });

    // Ensure at least one token is provided
    if (!googleLoginDto.token && !googleLoginDto.accessToken) {
      throw new BadRequestException('Either token or accessToken is required');
    }

    try {
      const userData = await this.googleAuthService.authenticate({
        token: googleLoginDto.token,
        accessToken: googleLoginDto.accessToken,
        role: googleLoginDto.role
      });

      console.log('[GoogleAuthController] Login successful for user ID:', userData.id);

      // Set HTTP-only cookies
      response.cookie('access_token', userData.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
      });

      response.cookie('refresh_token', userData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/auth/refresh-token',
      });

      // Remove tokens from response
      const { accessToken, refreshToken, ...user } = userData;
      
      // Return consistent response format
      return user;
    } catch (error) {
      console.error('[GoogleAuthController] Login failed:', error.message, error.stack);
      throw error;
    }
  }
}
