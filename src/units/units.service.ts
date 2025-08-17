import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../properties/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitsRepo: Repository<Unit>,
  ) {}

  create(dto: CreateUnitDto) {
    const unit = this.unitsRepo.create(dto as any);
    return this.unitsRepo.save(unit);
  }

  findAll() {
    return this.unitsRepo.find();
  }

  findByAccount(accountId: number) {
    return this.unitsRepo.find({ where: { portfolio_id: accountId } });
  }

  async findOne(id: number) {
    const unit = await this.unitsRepo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async update(id: number, dto: UpdateUnitDto) {
    const unit = await this.findOne(id);
    Object.assign(unit, dto);
    return this.unitsRepo.save(unit);
  }

  async remove(id: number) {
    const unit = await this.findOne(id);
    await this.unitsRepo.remove(unit);
    return { success: true };
  }
}


