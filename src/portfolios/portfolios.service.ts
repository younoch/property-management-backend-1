import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from './portfolio.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio)
    private portfoliosRepository: Repository<Portfolio>,
  ) {}

  async create(createDto: CreatePortfolioDto): Promise<Portfolio> {
    const portfolio = this.portfoliosRepository.create(createDto);
    return await this.portfoliosRepository.save(portfolio);
  }

  async findAll(): Promise<Portfolio[]> {
    return await this.portfoliosRepository.find({
      relations: ['landlord', 'properties'],
    });
  }

  async findOne(id: number): Promise<Portfolio> {
    const portfolio = await this.portfoliosRepository.findOne({
      where: { id },
      relations: ['landlord', 'properties'],
    });
    if (!portfolio) {
      throw new NotFoundException(`Portfolio with ID ${id} not found`);
    }
    return portfolio;
  }

  async findByLandlord(landlordId: number): Promise<Portfolio[]> {
    return await this.portfoliosRepository.find({
      where: { landlord_id: landlordId },
      relations: ['landlord', 'properties'],
    });
  }

  async update(id: number, updateDto: UpdatePortfolioDto): Promise<Portfolio> {
    const portfolio = await this.findOne(id);
    Object.assign(portfolio, updateDto);
    return await this.portfoliosRepository.save(portfolio);
  }

  async remove(id: number): Promise<void> {
    const portfolio = await this.findOne(id);
    await this.portfoliosRepository.remove(portfolio);
  }
}


