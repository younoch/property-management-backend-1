import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../tenancy/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly repo: Repository<Tenant>,
  ) {}

  create(dto: CreateTenantDto) {
    const tenant = this.repo.create(dto as any);
    return this.repo.save(tenant);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const tenant = await this.repo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(id: number, dto: UpdateTenantDto) {
    const tenant = await this.findOne(id);
    Object.assign(tenant, dto);
    return this.repo.save(tenant);
  }

  async remove(id: number) {
    const tenant = await this.findOne(id);
    await this.repo.remove(tenant);
    return { success: true };
  }
}


