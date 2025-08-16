import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceRequest } from './maintenance-request.entity';
import { WorkOrder } from './work-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceRequest, WorkOrder])],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
})
export class MaintenanceModule {}


