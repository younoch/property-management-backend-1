import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('CORS Configuration (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-jwt-secret';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should handle CORS preflight request', () => {
    return request(app.getHttpServer())
      .options('/auth/signin')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type')
      .expect(204)
      .expect('Access-Control-Allow-Origin', 'http://localhost:3000')
      .expect('Access-Control-Allow-Credentials', 'true');
  });

  it('should allow requests from localhost origins', () => {
    return request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Origin', 'http://localhost:3000')
      .expect(401) // Unauthorized, but CORS should work
      .expect('Access-Control-Allow-Origin', 'http://localhost:3000')
      .expect('Access-Control-Allow-Credentials', 'true');
  });

  it('should reject requests from disallowed origins', () => {
    return request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Origin', 'https://malicious-site.com')
      .expect(403); // Should be rejected by CORS
  });

  it('should handle requests with no origin', () => {
    return request(app.getHttpServer())
      .get('/auth/whoami')
      .expect(401); // Unauthorized, but should not be rejected by CORS
  });
});
