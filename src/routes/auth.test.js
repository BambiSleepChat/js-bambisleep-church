/**
 * Tests for Auth Routes
 * Verifies user registration, login, logout, and session management
 */

import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

describe('Auth Routes', () => {
  let app;

  beforeAll(async () => {
    // Create minimal Express app for testing
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Mock session middleware
    app.use((req, res, next) => {
      req.session = req.session || {};
      req.session.destroy = callback => {
        req.session = {};
        if (callback) callback();
      };
      next();
    });

    // Import and use auth router
    const authModule = await import('./auth.js');
    app.use('/auth', authModule.default);
  });

  describe('POST /auth/register', () => {
    it('should reject registration without required fields', async () => {
      const response = await request(app).post('/auth/register').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should reject registration with missing email', async () => {
      const response = await request(app).post('/auth/register').send({
        password: 'test123',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should reject registration with missing password', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should reject registration with missing name', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        password: 'test123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });
  });

  describe('POST /auth/login', () => {
    it('should reject login without credentials', async () => {
      const response = await request(app).post('/auth/login').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject login with missing password', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });
  });

  describe('POST /auth/logout', () => {
    it('should successfully logout user', async () => {
      const response = await request(app).post('/auth/logout').send();

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Logout successful');
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Not authenticated');
    });
  });
});
