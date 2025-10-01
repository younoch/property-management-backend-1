import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CsrfController } from '../controllers/csrf.controller';
import { CsrfService } from '../services/csrf.service';
import { CsrfMiddleware } from '../middlewares/csrf.middleware';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    ConfigModule,
    AuthModule,
  ],
  controllers: [CsrfController],
  providers: [CsrfService],
  exports: [CsrfService],
})
export class CsrfModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CsrfMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'health/(.*)', method: RequestMethod.GET }
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
