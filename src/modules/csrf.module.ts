import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CsrfController } from '../controllers/csrf.controller';
import { CsrfService } from '../services/csrf.service';
import { CsrfMiddleware } from '../middlewares/csrf.middleware';

@Module({
  controllers: [CsrfController],
  providers: [CsrfService],
  exports: [CsrfService],
})
export class CsrfModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CsrfMiddleware)
      .forRoutes(
        { path: '*', method: RequestMethod.ALL }
      );
  }
}
