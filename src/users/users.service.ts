import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(
    email: string, 
    password_hash: string | null, 
    name: string, 
    phone: string, 
    role: 'super_admin' | 'landlord' | 'manager' | 'tenant',
    additionalFields: Partial<User> = {}
  ) {
    const user = this.repo.create({ 
      email, 
      password_hash, 
      name, 
      phone, 
      role,
      is_active: true,
      requires_onboarding: true, // New users need to complete onboarding
      onboarding_completed_at: null, // Will be set when onboarding is completed
      ...additionalFields
    });

    return this.repo.save(user);
  }

  async findOrCreateWithGoogle(googleUser: { email: string; name: string; googleId: string; picture?: string }) {
    // First, try to find a user with the exact Google ID
    let user = await this.repo.findOne({ 
      where: { googleId: googleUser.googleId }
    });

    // If no user found with this Google ID, check if a user with this email exists
    if (!user) {
      const existingUser = await this.repo.findOne({
        where: { email: googleUser.email }
      });

      if (existingUser) {
        // If a user with this email exists but doesn't have a Google ID,
        // it means they signed up with email/password
        // We should not automatically link these accounts as it could be a security issue
        throw new Error('An account with this email already exists. Please log in using your email and password.');
      }
      
      // No existing user found, create a new one
      const randomPassword = Math.random().toString(36).slice(2) + Date.now();
      
      user = this.repo.create({
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.googleId,
        password_hash: randomPassword, // Required field, but not used for Google auth
        profile_image_url: googleUser.picture,
        isEmailVerified: true,
        is_active: true,
        requires_onboarding: true,
        role: 'landlord' // Default role for new users, can be updated later
      });
      await this.repo.save(user);
    }

    return user;
  }

  async findByGoogleId(googleId: string) {
    return this.repo.findOne({ where: { googleId } });
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
