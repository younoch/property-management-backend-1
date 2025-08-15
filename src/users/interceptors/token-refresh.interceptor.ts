import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Response } from 'express';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: HttpException) => {
        // Check if this is a token expired error with refresh token available
        if (
          error instanceof UnauthorizedException &&
          error.getResponse() &&
          typeof error.getResponse() === 'object' &&
          (error.getResponse() as any).errorType === 'TOKEN_EXPIRED_REFRESH_AVAILABLE'
        ) {
          const request = context.switchToHttp().getRequest();
          const response = context.switchToHttp().getResponse<Response>();
          const refreshToken = request.cookies?.refresh_token || request.signedCookies?.refresh_token;

          if (refreshToken) {
            // Attempt to refresh the access token
            return this.refreshAccessToken(refreshToken, response).pipe(
              switchMap(() => {
                // Retry the original request with the new token
                return next.handle();
              }),
              catchError((refreshError) => {
                // If refresh fails, redirect to login
                this.clearAuthCookies(response);
                return throwError(() => new UnauthorizedException({
                  message: 'Session expired. Please sign in again.',
                  errorType: 'REFRESH_FAILED'
                }));
              })
            );
          }
        }

        // For other errors, just pass them through
        return throwError(() => error);
      })
    );
  }

  private refreshAccessToken(refreshToken: string, response: Response): Observable<any> {
    return new Observable((observer) => {
      this.authService.refreshAccessToken(refreshToken)
        .then((result) => {
          // Set the new access token in cookies
          const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
          const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
          const cookieHttpOnly = this.configService.get<string>('COOKIE_HTTP_ONLY') !== 'false';
          const cookieSameSite = (this.configService.get<string>('COOKIE_SAME_SITE') || (isProduction ? 'none' : 'lax')) as any;
          const cookieSecure = this.configService.get<string>('COOKIE_SECURE') === 'true' || isProduction;

          const cookieOpts: any = {
            httpOnly: cookieHttpOnly,
            secure: cookieSecure,
            sameSite: cookieSameSite,
            path: '/',
          };
          if (cookieDomain) cookieOpts.domain = cookieDomain;

          response.cookie('access_token', result.access_token, cookieOpts);
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  private clearAuthCookies(response: Response): void {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
    const cookieHttpOnly = this.configService.get<string>('COOKIE_HTTP_ONLY') !== 'false';
    const cookieSameSite = (this.configService.get<string>('COOKIE_SAME_SITE') || (isProduction ? 'none' : 'lax')) as any;
    const cookieSecure = this.configService.get<string>('COOKIE_SECURE') === 'true' || isProduction;

    const clearOpts: any = {
      httpOnly: cookieHttpOnly,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      expires: new Date(0),
      path: '/',
    };
    if (cookieDomain) clearOpts.domain = cookieDomain;

    response.cookie('access_token', '', clearOpts);
    response.cookie('refresh_token', '', clearOpts);
    response.cookie('csrf_token', '', clearOpts);
  }
}
