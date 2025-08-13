import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private configService: ConfigService) {}

  async signup(email: string, password: string, name: string, phone: string, role: 'super_admin' | 'landlord' | 'manager' | 'tenant' = 'tenant') {
    // See if email is in use
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }

    // Hash the password with bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user and save it
    const user = await this.usersService.create(email, hashedPassword, name, phone, role);

    // return the user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new BadRequestException('bad password');
    }

    return user;
  }

  issueLoginResponse(user: any) {
    const payload = { sub: user.id, role: user.role };
    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const accessToken = jwt.sign(payload, this.configService.get<string>('JWT_ACCESS_SECRET') as string, {
      expiresIn: accessExpiresIn,
    });

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || (this.configService.get<string>('JWT_ACCESS_SECRET') as string);
    const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, refreshSecret, {
      expiresIn: refreshExpiresIn,
    });

    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
    const cookieHttpOnly = this.configService.get<string>('COOKIE_HTTP_ONLY') !== 'false';
    const cookieSameSite = (this.configService.get<string>('COOKIE_SAME_SITE') || (isProduction ? 'none' : 'lax')) as 'lax' | 'none' | 'strict';
    const cookieSecure = this.configService.get<string>('COOKIE_SECURE') === 'true' || isProduction;

    // Build cookies with attributes
    const accessCookieParts = [
      `access_token=${accessToken}`,
      `Path=/`,
      `Max-Age=${15 * 60}`,
    ];
    const refreshCookieParts = [
      `refresh_token=${refreshToken}`,
      `Path=/`,
    ];

    if (cookieHttpOnly) {
      accessCookieParts.push('HttpOnly');
      refreshCookieParts.push('HttpOnly');
    }
    if (cookieSecure) {
      accessCookieParts.push('Secure');
      refreshCookieParts.push('Secure');
    }
    if (cookieSameSite) {
      const normalized = cookieSameSite.charAt(0).toUpperCase() + cookieSameSite.slice(1).toLowerCase();
      accessCookieParts.push(`SameSite=${normalized}`);
      refreshCookieParts.push(`SameSite=${normalized}`);
    }
    if (cookieDomain) {
      accessCookieParts.push(`Domain=${cookieDomain}`);
      refreshCookieParts.push(`Domain=${cookieDomain}`);
    }

    const setCookie = [accessCookieParts.join('; '), refreshCookieParts.join('; ')];

    return {
      ...user,
      accessToken,
      refreshToken,
      setCookie,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || (this.configService.get<string>('JWT_ACCESS_SECRET') as string);
      const payload = jwt.verify(refreshToken, refreshSecret) as { sub: number; role: string; type: string };
      
      // Check if it's a refresh token
      if (payload.type !== 'refresh') {
        throw new BadRequestException('Invalid refresh token');
      }

      // Get the user
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user is active
      if (!user.is_active) {
        throw new BadRequestException('User account is deactivated');
      }

      // Generate new access token
      const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
      const newAccessToken = jwt.sign(
        { sub: user.id, role: user.role },
        this.configService.get<string>('JWT_ACCESS_SECRET') as string,
        { expiresIn: accessExpiresIn }
      );

      return {
        access_token: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          is_active: user.is_active,
        }
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new BadRequestException('Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException('Invalid refresh token');
      }
      throw error;
    }
  }
}
