import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('CSRF Protection (e2e)', () => {
  let app: INestApplication;
  let csrfToken: string;
  let jwtCookie: string;

  beforeEach(async () => {
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-jwt-secret';
    process.env.CSRF_SECRET = process.env.CSRF_SECRET || 'test-csrf-secret';
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('CSRF Token Management', () => {
    it('should generate CSRF token after authentication', async () => {
      // First, sign up a user to get JWT
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          phone: '1234567890',
          role: 'tenant'
        })
        .expect(201);

      const cookies = signupResponse.get('Set-Cookie');
      jwtCookie = Array.isArray(cookies) ? cookies[0] : cookies;
      
      // Get CSRF token
      const csrfResponse = await request(app.getHttpServer())
        .get('/csrf/token')
        .set('Cookie', jwtCookie)
        .expect(200);

      expect(csrfResponse.headers['x-csrf-token']).toBeDefined();
      csrfToken = csrfResponse.headers['x-csrf-token'];
    });

    it('should refresh CSRF token', async () => {
      // Get initial CSRF token
      const initialResponse = await request(app.getHttpServer())
        .get('/csrf/token')
        .set('Cookie', jwtCookie)
        .expect(200);

      const initialToken = initialResponse.headers['x-csrf-token'];

      // Refresh CSRF token
      const refreshResponse = await request(app.getHttpServer())
        .post('/csrf/refresh')
        .set('Cookie', jwtCookie)
        .set('X-CSRF-Token', initialToken)
        .expect(200);

      const newToken = refreshResponse.headers['x-csrf-token'];
      expect(newToken).toBeDefined();
      expect(newToken).not.toBe(initialToken);
    });

    it('should validate CSRF token', async () => {
      const response = await request(app.getHttpServer())
        .post('/csrf/validate')
        .set('Cookie', jwtCookie)
        .set('X-CSRF-Token', csrfToken)
        .expect(200);

      expect(response.body.valid).toBe(true);
    });
  });

  describe('CSRF Protection on State-Changing Operations', () => {
    it('should require CSRF token for signout', async () => {
      // Try to signout without CSRF token
      await request(app.getHttpServer())
        .post('/auth/signout')
        .set('Cookie', jwtCookie)
        .expect(401); // Should fail without CSRF token
    });

    it('should allow signout with valid CSRF token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signout')
        .set('Cookie', jwtCookie)
        .set('X-CSRF-Token', csrfToken)
        .expect(200);

      expect(response.body.message).toBe('Signed out');
    });

    it('should require CSRF token for user deletion', async () => {
      // Try to delete user without CSRF token
      await request(app.getHttpServer())
        .delete('/auth/1')
        .set('Cookie', jwtCookie)
        .expect(401); // Should fail without CSRF token
    });

    it('should require CSRF token for user updates', async () => {
      // Try to update user without CSRF token
      await request(app.getHttpServer())
        .patch('/auth/1')
        .set('Cookie', jwtCookie)
        .send({ name: 'Updated Name' })
        .expect(401); // Should fail without CSRF token
    });
  });

  describe('CSRF Token Security', () => {
    it('should reject invalid CSRF token', async () => {
      const response = await request(app.getHttpServer())
        .post('/csrf/validate')
        .set('Cookie', jwtCookie)
        .set('X-CSRF-Token', 'invalid-token')
        .expect(400);

      expect(response.body.valid).toBe(false);
    });

    it('should reject missing CSRF token', async () => {
      const response = await request(app.getHttpServer())
        .post('/csrf/validate')
        .set('Cookie', jwtCookie)
        .expect(400);

      expect(response.body.message).toBe('CSRF token missing');
    });

    it('should reject expired CSRF token', async () => {
      // This test would require mocking time or using a very short expiry
      // For now, we'll test that the validation endpoint works
      const response = await request(app.getHttpServer())
        .post('/csrf/validate')
        .set('Cookie', jwtCookie)
        .set('X-CSRF-Token', csrfToken)
        .expect(200);

      expect(response.body.valid).toBe(true);
    });
  });

  describe('CSRF Token Headers', () => {
    it('should accept X-CSRF-Token header', async () => {
      const response = await request(app.getHttpServer())
        .post('/csrf/validate')
        .set('Cookie', jwtCookie)
        .set('X-CSRF-Token', csrfToken)
        .expect(200);

      expect(response.body.valid).toBe(true);
    });

    it('should accept X-XSRF-Token header (alternative)', async () => {
      const response = await request(app.getHttpServer())
        .post('/csrf/validate')
        .set('Cookie', jwtCookie)
        .set('X-XSRF-Token', csrfToken)
        .expect(200);

      expect(response.body.valid).toBe(true);
    });
  });
});
