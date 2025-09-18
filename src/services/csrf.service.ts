import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CsrfService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a CSRF token with user-specific salt
   */
  generateUserToken(userId: number): string {
    const salt = this.configService.get<string>('CSRF_SECRET') || 'default-csrf-secret';
    const userSalt = `${salt}-${userId}-${Date.now()}`;
    return crypto.createHash('sha256').update(userSalt).digest('hex');
  }

  /**
   * Validate a CSRF token
   */
  validateToken(token: string, storedToken: string): boolean {
    if (!token || !storedToken) {
      return false;
    }
    
    return this.timingSafeEqual(token, storedToken);
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

  /**
   * Get CSRF token expiry time (default: 24 hours)
   */
  getTokenExpiry(): Date {
    const expiryHours = this.configService.get<number>('CSRF_TOKEN_EXPIRY_HOURS') || 24; // 24 hours default
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + expiryHours);
    return expiry;
  }
}
