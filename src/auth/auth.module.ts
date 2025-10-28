// src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from '../users/auth.service';
import { TokenRefreshInterceptor } from '../users/interceptors/token-refresh.interceptor';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthController } from './google-auth.controller';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UsersModule), // use forwardRef to resolve circular dependency
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: 900, // 15 minutes in seconds
        },
      }),
    }),
  ],
  controllers: [GoogleAuthController],
  providers: [AuthService, GoogleAuthService, TokenRefreshInterceptor],
  exports: [AuthService, JwtModule, TokenRefreshInterceptor, GoogleAuthService],
})
export class AuthModule {}
