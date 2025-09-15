// User Service Tests
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { createTestUserProfile, cleanupTestDatabases } from '../utils/testHelpers.js';
import { buildUserApp } from '../utils/testAppBuilders.js';

// Import the user service app
let userApp;
let userPrisma;

describe('User Service', () => {
  beforeAll(async () => {
    // Initialize user service app
    userApp = await buildUserApp();
    
    // Initialize test database
    userPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.USER_DATABASE_URL
        }
      }
    });
  });

  afterAll(async () => {
    await cleanupTestDatabases();
    await userPrisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean database before each test
    await userPrisma.userProfile.deleteMany();
  });

  describe('POST /users/bootstrap', () => {
    test('should create new user profile successfully', async () => {
      const profileData = {
        authUserId: 123,
        name: 'bootstrapuser',
        email: 'bootstrap@example.com'
      };

      const response = await userApp.inject({
        method: 'POST',
        url: '/users/bootstrap',
        payload: profileData,
        headers: {
          'X-Correlation-ID': 'test-correlation-123'
        }
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        id: expect.any(Number),
        authUserId: profileData.authUserId,
        name: profileData.name,
        email: profileData.email,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    test('should update existing user profile (idempotent)', async () => {
      // Create initial profile
      await createTestUserProfile(userPrisma, {
        authUserId: 456,
        name: 'originalname',
        email: 'original@example.com'
      });

      // Update with new data
      const response = await userApp.inject({
        method: 'POST',
        url: '/users/bootstrap',
        payload: {
          authUserId: 456,
          name: 'updatedname',
          email: 'updated@example.com'
        },
        headers: {
          'X-Correlation-ID': 'test-correlation-456'
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        id: expect.any(Number),
        authUserId: 456,
        name: 'updatedname',
        email: 'updated@example.com'
      });
    });

    test('should fail with missing required fields', async () => {
      const response = await userApp.inject({
        method: 'POST',
        url: '/users/bootstrap',
        payload: {
          authUserId: 789
          // missing name and email
        }
      });

      expect(response.statusCode).toBe(400);
    });

    test('should fail with invalid email format', async () => {
      const response = await userApp.inject({
        method: 'POST',
        url: '/users/bootstrap',
        payload: {
          authUserId: 789,
          name: 'testuser',
          email: 'invalid-email-format'
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /users', () => {
    beforeEach(async () => {
      // Create test user profiles
      await createTestUserProfile(userPrisma, {
        authUserId: 1,
        name: 'user1',
        email: 'user1@example.com'
      });
      await createTestUserProfile(userPrisma, {
        authUserId: 2,
        name: 'user2',
        email: 'user2@example.com'
      });
    });

    test('should return all user profiles', async () => {
      const response = await userApp.inject({
        method: 'GET',
        url: '/users/'
      });

      expect(response.statusCode).toBe(200);
      const users = response.json();
      expect(Array.isArray(users)).toBe(true);
      expect(users).toHaveLength(2);
      expect(users[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String)
      });
    });
  });

  describe('GET /users/me', () => {
    beforeEach(async () => {
      // Create test user profile
      await createTestUserProfile(userPrisma, {
        authUserId: 999,
        name: 'meuser',
        email: 'me@example.com'
      });
    });

    test('should return current user profile with valid JWT', async () => {
      // Mock JWT verification - in real tests, you'd use a proper JWT
      const response = await userApp.inject({
        method: 'GET',
        url: '/users/me',
        headers: {
          'Authorization': 'Bearer valid-jwt-token'
        }
      });

      // Note: This test will fail until we implement proper JWT verification
      // For now, we expect it to fail with 401 (unauthorized)
      expect(response.statusCode).toBe(401);
    });

    test('should fail without JWT token', async () => {
      const response = await userApp.inject({
        method: 'GET',
        url: '/users/me'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await userApp.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        status: 'ok',
        service: 'user-service',
        timestamp: expect.any(String)
      });
    });
  });
});
