import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Feedback } from '../src/feedback/feedback.entity';
import { User } from '../src/users/user.entity';

describe('Feedback (e2e)', () => {
  let app: INestApplication;
  
  const mockFeedbackRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Feedback))
      .useValue(mockFeedbackRepository)
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /feedback', () => {
    it('should submit feedback from authenticated user', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockFeedback = {
        id: 1,
        message: 'Test feedback',
        userId: 1,
        userEmail: 'test@example.com',
        isReviewed: false,
        createdAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockFeedbackRepository.save.mockResolvedValueOnce(mockFeedback);

      return request(app.getHttpServer())
        .post('/feedback')
        .send({
          message: 'Test feedback',
          user_id: 1,
          user_email: 'test@example.com',
          page_url: 'http://localhost:3000/test',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('data');
          expect(response.body.data).toHaveProperty('message', 'Test feedback');
        });
    });

    it('should submit feedback from unauthenticated user', async () => {
      const mockFeedback = {
        id: 2,
        message: 'Anonymous feedback',
        userId: null,
        userEmail: 'anonymous@example.com',
        isReviewed: false,
        createdAt: new Date(),
      };

      mockFeedbackRepository.save.mockResolvedValueOnce(mockFeedback);

      return request(app.getHttpServer())
        .post('/feedback')
        .send({
          message: 'Anonymous feedback',
          user_email: 'anonymous@example.com',
          page_url: '/test-page',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('success', true);
          expect(response.body.data).toHaveProperty('userId', null);
        });
    });
  });

  describe('GET /feedback', () => {
    it('should return paginated feedback (admin only)', async () => {
      const mockFeedbackList = [
        {
          id: 1,
          message: 'Test feedback 1',
          userId: 1,
          userEmail: 'test@example.com',
          isReviewed: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          message: 'Test feedback 2',
          userId: null,
          userEmail: 'anonymous@example.com',
          isReviewed: true,
          createdAt: new Date(),
        },
      ];

      mockFeedbackRepository.findAndCount = jest
        .fn()
        .mockResolvedValueOnce([mockFeedbackList, 2]);

      // Note: In a real test, you would need to mock authentication
      return request(app.getHttpServer())
        .get('/feedback')
        .set('Authorization', 'Bearer admin-token')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('success', true);
          expect(Array.isArray(response.body.data)).toBe(true);
          expect(response.body).toHaveProperty('meta');
          expect(response.body.meta).toHaveProperty('total', 2);
        });
    });
  });
});
