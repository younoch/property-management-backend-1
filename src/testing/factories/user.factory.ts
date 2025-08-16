import { User } from '../../users/user.entity';
import * as bcrypt from 'bcrypt';

export class UserFactory {
  static async create(overrides: Partial<User> = {}): Promise<User> {
    const user = new User();
    user.id = 1;
    user.email = 'test@example.com';
    // Use a test password that gets hashed dynamically
    const testPassword = process.env.TEST_PASSWORD || 'testpassword123';
    user.password_hash = await bcrypt.hash(testPassword, 12);
    user.admin = false;
    
    Object.assign(user, overrides);
    return user;
  }

  static async createAdmin(overrides: Partial<User> = {}): Promise<User> {
    return this.create({
      admin: true,
      ...overrides,
    });
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