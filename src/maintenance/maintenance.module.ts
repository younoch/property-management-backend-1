import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceController, MaintenanceGlobalController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceRequest } from './maintenance-request.entity';
import { WorkOrder } from './work-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceRequest, WorkOrder])],
  controllers: [MaintenanceController, MaintenanceGlobalController],
  providers: [MaintenanceService],
})
export class MaintenanceModule {}


