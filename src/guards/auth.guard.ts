import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Inject, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import { AccessTokenPayload } from '../common/types/jwt.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    @Optional()
    @Inject('JWT_MODULE_OPTIONS')
    private readonly jwtOptions: JwtModuleOptions,
    @Optional()
    @Inject(JwtService)
    private readonly jwtService?: JwtService
  ) {
    if (!this.jwtService) {
      this.jwtService = new JwtService({
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m')
        }
      });
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;
    
    // Check for public routes that don't require authentication
    const isPublicRoute = [
      '/auth/signin',
      '/auth/signup',
      '/auth/refresh',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/csrf/refresh',
      '/csrf/token',  // Only the token endpoint is public
      '/health'       // Health check endpoint
    ].some(route => url.startsWith(route));
    
    if (isPublicRoute) {
      return true;
    }
    
    const accessToken = request.cookies?.access_token || request.signedCookies?.access_token;
    const refreshToken = request.cookies?.refresh_token || request.signedCookies?.refresh_token;
    
    if (!accessToken) {
      throw new UnauthorizedException({
        message: 'Access token is required',
        errorType: 'NO_TOKEN'
      });
    }
    
    try {
      // Get JWT secret from config
      const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
      if (!secret) {
        throw new Error('JWT_ACCESS_SECRET is not configured');
      }

      // Verify token
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        accessToken,
        { secret }
      );
      
      if (!payload?.sub) {
        throw new UnauthorizedException({
          message: 'Invalid token payload',
          errorType: 'INVALID_TOKEN'
        });
      }
      
      // Store user information in request for later use
      request.user = {
        id: parseInt(payload.sub, 10),
        role: payload.role // Make sure your JWT payload includes the role
      };
      // Keep backward compatibility
      request.userId = request.user.id;
      
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Handle JWT verification errors
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          message: 'Invalid access token',
          errorType: 'INVALID_TOKEN'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        // Check if refresh token is available for automatic refresh
        if (refreshToken) {
          throw new UnauthorizedException({
            message: 'Access token expired but refresh token available',
            errorType: 'TOKEN_EXPIRED_REFRESH_AVAILABLE'
          });
        } else {
          throw new UnauthorizedException({
            message: 'Access token has expired',
            errorType: 'TOKEN_EXPIRED'
          });
        }
      }
      
      // Handle other JWT errors
      throw new UnauthorizedException({
        message: 'Invalid access token',
        errorType: 'INVALID_TOKEN'
      });
    }
  }
}
