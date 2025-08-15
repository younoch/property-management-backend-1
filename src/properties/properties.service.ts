import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { User } from '../users/user.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, userId: number): Promise<Property> {
    // Find the user and their account
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['owned_accounts'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.owned_accounts || user.owned_accounts.length === 0) {
      throw new UnauthorizedException('User has no accounts. Please create an account first.');
    }

    // Use the first account (or you could implement logic to choose which account)
    const account = user.owned_accounts[0];
    
    // Create property with the user's account_id
    const property = this.propertiesRepository.create({
      ...createPropertyDto,
      account_id: account.id,
    });
    
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