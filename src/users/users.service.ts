import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(email: string, password_hash: string, name: string, phone: string, role: 'super_admin' | 'landlord' | 'manager' | 'tenant') {
    const user = this.repo.create({ 
      email, 
      password_hash, 
      name, 
      phone, 
      role,
      is_active: true,
      requires_onboarding: true, // New users need to complete onboarding
      onboarding_completed_at: null // Will be set when onboarding is completed
    });

    return this.repo.save(user);
  }

  async findOne(id: string) {
    if (!id) {
      console.warn('No ID provided to findOne');
      return null;
    }
    
    try {
      const user = await this.repo.findOne({ 
        where: { id },
        relations: ['owned_portfolios', 'notifications']
      });
      
      if (!user) {
        console.warn(`User with ID ${id} not found`);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  findAll() {
    return this.repo.find({
      relations: ['owned_portfolios', 'notifications']
    });
  }

  findByEmail(email: string) {
    return this.repo.find({ 
      where: { email },
      relations: ['owned_portfolios', 'notifications']
    });
  }

  // Backward-compatible alias used by existing controllers/services
  find(email: string) {
    return this.findByEmail(email);
  }

  async findByPortfolio(portfolioId: string) {
    // TODO: implement proper join to fetch users associated with a given portfolio
    return this.repo.find();
  }

  async update(id: string, attrs: Partial<User>) {
    if (!id) {
      throw new NotFoundException('User ID is required');
    }
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  async remove(id: string) {
    if (!id) {
      throw new NotFoundException('User ID is required');
    }
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.repo.remove(user);
  }
}
