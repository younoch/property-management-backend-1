import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService, private configService: ConfigService) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    try {
      const token = request.cookies?.access_token || request.signedCookies?.access_token;
      if (token) {
        const payload = jwt.verify(
          token,
          this.configService.get<string>('JWT_ACCESS_SECRET') as string,
        ) as { sub: number };
        if (payload?.sub) {
          const user = await this.usersService.findOne(payload.sub);
          if (user) {
            request.currentUser = user;
          }
        }
      }
    } catch (_) {
      // ignore
    }

    return handler.handle();
  }
}
