import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lease } from '../tenancy/lease.entity';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';

@Injectable()
export class LeasesService {
  constructor(
    @InjectRepository(Lease)
    private readonly repo: Repository<Lease>,
  ) {}

  create(dto: CreateLeaseDto) {
    const lease = this.repo.create(dto as any);
    return this.repo.save(lease);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const lease = await this.repo.findOne({ where: { id } });
    if (!lease) throw new NotFoundException('Lease not found');
    return lease;
  }

  async update(id: number, dto: UpdateLeaseDto) {
    const lease = await this.findOne(id);
    Object.assign(lease, dto);
    return this.repo.save(lease);
  }

  async remove(id: number) {
    const lease = await this.findOne(id);
    await this.repo.remove(lease);
    return { success: true };
  }
}


