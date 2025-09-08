// src/common/audit.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditLogService } from './audit-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])], // provides repository
  providers: [AuditLogService],
  exports: [AuditLogService], // allow other modules (like PaymentsModule) to use it
})
export class AuditModule {}
