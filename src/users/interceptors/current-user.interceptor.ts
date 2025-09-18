import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users.service';
import { AccessTokenPayload } from '../../common/types/jwt.types';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(
    private usersService: UsersService, 
    private configService: ConfigService,
    private jwtService: JwtService
  ) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    try {
      const token = request.cookies?.access_token || request.signedCookies?.access_token;
      if (token) {
        const payload = this.jwtService.verify<AccessTokenPayload>(
          token,
          { secret: this.configService.get<string>('JWT_ACCESS_SECRET') }
        );
        
        if (payload?.sub) {
          const userId = parseInt(payload.sub, 10);
          const user = await this.usersService.findOne(userId);
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
