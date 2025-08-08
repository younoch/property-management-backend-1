import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountsRepository.create(createAccountDto);
    return await this.accountsRepository.save(account);
  }

  async findAll(): Promise<Account[]> {
    return await this.accountsRepository.find({
      relations: ['landlord', 'properties'],
    });
  }

  async findOne(id: number): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id },
      relations: ['landlord', 'properties'],
    });
    
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    
    return account;
  }

  async findByLandlord(landlordId: number): Promise<Account[]> {
    return await this.accountsRepository.find({
      where: { landlord_id: landlordId },
      relations: ['landlord', 'properties'],
    });
  }

  async update(id: number, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(id);
    Object.assign(account, updateAccountDto);
    return await this.accountsRepository.save(account);
  }

  async remove(id: number): Promise<void> {
    const account = await this.findOne(id);
    await this.accountsRepository.remove(account);
  }
} 