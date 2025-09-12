import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/filters/http-exception.filter';

describe('Whoami Endpoint Error Handling (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /auth/whoami', () => {
    it('should return 401 with NO_TOKEN error when no access token provided', () => {
      return request(app.getHttpServer())
        .get('/auth/whoami')
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', false);
          expect(res.body).toHaveProperty('message', 'Access token is required. Please sign in to continue.');
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body).toHaveProperty('errorType', 'NO_TOKEN');
          expect(res.body).toHaveProperty('path', '/auth/whoami');
          expect(res.body).toHaveProperty('method', 'GET');
          expect(res.body).toHaveProperty('timestamp');
        });
    });

    it('should return 401 with INVALID_TOKEN error when invalid token provided', () => {
      return request(app.getHttpServer())
        .get('/auth/whoami')
        .set('Cookie', 'access_token=invalid_token_here')
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', false);
          expect(res.body).toHaveProperty('errorType', 'INVALID_TOKEN');
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body).toHaveProperty('path', '/auth/whoami');
          expect(res.body).toHaveProperty('method', 'GET');
          expect(res.body).toHaveProperty('timestamp');
        });
    });

    it('should return 401 with TOKEN_EXPIRED error when expired token provided', () => {
      // Create an expired JWT token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImV4cCI6MTYxMjM0NTY3OX0.expired_signature';
      
      return request(app.getHttpServer())
        .get('/auth/whoami')
        .set('Cookie', `access_token=${expiredToken}`)
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', false);
          expect(res.body).toHaveProperty('errorType', 'TOKEN_EXPIRED');
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body).toHaveProperty('path', '/auth/whoami');
          expect(res.body).toHaveProperty('method', 'GET');
          expect(res.body).toHaveProperty('timestamp');
        });
    });

    it('should return proper error response structure', () => {
      return request(app.getHttpServer())
        .get('/auth/whoami')
        .expect(401)
        .expect((res) => {
          const body = res.body;
          
          // Check required properties
          expect(body).toHaveProperty('success');
          expect(body).toHaveProperty('message');
          expect(body).toHaveProperty('statusCode');
          expect(body).toHaveProperty('timestamp');
          expect(body).toHaveProperty('path');
          expect(body).toHaveProperty('method');
          expect(body).toHaveProperty('errorType');
          
          // Check data types
          expect(typeof body.success).toBe('boolean');
          expect(typeof body.message).toBe('string');
          expect(typeof body.statusCode).toBe('number');
          expect(typeof body.timestamp).toBe('string');
          expect(typeof body.path).toBe('string');
          expect(typeof body.method).toBe('string');
          expect(typeof body.errorType).toBe('string');
          
          // Check values
          expect(body.success).toBe(false);
          expect(body.statusCode).toBe(401);
          expect(body.path).toBe('/auth/whoami');
          expect(body.method).toBe('GET');
          
          // Check timestamp format
          expect(new Date(body.timestamp)).toBeInstanceOf(Date);
          expect(new Date(body.timestamp).toString()).not.toBe('Invalid Date');
        });
    });
  });
});
