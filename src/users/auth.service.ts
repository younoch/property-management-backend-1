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

  generateAccessToken(user: any): string {
    const payload = { sub: user.id, role: user.role };
    return jwt.sign(
      payload,
      this.configService.get<string>('JWT_ACCESS_SECRET') as string,
      { expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m' },
    );
  }

  generateRefreshToken(user: any): string {
    const payload = { sub: user.id, type: 'refresh' };
    return jwt.sign(
      payload,
      this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_ACCESS_SECRET') as string,
      { expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d' },
    );
  }

  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = jwt.verify(
        refreshToken,
        this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_ACCESS_SECRET') as string,
      ) as { sub: number; type: string };

      if (payload.type !== 'refresh') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new BadRequestException('Refresh token expired');
      }
      throw error;
    }
  }

  async validateAccessToken(token: string): Promise<{ sub: number; role: string } | null> {
    try {
      const payload = jwt.verify(
        token,
        this.configService.get<string>('JWT_ACCESS_SECRET') as string,
      ) as { sub: number; role: string };
      return payload;
    } catch (error) {
      return null;
    }
  }
}
