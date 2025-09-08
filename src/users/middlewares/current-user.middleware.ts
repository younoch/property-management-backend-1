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
        ) as jwt.JwtPayload;
        const userId = typeof payload.sub === 'string' ? parseInt(payload.sub, 10) : payload.sub;
        if (userId) {
          const user = await this.usersService.findOne(userId);
          if (user) {
            req.currentUser = user;
          }
        }
      }
    } catch (err) {
      // ignore invalid/expired token
    }
    next();
  }
}
