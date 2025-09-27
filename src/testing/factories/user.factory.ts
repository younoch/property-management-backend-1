import { User } from '../../users/user.entity';
import * as bcrypt from 'bcryptjs';

export class UserFactory {
  static async create(overrides: Partial<User> = {}): Promise<User> {
    const user = new User();
    user.id = 1;
    user.name = 'Test User';
    user.email = 'test@example.com';
    // Use a test password that gets hashed dynamically
    const testPassword = process.env.TEST_PASSWORD || 'testpassword123';
    user.passwordHash = await bcrypt.hash(testPassword, 12);
    user.isActive = true;
    user.role = 'landlord' as any;
    
    Object.assign(user, overrides);
    return user;
  }

  static async createAdmin(overrides: Partial<User> = {}): Promise<User> {
    return this.create({ role: 'super_admin' as any, ...overrides });
  }

  static async createMany(count: number, overrides: Partial<User> = {}): Promise<User[]> {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      const user = await this.create(overrides);
      user.id = i + 1;
      user.email = `test${i + 1}@example.com`;
      users.push(user);
    }
    return users;
  }
} 