import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies?.access_token || request.signedCookies?.access_token;
    const refreshToken = request.cookies?.refresh_token || request.signedCookies?.refresh_token;
    
    if (!accessToken) {
      throw new UnauthorizedException({
        message: 'Access token is required',
        errorType: 'NO_TOKEN'
      });
    }
    
    try {
      const payload = jwt.verify(
        accessToken,
        this.configService.get<string>('JWT_ACCESS_SECRET') as string,
      ) as { sub: number; exp: number };
      
      if (!payload?.sub) {
        throw new UnauthorizedException({
          message: 'Invalid token payload',
          errorType: 'INVALID_TOKEN'
        });
      }
      
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Handle JWT verification errors
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException({
          message: 'Invalid access token',
          errorType: 'INVALID_TOKEN'
        });
      }
      
      if (error instanceof jwt.TokenExpiredError) {
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
