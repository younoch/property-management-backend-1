import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Skip CSRF validation for GET requests
    if (request.method === 'GET') {
      return true;
    }

    // Skip CSRF validation for OPTIONS requests (CORS preflight)
    if (request.method === 'OPTIONS') {
      return true;
    }

    // Get CSRF token from header
    const csrfToken = request.headers['x-csrf-token'] || request.headers['x-xsrf-token'];
    
    if (!csrfToken) {
      throw new UnauthorizedException('CSRF token missing');
    }

    // Get stored CSRF token from session/cookie
    const storedToken = request.cookies?.csrf_token || request.signedCookies?.csrf_token;
    
    if (!storedToken) {
      throw new UnauthorizedException('CSRF token not found in session');
    }

    // Compare tokens (use timing-safe comparison)
    if (!this.timingSafeEqual(csrfToken, storedToken)) {
      throw new UnauthorizedException('CSRF token invalid');
    }

    return true;
  }

  /**
   * Timing-safe string comparison to prevent timing attacks
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}
