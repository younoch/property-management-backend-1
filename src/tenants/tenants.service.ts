// src/tenants/tenants.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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

  async findAll(query?: { page?: number; limit?: number; search?: string }) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const search = (query?.search ?? '').trim();

    const where: any[] = [];
    if (search) {
      where.push(
        { first_name: ILike(`%${search}%`) },
        { last_name: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) },
        { phone: ILike(`%${search}%`) },
      );
    }

    const [data, total] = await this.repo.findAndCount({
      where: where.length ? where : undefined,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findByPortfolio(portfolioId: number, query?: { page?: number; limit?: number; search?: string }) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const search = (query?.search ?? '').trim();

    let where: any | any[] = { portfolio_id: portfolioId };
    if (search) {
      where = [
        { portfolio_id: portfolioId, first_name: ILike(`%${search}%`) },
        { portfolio_id: portfolioId, last_name: ILike(`%${search}%`) },
        { portfolio_id: portfolioId, email: ILike(`%${search}%`) },
        { portfolio_id: portfolioId, phone: ILike(`%${search}%`) },
      ];
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
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
