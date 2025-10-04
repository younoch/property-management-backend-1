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
          try {
            const user = await this.usersService.findOne(payload.sub);
            if (user) {
              request.currentUser = user;
            } else {
              console.warn(`User with ID ${payload.sub} not found`);
            }
          } catch (error) {
            console.error('Error fetching user in CurrentUserInterceptor:', error);
          }
        }
      }
    } catch (_) {
      // ignore
    }

    return handler.handle();
  }
}
