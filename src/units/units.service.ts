import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../units/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitsRepo: Repository<Unit>,
  ) {}

  create(dto: CreateUnitDto) {
    const unit = this.unitsRepo.create(dto);
    return this.unitsRepo.save(unit);
  }

  findAll() {
    return this.unitsRepo.find();
  }

  private validateUUID(id: string, fieldName = 'ID'): void {
    if (!isUUID(id)) {
      throw new BadRequestException(`Invalid ${fieldName} format. Must be a valid UUID.`);
    }
  }

  async findOne(id: string) {
    this.validateUUID(id, 'Unit ID');
    
    try {
      const unit = await this.unitsRepo.findOne({ 
        where: { id },
        relations: ['property']
      });
      
      if (!unit) {
        throw new NotFoundException(`Unit with ID ${id} not found`);
      }
      return unit;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch unit. Please check your request parameters.');
    }
  }

  async findOneInProperty(propertyId: string, id: string) {
    this.validateUUID(propertyId, 'Property ID');
    this.validateUUID(id, 'Unit ID');
    
    try {
      const unit = await this.unitsRepo.findOne({
        where: {
          id,
          property: { id: propertyId }
        },
        relations: ['property']
      });
      
      if (!unit) {
        throw new NotFoundException(`Unit with ID ${id} not found in property ${propertyId}`);
      }
      
      return unit;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch unit. Please check your request parameters.');
    }
  }

  async findByProperty(propertyId: string) {
    this.validateUUID(propertyId, 'Property ID');
    
    try {
      return await this.unitsRepo.find({
        where: { property: { id: propertyId } },
        relations: ['property']
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch units. Please check your request parameters.');
    }
  }

  async update(id: string, dto: UpdateUnitDto) {
    const unit = await this.findOne(id);
    Object.assign(unit, dto);
    return this.unitsRepo.save(unit);
  }

  async remove(id: string) {
    const unit = await this.findOne(id);
    await this.unitsRepo.remove(unit);
    return { success: true };
  }
}


