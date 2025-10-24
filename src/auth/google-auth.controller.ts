import { 
  Body, 
  Controller, 
  HttpCode, 
  HttpStatus, 
  Post, 
  UseGuards, 
  Res, 
  UseInterceptors, 
  ClassSerializerInterceptor 
} from '@nestjs/common';
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
  @HttpCode(HttpStatus.OK)
  async login(@Body() googleLoginDto: GoogleLoginDto, @Res({ passthrough: true }) response: any) {
    console.log('[GoogleAuthController] Login request received:', {
      hasToken: !!googleLoginDto.token,
      hasAccessToken: !!googleLoginDto.accessToken,
      role: googleLoginDto.role
    });
    
    const timestamp = new Date().toISOString();
    
    try {
      const userData = await this.googleAuthService.authenticate({
        token: googleLoginDto.token,
        accessToken: googleLoginDto.accessToken,
        role: googleLoginDto.role
      });
      
      console.log('[GoogleAuthController] Login successful for user ID:', userData.id);
      
      // Return the response in the expected format
      return {
        success: true,
        message: 'User signed in successfully',
        data: userData,
        timestamp: timestamp,
        path: '/auth/google/login'
      };
    } catch (error) {
      console.error('[GoogleAuthController] Login failed:', error.message, error.stack);
      throw error;
    }
  }
}
