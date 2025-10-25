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

  async findOrCreateWithGoogle(googleUser: { email: string; name: string; googleId: string; picture?: string, role?: 'super_admin' | 'landlord' | 'manager' | 'tenant' }) {
    console.log('[UsersService] findOrCreateWithGoogle - Start', { email: googleUser.email, googleId: googleUser.googleId });
    
    // First, try to find a user with the exact Google ID
    console.log('[UsersService] Searching for user by Google ID:', googleUser.googleId);
    let user = await this.repo.findOne({ 
      where: { googleId: googleUser.googleId }
    });

    // If user found with Google ID, return it
    if (user) {
      console.log('[UsersService] Found existing user by Google ID:', { userId: user.id, email: user.email });
      return user;
    }

    // Check if a user with this email already exists
    console.log('[UsersService] Checking if email is already registered:', googleUser.email);
    const existingUser = await this.repo.findOne({
      where: { email: googleUser.email }
    });

    if (existingUser) {
      // Don't automatically link to existing email accounts
      console.error('[UsersService] Email already registered with password-based login', { 
        userId: existingUser.id,
        email: existingUser.email 
      });
      throw new Error('An account with this email already exists. Please log in with your password instead.');
    }
    
    // No existing user found, create a new one
    console.log('[UsersService] No existing user found, creating new user');
    const randomPassword = Math.random().toString(36).slice(2) + Date.now();
    const role = (googleUser.role as 'super_admin' | 'landlord' | 'manager' | 'tenant') || 'landlord';
    
    console.log('[UsersService] Creating new user with role:', role);
    user = this.repo.create({
      email: googleUser.email,
      name: googleUser.name,
      googleId: googleUser.googleId,
      password_hash: randomPassword, // Required field, but not used for Google auth
      profile_image_url: googleUser.picture,
      isEmailVerified: true,
      is_active: true,
      requires_onboarding: true,
      role: role
    });
    
    const savedUser = await this.repo.save(user);
    console.log('[UsersService] Successfully created new user:', { userId: savedUser.id, email: savedUser.email });
    return savedUser;
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
