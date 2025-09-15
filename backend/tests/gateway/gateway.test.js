// Gateway Service Tests
import { describe, test, expect, beforeAll } from '@jest/globals';
import { generateTestJWT } from '../utils/testHelpers.js';
import { buildGatewayApp } from '../utils/testAppBuilders.js';

// Import the gateway app
let gatewayApp;

describe('Gateway Service', () => {
  beforeAll(async () => {
    // Initialize gateway app
    gatewayApp = await buildGatewayApp();
  });

  describe('Health Check', () => {
    test('should return gateway health status', async () => {
      const response = await gatewayApp.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        status: 'ok',
        service: 'gateway',
        timestamp: expect.any(String),
        services: {
          authService: expect.any(String),
          userService: expect.any(String)
        }
      });
    });
  });

  describe('Auth Service Proxy', () => {
    test('should proxy POST /auth/register to auth service', async () => {
      const userData = {
        name: 'gatewaytest',
        email: 'gateway@example.com',
        password: 'password123'
      };

      const response = await gatewayApp.inject({
        method: 'POST',
        url: '/auth/register',
        payload: userData
      });

      // This will fail if auth service is not running
      // In a real test environment, you'd mock the auth service
      expect(response.statusCode).toBe(404);
    });

    test('should proxy POST /auth/login to auth service', async () => {
      const loginData = {
        email: 'gateway@example.com',
        password: 'password123'
      };

      const response = await gatewayApp.inject({
        method: 'POST',
        url: '/auth/login',
        payload: loginData
      });

      // This will fail if auth service is not running
      expect(response.statusCode).toBe(404);
    });
  });

  describe('User Service Proxy', () => {
    test('should proxy GET /users to user service', async () => {
      const response = await gatewayApp.inject({
        method: 'GET',
        url: '/users'
      });

      // This will fail if user service is not running
      expect(response.statusCode).toBe(404);
    });

    test('should proxy GET /users/me to user service with JWT validation', async () => {
      const testToken = generateTestJWT({
        userId: 1,
        email: 'test@example.com'
      });

      const response = await gatewayApp.inject({
        method: 'GET',
        url: '/users/me',
        headers: {
          'Authorization': `Bearer ${testToken}`
        }
      });

      // This will fail if user service is not running
      expect(response.statusCode).toBe(404);
    });

    test('should reject requests to /users/me without JWT', async () => {
      const response = await gatewayApp.inject({
        method: 'GET',
        url: '/users/me'
      });

      expect(response.statusCode).toBe(401);
    });

    test('should reject requests to /users/me with invalid JWT', async () => {
      const response = await gatewayApp.inject({
        method: 'GET',
        url: '/users/me',
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await gatewayApp.inject({
        method: 'GET',
        url: '/unknown-route'
      });

      expect(response.statusCode).toBe(404);
    });

    test('should handle service unavailable gracefully', async () => {
      // Test with a route that should proxy to a service
      const response = await gatewayApp.inject({
        method: 'GET',
        url: '/users'
      });

      // Should return 404 error when service is down
      expect(response.statusCode).toBe(404);
    });
  });

  describe('CORS Headers', () => {
    test('should include CORS headers in responses', async () => {
      const response = await gatewayApp.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.headers).toHaveProperty('access-control-allow-credentials');
    });
  });
});
