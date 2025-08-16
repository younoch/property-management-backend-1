import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaseCharge } from './lease-charge.entity';
import { CreateLeaseChargeDto } from './dto/create-lease-charge.dto';
import { UpdateLeaseChargeDto } from './dto/update-lease-charge.dto';

@Injectable()
export class LeaseChargesService {
  constructor(
    @InjectRepository(LeaseCharge)
    private readonly repo: Repository<LeaseCharge>,
  ) {}

  create(dto: CreateLeaseChargeDto) {
    const charge = this.repo.create(dto as any);
    return this.repo.save(charge);
  }

  findAll() {
    return this.repo.find();
  }

  findByLease(leaseId: number) {
    return this.repo.find({ where: { lease_id: leaseId } });
  }

  async findOne(id: number) {
    const charge = await this.repo.findOne({ where: { id } });
    if (!charge) throw new NotFoundException('Lease charge not found');
    return charge;
  }

  async update(id: number, dto: UpdateLeaseChargeDto) {
    const charge = await this.findOne(id);
    Object.assign(charge, dto);
    return this.repo.save(charge);
  }

  async remove(id: number) {
    const charge = await this.findOne(id);
    await this.repo.remove(charge);
    return { success: true };
  }
}


