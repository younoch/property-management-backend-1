import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRequest } from './maintenance-request.entity';
import { WorkOrder } from './work-order.entity';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRequest) private readonly reqRepo: Repository<MaintenanceRequest>,
    @InjectRepository(WorkOrder) private readonly woRepo: Repository<WorkOrder>,
  ) {}

  createRequest(dto: CreateMaintenanceRequestDto) {
    const req = this.reqRepo.create(dto as any);
    return this.reqRepo.save(req);
  }

  findAllRequests() {
    return this.reqRepo.find();
  }

  async findRequest(id: number) {
    const r = await this.reqRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Maintenance request not found');
    return r;
  }

  async updateRequest(id: number, dto: UpdateMaintenanceRequestDto) {
    const r = await this.findRequest(id);
    Object.assign(r, dto);
    return this.reqRepo.save(r);
  }

  async removeRequest(id: number) {
    const r = await this.findRequest(id);
    await this.reqRepo.remove(r);
    return { success: true };
  }

  createWorkOrder(dto: CreateWorkOrderDto) {
    const wo = this.woRepo.create(dto as any);
    return this.woRepo.save(wo);
  }

  findAllWorkOrders() {
    return this.woRepo.find();
  }

  async findWorkOrder(id: number) {
    const w = await this.woRepo.findOne({ where: { id } });
    if (!w) throw new NotFoundException('Work order not found');
    return w;
  }

  async updateWorkOrder(id: number, dto: UpdateWorkOrderDto) {
    const w = await this.findWorkOrder(id);
    Object.assign(w, dto);
    return this.woRepo.save(w);
  }

  async removeWorkOrder(id: number) {
    const w = await this.findWorkOrder(id);
    await this.woRepo.remove(w);
    return { success: true };
  }
}


