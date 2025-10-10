import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, DataSource } from 'typeorm';
import { Portfolio } from './portfolio.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { Property } from '../properties/property.entity';
import { Unit } from '../units/unit.entity';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { FindPortfoliosDto } from './dto/find-portfolios.dto';
import { TimezoneService } from '../common/services/timezone.service';
import { Tenant } from '../tenants/tenant.entity';
import { Lease } from '../leases/lease.entity';
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

    const queryBuilder = this.portfoliosRepository
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.landlord', 'landlord')
      .leftJoinAndSelect('portfolio.properties', 'properties')
      .leftJoinAndSelect('properties.units', 'units')
      .select([
        'portfolio',
        'landlord.id',
        'landlord.name',
        'landlord.email',
        'landlord.phone',
        'landlord.created_at',
        'landlord.updated_at',
        'properties',
        'units'
      ])
      .orderBy('portfolio.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      queryBuilder.where(
        '(portfolio.name ILIKE :search OR portfolio.subscription_plan ILIKE :search OR portfolio.status ILIKE :search OR portfolio.provider_customer_id ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Portfolio> {
    if (!id) {
      throw new NotFoundException('Portfolio ID is required');
    }

    const portfolio = await this.portfoliosRepository
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.landlord', 'landlord')
      .leftJoinAndSelect('portfolio.properties', 'properties')
      .leftJoinAndSelect('properties.units', 'units')
      .where('portfolio.id = :id', { id })
      .andWhere('portfolio.deleted_at IS NULL')
      .select([
        'portfolio',
        'landlord.id',
        'landlord.name',
        'landlord.email',
        'landlord.phone',
        'landlord.created_at',
        'landlord.updated_at',
        'properties',
        'units'
      ])
      .where('portfolio.id = :id', { id })
      .andWhere('portfolio.deleted_at IS NULL')
      .getOne();

    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }
    return portfolio;
  }

  async findByLandlord(landlordId: string, query: FindPortfoliosDto): Promise<{ data: Portfolio[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = (query.search ?? '').trim();

    const queryBuilder = this.portfoliosRepository
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.landlord', 'landlord')
      .leftJoinAndSelect('portfolio.properties', 'properties')
      .leftJoinAndSelect('properties.units', 'units')
      .select([
        'portfolio',
        'landlord.id',
        'landlord.name',
        'landlord.email',
        'landlord.phone',
        'landlord.created_at',
        'landlord.updated_at',
        'properties',
        'units'
      ])
      .where('portfolio.landlord_id = :landlordId', { landlordId })
      .orderBy('portfolio.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        '(portfolio.name ILIKE :search OR portfolio.subscription_plan ILIKE :search OR portfolio.status ILIKE :search OR portfolio.provider_customer_id ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async update(id: string, updateDto: UpdatePortfolioDto): Promise<Portfolio> {
    const portfolio = await this.findOne(id);
    
    // If timezone is not provided in the update, keep the existing one
    if (updateDto.timezone === undefined && portfolio.timezone) {
      updateDto.timezone = portfolio.timezone;
    }
    
    Object.assign(portfolio, updateDto);
    return await this.portfoliosRepository.save(portfolio);
  }

  async remove(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Find all properties in this portfolio
      const properties = await queryRunner.manager
        .getRepository(Property)
        .find({ where: { portfolio_id: id } });
      
      const propertyIds = properties.map(p => p.id);

      if (propertyIds.length > 0) {
        // 2. Delete all units in these properties
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(Unit)
          .where('property_id IN (:...propertyIds)', { propertyIds })
          .execute();
      }

      // 3. Delete all properties in this portfolio
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Property)
        .where('portfolio_id = :id', { id })
        .execute();

      // 4. Find all tenants in this portfolio
      const tenants = await this.tenantRepository.find({ where: { portfolio_id: id } });
      const tenantIds = tenants.map(t => t.id);

      if (tenantIds.length > 0) {
        // 5. Delete all lease_tenant records for these tenants
        await this.leaseTenantRepository
          .createQueryBuilder()
          .delete()
          .where('tenant_id IN (:...tenantIds)', { tenantIds })
          .execute();
      }

      // 6. Delete all tenants in this portfolio
      await queryRunner.manager.delete(Tenant, { portfolio_id: id })

      // 7. Finally, delete the portfolio
      await queryRunner.manager.delete(Portfolio, { id })
      
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
