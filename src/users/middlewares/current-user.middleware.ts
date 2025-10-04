import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users.service';
import { User } from '../user.entity';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.access_token || req.signedCookies?.access_token;
      if (token) {
        const payload = jwt.verify(
          token,
          this.configService.get<string>('JWT_ACCESS_SECRET') as string,
        ) as { sub: string };
        
        if (!payload.sub) {
          console.warn('No user ID found in token payload');
          return next();
        }
        
        try {
          const user = await this.usersService.findOne(payload.sub);
          if (user) {
            req.currentUser = user;
          } else {
            console.warn(`User with ID ${payload.sub} not found`);
          }
        } catch (error) {
          console.error('Error fetching user in CurrentUserMiddleware:', error);
        }
      }
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        console.warn('Invalid JWT token:', err.message);
      } else if (err instanceof Error) {
        console.error('Error in CurrentUserMiddleware:', err.message, err.stack);
      }
    }
    next();
  }
}
