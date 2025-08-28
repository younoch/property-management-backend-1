import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, DataSource } from 'typeorm';
import { Portfolio } from './portfolio.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { FindPortfoliosDto } from './dto/find-portfolios.dto';
import { TimezoneService } from '../common/services/timezone.service';
import { Tenant } from '../tenancy/tenant.entity';
import { Lease } from '../tenancy/lease.entity';
import { LeaseTenant } from '../tenancy/lease-tenant.entity';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio)
    private portfoliosRepository: Repository<Portfolio>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
    @InjectRepository(LeaseTenant)
    private readonly leaseTenantRepository: Repository<LeaseTenant>,
    private readonly timezoneService: TimezoneService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreatePortfolioDto): Promise<Portfolio> {
    // Validate timezone if provided, or use default 'UTC'
    const timezone = createDto.timezone || 'UTC';
    if (!this.timezoneService.isValidTimezone(timezone)) {
      throw new Error(`Invalid timezone: ${timezone}`);
    }
    
    const portfolio = this.portfoliosRepository.create({
      ...createDto,
      timezone, // Ensure timezone is set
    });
    
    return await this.portfoliosRepository.save(portfolio);
  }

  async findAll(query: FindPortfoliosDto): Promise<{ data: Portfolio[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = (query.search ?? '').trim();

    const where: any[] = [];
    if (search) {
      where.push(
        { name: ILike(`%${search}%`) },
        { subscription_plan: ILike(`%${search}%`) },
        { status: ILike(`%${search}%`) },
        { provider_customer_id: ILike(`%${search}%`) },
      );
    }

    const [data, total] = await this.portfoliosRepository.findAndCount({
      where: where.length ? where : undefined,
      relations: ['landlord', 'properties', 'properties.units'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Portfolio> {
    const portfolio = await this.portfoliosRepository.findOne({
      where: { id },
      relations: ['landlord', 'properties', 'properties.units'],
    });
    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }
    return portfolio;
  }

  async findByLandlord(landlordId: number, query: FindPortfoliosDto): Promise<{ data: Portfolio[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = (query.search ?? '').trim();

    let where: any | any[] = { landlord_id: landlordId };
    if (search) {
      where = [
        { landlord_id: landlordId, name: ILike(`%${search}%`) },
        { landlord_id: landlordId, subscription_plan: ILike(`%${search}%`) },
        { landlord_id: landlordId, status: ILike(`%${search}%`) },
        { landlord_id: landlordId, provider_customer_id: ILike(`%${search}%`) },
      ];
    }

    const [data, total] = await this.portfoliosRepository.findAndCount({
      where,
      relations: ['landlord', 'properties', 'properties.units'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async update(id: number, updateDto: UpdatePortfolioDto): Promise<Portfolio> {
    const portfolio = await this.findOne(id);
    Object.assign(portfolio, updateDto);
    return await this.portfoliosRepository.save(portfolio);
  }

  async remove(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Find all tenants in this portfolio
      const tenants = await this.tenantRepository.find({ where: { portfolio_id: id } });
      const tenantIds = tenants.map(t => t.id);

      if (tenantIds.length > 0) {
        // 2. Delete all lease_tenant records for these tenants
        await this.leaseTenantRepository
          .createQueryBuilder()
          .delete()
          .where('tenant_id IN (:...tenantIds)', { tenantIds })
          .execute();
      }

      // 3. Delete all leases in this portfolio
      await this.leaseRepository.delete({ portfolio_id: id });

      // 4. Delete all tenants in this portfolio
      await this.tenantRepository.delete({ portfolio_id: id });

      // 5. Finally, delete the portfolio
      await this.portfoliosRepository.delete(id);
      
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}


