import { 
  Body, 
  Controller, 
  HttpCode, 
  HttpStatus, 
  Post, 
  Res, 
  UseInterceptors, 
  ClassSerializerInterceptor,
  BadRequestException,
  Logger
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
  private readonly logger = new Logger(GoogleAuthController.name);
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
    this.logger.log('===== New Google Login Request =====');
    
    // Log request details (without full tokens for security)
    const logInfo = {
      hasToken: !!googleLoginDto.token,
      tokenPrefix: googleLoginDto.token ? `${googleLoginDto.token.substring(0, 10)}...` : 'None',
      tokenType: googleLoginDto.token ? (googleLoginDto.token.split('.').length === 3 ? 'JWT' : 'OAuth') : 'None',
      hasAccessToken: !!googleLoginDto.accessToken,
      accessTokenPrefix: googleLoginDto.accessToken ? `${googleLoginDto.accessToken.substring(0, 10)}...` : 'None',
      role: googleLoginDto.role,
      timestamp: new Date().toISOString()
    };
    
    this.logger.debug('Request details:', JSON.stringify(logInfo, null, 2));
    
    // Validate that we have either token or accessToken
    if (!googleLoginDto.token && !googleLoginDto.accessToken) {
      throw new BadRequestException('Either token (ID token) or accessToken is required');
    }
    
    // If token is provided, check if it's a JWT or an access token
    if (googleLoginDto.token) {
      const tokenParts = googleLoginDto.token.split('.');
      if (tokenParts.length === 3) {
        // It's a JWT ID token
        this.logger.debug('Detected JWT ID token');
      } else if (googleLoginDto.token.startsWith('ya29.')) {
        // It's a Google OAuth access token (starts with 'ya29.')
        this.logger.debug('Detected Google OAuth access token');
        // Convert the access token to be used in the accessToken field
        googleLoginDto.accessToken = googleLoginDto.token;
        googleLoginDto.token = undefined;
      } else {
        // Invalid token format
        console.error('[GoogleAuthController] Invalid token format:', {
          tokenLength: googleLoginDto.token.length,
          tokenParts: tokenParts.length,
          error: 'Expected a JWT ID token or Google OAuth access token'
        });
        throw new BadRequestException('Invalid token format. Expected a JWT ID token or Google OAuth access token');
      }
    }
    
    this.logger.debug('Environment check:', {
      nodeEnv: process.env.NODE_ENV || 'development',
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not Set',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set',
      googleAuthUrl: process.env.GOOGLE_AUTH_URL || 'Using default'
    });

    // Ensure at least one token is provided
    if (!googleLoginDto.token && !googleLoginDto.accessToken) {
      const error = new BadRequestException('Please sign in with Google first. No authentication token was provided.');
      console.error('[GoogleAuthController] No token provided:', error);
      throw error;
    }
    
    // Validate token format if provided
    if (googleLoginDto.token) {
      const tokenParts = googleLoginDto.token.split('.');
      if (tokenParts.length !== 3) {
        const error = new BadRequestException('Invalid token format. Expected a JWT with 3 parts');
        console.error('[GoogleAuthController] Invalid token format:', {
          tokenLength: googleLoginDto.token.length,
          tokenParts: tokenParts.length,
          error: error.message
        });
        throw error;
      }
      
      try {
        const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        
        console.log('[GoogleAuthController] Token details:', {
          header,
          payload: {
            ...payload,
            iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
            exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
            email: payload.email,
            email_verified: payload.email_verified,
            aud: payload.aud,
            iss: payload.iss
          }
        });
      } catch (error) {
        console.error('[GoogleAuthController] Error parsing token:', error.message);
        // Continue with the authentication even if we can't parse the token
        // The actual verification will happen in the service
      }
    }

    try {
      const userData = await this.googleAuthService.authenticate({
        token: googleLoginDto.token,
        accessToken: googleLoginDto.accessToken,
        role: googleLoginDto.role
      });

      console.log('[GoogleAuthController] User data:', userData);

      // Set HTTP-only cookies with proper configuration
      const isProduction = process.env.NODE_ENV === 'production';
      const domain = isProduction ? '.yourdomain.com' : undefined; // Replace with your actual domain
      
      // Access token cookie (short-lived)
      response.cookie('access_token', userData.accessToken, {
        httpOnly: true,
        secure: isProduction, // Only send over HTTPS in production
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
        domain, // Set domain for production
        // Add Partitioned attribute for cross-site cookies if needed
        ...(isProduction && { partitioned: true })
      });

      // Refresh token cookie (longer-lived)
      response.cookie('refresh_token', userData.refreshToken, {
        httpOnly: true,
        secure: isProduction, // Only send over HTTPS in production
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
        domain, // Set domain for production
        // Add Partitioned attribute for cross-site cookies if needed
        ...(isProduction && { partitioned: true })
      });
      
      this.logger.debug('Cookies set successfully', {
        accessTokenSet: !!userData.accessToken,
        refreshTokenSet: !!userData.refreshToken,
        isProduction,
        domain
      });

      // Return the user data with tokens - the response will be handled by the interceptor
      return userData;
    } catch (error) {
      console.error('[GoogleAuthController] Login failed:', error.message, error.stack);
      throw error;
    }
  }
}
