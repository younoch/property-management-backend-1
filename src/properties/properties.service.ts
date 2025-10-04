import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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

  async create(createPropertyDto: CreatePropertyDto, userId: string): Promise<Property> {
    // Validate user and ownership of the specified portfolio_id
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['owned_portfolios'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!createPropertyDto.portfolio_id) {
      throw new UnauthorizedException('portfolio_id is required');
    }

    const allowedPortfolioIds: string[] = Array.isArray(user.owned_portfolios)
      ? user.owned_portfolios.map((p) => p.id)
      : [];

    if (user.role !== 'super_admin' && !allowedPortfolioIds.includes(createPropertyDto.portfolio_id)) {
      throw new UnauthorizedException('You do not have access to this portfolio');
    }

    // Create property honoring the provided portfolio_id
    const property = this.propertiesRepository.create({
      ...createPropertyDto,
    });

    return await this.propertiesRepository.save(property);
  }

  async findAll(query?: { page?: number; limit?: number; search?: string }): Promise<{ data: Property[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const search = (query?.search ?? '').trim();

    const where: any[] = [];
    if (search) {
      where.push(
        { name: ILike(`%${search}%`) },
        { address_line1: ILike(`%${search}%`) },
        { address_line2: ILike(`%${search}%`) },
        { city: ILike(`%${search}%`) },
        { state: ILike(`%${search}%`) },
        { zip_code: ILike(`%${search}%`) },
        { country: ILike(`%${search}%`) },
        { property_type: ILike(`%${search}%`) },
        { description: ILike(`%${search}%`) },
      );
    }

    const [data, total] = await this.propertiesRepository.findAndCount({
      where: where.length ? where : undefined,
      relations: ['portfolio'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['portfolio'],
    });
    
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    
    return property;
  }

  async findByPortfolio(portfolioId: string, query?: { page?: number; limit?: number; search?: string }): Promise<{ data: Property[]; total: number; page: number; limit: number }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const search = (query?.search ?? '').trim();

    let where: any | any[] = { portfolio_id: portfolioId };
    if (search) {
      where = [
        { portfolio_id: portfolioId, name: ILike(`%${search}%`) },
        { portfolio_id: portfolioId, address_line1: ILike(`%${search}%`) },
        { portfolio_id: portfolioId, address_line2: ILike(`%${search}%`) },
        { portfolio_id: portfolioId, city: ILike(`%${search}%`) },
        { portfolio_id: portfolioId, state: ILike(`%${search}%`) },
        { portfolio_id: portfolioId, zip_code: ILike(`%${search}%`) },
        { portfolio_id: portfolioId, country: ILike(`%${search}%`) },
        { portfolio_id: portfolioId, property_type: ILike(`%${search}%`) },
        { portfolio_id: portfolioId, description: ILike(`%${search}%`) },
      ];
    }

    const [data, total] = await this.propertiesRepository.findAndCount({
      where,
      relations: ['portfolio'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findByLocation(city: string, state: string): Promise<Property[]> {
    return await this.propertiesRepository.find({
      where: { city, state },
      relations: ['portfolio'],
    });
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);
    Object.assign(property, updatePropertyDto);
    return await this.propertiesRepository.save(property);
  }

  async remove(id: string): Promise<void> {
    const property = await this.findOne(id);
    await this.propertiesRepository.remove(property);
  }
} 