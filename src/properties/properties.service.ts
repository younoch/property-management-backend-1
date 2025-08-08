import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const property = this.propertiesRepository.create(createPropertyDto);
    return await this.propertiesRepository.save(property);
  }

  async findAll(): Promise<Property[]> {
    return await this.propertiesRepository.find({
      relations: ['account'],
    });
  }

  async findOne(id: number): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['account'],
    });
    
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    
    return property;
  }

  async findByAccount(accountId: number): Promise<Property[]> {
    return await this.propertiesRepository.find({
      where: { account_id: accountId },
      relations: ['account'],
    });
  }

  async findByLocation(city: string, state: string): Promise<Property[]> {
    return await this.propertiesRepository.find({
      where: { city, state },
      relations: ['account'],
    });
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);
    Object.assign(property, updatePropertyDto);
    return await this.propertiesRepository.save(property);
  }

  async remove(id: number): Promise<void> {
    const property = await this.findOne(id);
    await this.propertiesRepository.remove(property);
  }
} 