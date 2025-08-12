import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

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
    const accessToken = jwt.sign(payload, this.configService.get<string>('JWT_ACCESS_SECRET') as string, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
    });

    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    
    // Build cookie string with proper SameSite handling
    let cookie = `access_token=${accessToken}; HttpOnly; Path=/; Max-Age=900`;
    
    if (isProduction) {
      // Production: Secure + SameSite=None for cross-origin
      cookie += '; Secure; SameSite=None';
    } else {
      // Development: SameSite=Lax for localhost (no Secure required)
      cookie += '; SameSite=Lax';
    }

    return {
      ...user, // Return all user data
      setCookie: cookie,
    };
  }
}
