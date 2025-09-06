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

  async signup(email: string, password: string, name: string, phone: string, role: 'super_admin' | 'landlord' | 'manager' | 'tenant') {
    // See if email is in use
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('This email address is already registered. Please use a different email or try signing in.');
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
      throw new BadRequestException('The password you entered is incorrect. Please try again or reset your password if needed.');
    }

    return user;
  }

  issueLoginResponse(user: any) {
    const payload = { sub: user.id, role: user.role };
    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'; // 15 minutes default
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d'; // 7 days default

    const accessToken = jwt.sign(payload, this.configService.get<string>('JWT_ACCESS_SECRET') as string, {
      expiresIn: accessExpiresIn,
    });

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || (this.configService.get<string>('JWT_ACCESS_SECRET') as string);
    const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, refreshSecret, {
      expiresIn: refreshExpiresIn,
    });

    // Return full user data excluding password_hash, including relationships
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      profile_image_url: user.profile_image_url,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      owned_portfolios: user.owned_portfolios || [],
      notifications: user.notifications || [],
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || (this.configService.get<string>('JWT_ACCESS_SECRET') as string);
      const payload = jwt.verify(refreshToken, refreshSecret) as { sub: number; role: string; type: string };
      
      // Check if it's a refresh token
      if (payload.type !== 'refresh') {
        throw new BadRequestException('The refresh token provided is invalid or has expired. Please sign in again.');
      }

      // Get the user
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user is active
      if (!user.is_active) {
        throw new BadRequestException('Your account has been deactivated. Please contact support for assistance.');
      }

      // Generate new access token
      const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'; // 15 minutes default
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
          profile_image_url: user.profile_image_url,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at,
          owned_portfolios: user.owned_portfolios || [],
          notifications: user.notifications || [],
        }
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new BadRequestException('Your session has expired. Please sign in again to continue.');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException('The refresh token provided is invalid or has expired. Please sign in again.');
      }
      throw error;
    }
  }
}
