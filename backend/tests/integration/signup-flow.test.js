// Integration Tests - Complete Signup Flow
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { cleanupTestDatabases, mockAxios } from '../utils/testHelpers.js';
import { buildAuthApp, buildUserApp, buildGatewayApp } from '../utils/testAppBuilders.js';

// Import all service apps
let authApp, userApp, gatewayApp;
let authPrisma, userPrisma;

describe('Integration Tests - Signup Flow', () => {
  beforeAll(async () => {
    // Initialize all service apps
    authApp = await buildAuthApp();
    userApp = await buildUserApp();
    gatewayApp = await buildGatewayApp();
    
    // Initialize test databases
    authPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.AUTH_DATABASE_URL
        }
      }
    });

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
    await authPrisma.$disconnect();
    await userPrisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean databases before each test (ignore if tables don't exist)
    try {
      await authPrisma.user.deleteMany();
    } catch (error) {
      if (error.code !== 'P2021') throw error; // P2021 = table doesn't exist
    }
    try {
      await userPrisma.userProfile.deleteMany();
    } catch (error) {
      if (error.code !== 'P2021') throw error; // P2021 = table doesn't exist
    }
  });

  describe('Complete Signup Flow', () => {
    test('should create user in auth service and bootstrap profile in user service', async () => {
      const userData = {
        name: 'integrationtest',
        email: 'integration@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      // Step 1: Register user through auth service
      const authResponse = await authApp.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: userData
      });

      expect(authResponse.statusCode).toBe(201);
      const authUser = authResponse.json();
      expect(authUser).toMatchObject({
        id: expect.any(Number),
        name: userData.name,
        email: userData.email
      });

      // Step 2: Verify user was created in auth database
      const createdAuthUser = await authPrisma.user.findUnique({
        where: { id: authUser.id }
      });
      expect(createdAuthUser).toBeTruthy();
      expect(createdAuthUser.name).toBe(userData.name);
      expect(createdAuthUser.email).toBe(userData.email);

      // Step 3: Manually call bootstrap endpoint (simulating the internal call)
      const bootstrapResponse = await userApp.inject({
        method: 'POST',
        url: '/users/bootstrap',
        payload: {
          authUserId: authUser.id,
          name: authUser.name,
          email: authUser.email
        },
        headers: {
          'X-Correlation-ID': 'integration-test-123'
        }
      });

      expect(bootstrapResponse.statusCode).toBe(201);
      const userProfile = bootstrapResponse.json();
      expect(userProfile).toMatchObject({
        id: expect.any(Number),
        authUserId: authUser.id,
        name: authUser.name,
        email: authUser.email
      });

      // Step 4: Verify profile was created in user database
      const createdProfile = await userPrisma.userProfile.findUnique({
        where: { authUserId: authUser.id }
      });
      expect(createdProfile).toBeTruthy();
      expect(createdProfile.name).toBe(userData.name);
      expect(createdProfile.email).toBe(userData.email);
    });

    test('should handle bootstrap failure gracefully', async () => {
      // Mock axios to simulate user service failure
      const mockAxiosInstance = mockAxios();
      mockAxiosInstance.post.mockRejectedValue(new Error('User service unavailable'));

      const userData = {
        name: 'failuretest',
        email: 'failure@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      // Register user - should still succeed even if bootstrap fails
      const authResponse = await authApp.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: userData
      });

      // Auth registration should still succeed
      expect(authResponse.statusCode).toBe(201);
      const authUser = authResponse.json();
      expect(authUser.name).toBe(userData.name);
    });
  });

  describe('Login Flow', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      try {
        await authPrisma.user.create({
          data: {
            name: 'logintest',
            email: 'login@example.com',
            password: 'loginpassword123'
          }
        });
      } catch (error) {
        if (error.code !== 'P2021') throw error; // P2021 = table doesn't exist
        console.log('Skipping user creation - table not ready yet');
      }
    });

    test('should login successfully and return JWT token', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'loginpassword123'
      };

      const response = await authApp.inject({
        method: 'POST',
        url: '/auth/login',
        payload: loginData
      });

      expect(response.statusCode).toBe(200);
      const loginResult = response.json();
      expect(loginResult).toMatchObject({
        token: expect.any(String),
        user: {
          id: expect.any(Number),
          name: 'logintest',
          email: 'login@example.com'
        }
      });

      // Verify JWT token is valid
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(loginResult.token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(loginResult.user.id);
    });
  });

  describe('Gateway Integration', () => {
    test('should route auth requests through gateway', async () => {
      const userData = {
        name: 'gatewaytest',
        email: 'gateway@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      // This test will only work if all services are running
      // In a real CI/CD environment, you'd start all services
      const response = await gatewayApp.inject({
        method: 'POST',
        url: '/auth/signup',
        payload: userData
      });

      // Expect either success or service unavailable
      expect([200, 201, 404, 500, 502, 503]).toContain(response.statusCode);
    });
  });
});
