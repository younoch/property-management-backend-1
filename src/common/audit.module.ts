import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditLogsController],
  providers: [
    AuditLogService,
    AuditInterceptor,
  ],
  exports: [
    AuditLogService, 
    TypeOrmModule,
    AuditInterceptor,
  ],
})
export class AuditModule {}
