// Auth Service Tests
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { createTestAuthUser, cleanupTestDatabases } from '../utils/testHelpers.js';
import { buildAuthApp } from '../utils/testAppBuilders.js';

// Import the auth service app
let authApp;
let authPrisma;

describe('Auth Service', () => {
  beforeAll(async () => {
    // Initialize auth service app
    authApp = await buildAuthApp();
    
    
    // Initialize test database
    authPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.AUTH_DATABASE_URL
        }
      }
    });
  });

  afterAll(async () => {
    await cleanupTestDatabases();
    await authPrisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean database before each test (ignore if table doesn't exist)
    try {
      await authPrisma.user.deleteMany();
    } catch (error) {
      if (error.code !== 'P2021') throw error; // P2021 = table doesn't exist
    }
  });

  describe('POST /auth/signup', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await authApp.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: userData
      });

      console.log('Response status:', response.statusCode);
      console.log('Response body:', response.body);
      if (response.statusCode !== 201) {
        console.log('Error details:', response.json());
      }
      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        id: expect.any(Number),
        name: userData.name,
        email: userData.email
      });
      expect(response.json()).not.toHaveProperty('password');
    });

    test('should fail with missing required fields', async () => {
      const response = await authApp.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: {
          name: 'testuser'
          // missing email and password
        }
      });

      expect(response.statusCode).toBe(400);
    });

    test('should fail with invalid email format', async () => {
      const userData = {
        name: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await authApp.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: userData
      });

      expect(response.statusCode).toBe(400);
    });

    test('should fail with duplicate email', async () => {
      // Create first user
      await createTestAuthUser(authPrisma, {
        name: 'user1',
        email: 'duplicate@example.com',
        password: 'password123'
      });

      // Try to create second user with same email
      const response = await authApp.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: {
          name: 'user2',
          email: 'duplicate@example.com',
          password: 'password456'
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await createTestAuthUser(authPrisma, {
        name: 'logintest',
        email: 'login@example.com',
        password: 'loginpassword123'
      });
    });

    test('should login with valid credentials', async () => {
      const response = await authApp.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'login@example.com',
          password: 'loginpassword123'
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        token: expect.any(String),
        user: {
          id: expect.any(Number),
          name: 'logintest',
          email: 'login@example.com'
        }
      });
    });

    test('should fail with invalid email', async () => {
      const response = await authApp.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'loginpassword123'
        }
      });

      expect(response.statusCode).toBe(401);
    });

    test('should fail with invalid password', async () => {
      const response = await authApp.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'login@example.com',
          password: 'wrongpassword'
        }
      });

      expect(response.statusCode).toBe(401);
    });

    test('should fail with missing credentials', async () => {
      const response = await authApp.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'login@example.com'
          // missing password
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await authApp.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        status: 'ok',
        service: 'auth-service',
        timestamp: expect.any(String)
      });
    });
  });
});
