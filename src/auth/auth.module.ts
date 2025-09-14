// src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from '../users/auth.service';
import { TokenRefreshInterceptor } from '../users/interceptors/token-refresh.interceptor';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UsersModule), // use forwardRef to resolve circular dependency
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  providers: [AuthService, TokenRefreshInterceptor],
  exports: [AuthService, JwtModule, TokenRefreshInterceptor],
})
export class AuthModule {}
