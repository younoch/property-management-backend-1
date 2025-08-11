import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CsrfService } from '../services/csrf.service';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(private readonly csrfService: CsrfService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF token generation for non-authenticated routes
    if (req.path === '/auth/signin' || req.path === '/auth/signup') {
      return next();
    }

    // Check if user is authenticated (has JWT token)
    const hasJwtToken = req.cookies?.access_token || req.signedCookies?.access_token;
    
    if (hasJwtToken) {
      // Generate CSRF token if not exists or expired
      const existingToken = req.cookies?.csrf_token || req.signedCookies?.csrf_token;
      
      if (!existingToken) {
        const csrfToken = this.csrfService.generateToken();
        const expiry = this.csrfService.getTokenExpiry();
        
        // Set CSRF token as HttpOnly cookie
        res.cookie('csrf_token', csrfToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          expires: expiry,
          path: '/',
        });
        
        // Also set in response headers for frontend access
        res.setHeader('X-CSRF-Token', csrfToken);
      } else {
        // Token exists, set in headers for frontend
        res.setHeader('X-CSRF-Token', existingToken);
      }
    }

    next();
  }
}
