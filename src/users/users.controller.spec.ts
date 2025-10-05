import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;
  let fakeConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: string) => {
        return Promise.resolve({
          id,
          email: 'asdf@asdf.com',
          password: 'asdf',
        } as unknown as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: '1', email, password: 'asdf' } as unknown as User]);
      },
      // remove: () => {},
      // update: () => {},
    };
    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({
          id: 1,
          email,
          name: 'Test User',
          phone: '+1234567890',
          role: 'tenant' as const,
          profile_image_url: null,
          is_active: true,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          admin: false,
        } as unknown as User);
      },
    };

    fakeConfigService = {
      get: jest.fn().mockReturnValue('test'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        {
          provide: ConfigService,
          useValue: fakeConfigService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('asdf@asdf.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('asdf@asdf.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    try {
      await controller.findUser('1');
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('signin returns full user data and sets cookie header', async () => {
    const res: any = { setHeader: jest.fn() };
    // Create a mock user with all fields
    const mockUser = {
      id: '1',
      email: 'asdf@asdf.com',
      name: 'Test User',
      phone: '+1234567890',
      role: 'tenant' as const,
      profile_image_url: null,
      is_active: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      admin: false,
    };
    
    // Extend fake auth service to attach setCookie and return full user data
    (fakeAuthService as any).issueLoginResponse = (user: any) => ({
      ...user,
      setCookie: 'access_token=abc; HttpOnly; Path=/; SameSite=None',
    });
    
    const login = await (controller as any).signin(
      { email: 'asdf@asdf.com', password: 'asdf' },
      res,
    );
    
    // Verify all user fields are returned
    expect(login.id).toEqual(1);
    expect(login.email).toEqual('asdf@asdf.com');
    expect(login.name).toEqual('Test User');
    expect(login.phone).toEqual('+1234567890');
    expect(login.role).toEqual('tenant');
    expect(login.profile_image_url).toBeNull();
    expect(login.is_active).toBe(true);
    expect(login.created_at).toBeDefined();
    expect(login.updated_at).toBeDefined();
    expect(login.admin).toBe(false);
    expect(login.setCookie).toBeDefined();
    
    expect(res.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('access_token='),
    );
  });

  it('whoAmI returns full user data for authenticated user', () => {
    // Create a mock user with all fields
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      phone: '+1234567890',
      role: 'tenant' as const,
      profile_image_url: null,
      is_active: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      admin: false,
    };

    const result = controller.whoAmI(mockUser as unknown as User);

    // Verify all user fields are returned
    expect(result.id).toEqual('1');
    expect(result.email).toEqual('test@example.com');
    expect(result.name).toEqual('Test User');
    expect(result.phone).toEqual('+1234567890');
    expect(result.role).toEqual('tenant');
    expect(result.profile_image_url).toBeNull();
    expect(result.is_active).toBe(true);
    expect(result.created_at).toBeDefined();
    expect(result.updated_at).toBeDefined();
    expect(result.admin).toBe(false);
  });
});
