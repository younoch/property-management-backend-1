import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
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
  async login(@Body() googleLoginDto: GoogleLoginDto) {
    console.log('[GoogleAuthController] Login request received:', {
      hasToken: !!googleLoginDto.token,
      hasAccessToken: !!googleLoginDto.accessToken,
      role: googleLoginDto.role
    });
    
    try {
      const result = await this.googleAuthService.authenticate({
        token: googleLoginDto.token,
        accessToken: googleLoginDto.accessToken,
        role: googleLoginDto.role
      });
      
      console.log('[GoogleAuthController] Login successful for user ID:', result.user?.id);
      return result;
    } catch (error) {
      console.error('[GoogleAuthController] Login failed:', error.message, error.stack);
      throw error;
    }
  }
}
