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
    // Find the user and their portfolio
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['owned_portfolios'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.owned_portfolios || user.owned_portfolios.length === 0) {
      throw new UnauthorizedException('User has no portfolios. Please create a portfolio first.');
    }

    // Use the first portfolio (or implement selection logic)
    const portfolio = user.owned_portfolios[0];
    
    // Create property with the user's portfolio_id
    const property = this.propertiesRepository.create({
      ...createPropertyDto,
      portfolio_id: portfolio.id,
    });
    
    return await this.propertiesRepository.save(property);
  }

  async findAll(): Promise<Property[]> {
    return await this.propertiesRepository.find({
      relations: ['portfolio'],
    });
  }

  async findOne(id: number): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['portfolio'],
    });
    
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    
    return property;
  }

  async findByPortfolio(portfolioId: number): Promise<Property[]> {
    return await this.propertiesRepository.find({
      where: { portfolio_id: portfolioId },
      relations: ['portfolio'],
    });
  }

  async findByLocation(city: string, state: string): Promise<Property[]> {
    return await this.propertiesRepository.find({
      where: { city, state },
      relations: ['portfolio'],
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