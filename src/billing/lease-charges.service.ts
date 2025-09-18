import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaseCharge } from './lease-charge.entity';
import { CreateLeaseChargeDto } from './dto/create-lease-charge.dto';
import { UpdateLeaseChargeDto } from './dto/update-lease-charge.dto';
import { Unit } from '../properties/unit.entity';
import { Property } from '../properties/property.entity';
import { Lease } from '../tenancy/lease.entity';

@Injectable()
export class LeaseChargesService {
  constructor(
    @InjectRepository(LeaseCharge)
    private readonly repo: Repository<LeaseCharge>,
    @InjectRepository(Unit)
    private readonly unitRepo: Repository<Unit>,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(Lease)
    private readonly leaseRepo: Repository<Lease>,
  ) {}

  async create(dto: CreateLeaseChargeDto) {
    // Verify unit, property, and lease exist
    const [unit, property, lease] = await Promise.all([
      this.unitRepo.findOne({ where: { id: dto.unit_id } }),
      this.propertyRepo.findOne({ where: { id: dto.property_id } }),
      this.leaseRepo.findOne({ 
        where: { id: dto.lease_id },
        relations: ['portfolio']
      })
    ]);

    if (!unit) throw new NotFoundException('Unit not found');
    if (!property) throw new NotFoundException('Property not found');
    if (!lease) throw new NotFoundException('Lease not found');
    if (!lease.portfolio) throw new NotFoundException('Portfolio not found for lease');

    // Generate name based on unit and property
    const name = `${unit.label} - ${property.name}`;

    const charge = this.repo.create({
      ...dto,
      name,
      portfolio_id: lease.portfolio.id // Set portfolio_id from lease
    });

    return this.repo.save(charge);
  }

  async findAll() {
    return this.repo.find({
      relations: ['unit', 'property', 'portfolio', 'lease']
    });
  }

  findByLease(leaseId: number) {
    return this.repo.find({ 
      where: { lease_id: leaseId },
      relations: ['unit', 'property', 'portfolio']
    });
  }

  async findOne(id: number) {
    const charge = await this.repo.findOne({ 
      where: { id },
      relations: ['unit', 'property', 'portfolio', 'lease']
    });
    if (!charge) throw new NotFoundException('Lease charge not found');
    return charge;
  }

  async update(id: number, dto: UpdateLeaseChargeDto) {
    const charge = await this.findOne(id);
    
    // If name is being updated, use the provided name
    // Otherwise, keep the existing name
    if (!dto.name) {
      delete dto.name; // Don't update the name if not provided
    }
    
    Object.assign(charge, dto);
    return this.repo.save(charge);
  }

  async remove(id: number) {
    const charge = await this.findOne(id);
    await this.repo.remove(charge);
    return { success: true };
  }
}


