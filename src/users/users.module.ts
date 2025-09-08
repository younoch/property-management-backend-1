import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersManagementController } from './users.management.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { TokenRefreshInterceptor } from './interceptors/token-refresh.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' },
    }),
  ],
  controllers: [UsersController, UsersManagementController],
  providers: [
    UsersService, 
    AuthService, 
    TokenRefreshInterceptor,
    JwtService,
  ],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
