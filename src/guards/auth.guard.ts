import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.access_token || request.signedCookies?.access_token;
    if (!token) return false;
    try {
      const payload = jwt.verify(
        token,
        this.configService.get<string>('JWT_ACCESS_SECRET') as string,
      ) as { sub: number };
      return Boolean(payload?.sub);
    } catch (_) {
      return false;
    }
  }
}
