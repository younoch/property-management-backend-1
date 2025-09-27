import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(email: string, passwordHash: string, name: string, phone: string, role: 'super_admin' | 'landlord' | 'manager' | 'tenant') {
    const user = this.repo.create({ 
      email, 
      passwordHash, 
      name, 
      phone, 
      role,
      isActive: true,
      requiresOnboarding: true, // New users need to complete onboarding
      onboardingCompletedAt: null // Will be set when onboarding is completed
    });

    return this.repo.save(user);
  }

  findOne(id: number) {
    if (!id) {
      return null;
    }
    return this.repo.findOne({ 
      where: { id },
      relations: ['owned_portfolios', 'notifications']
    });
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

  async findByPortfolio(portfolioId: number) {
    // TODO: implement proper join to fetch users associated with a given portfolio
    return this.repo.find();
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return this.repo.remove(user);
  }
}
