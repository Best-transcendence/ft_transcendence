// Global test setup
import { afterEach, jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.AUTH_SERVICE_PORT = '3001';
process.env.USER_SERVICE_PORT = '3002';
process.env.GATEWAY_PORT = '3003';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

// Test database URLs (use test-specific URLs from .env)
process.env.AUTH_DATABASE_URL = process.env.AUTH_TEST_DATABASE_URL || 'file:./test-auth.db';
process.env.USER_DATABASE_URL = process.env.USER_TEST_DATABASE_URL || 'file:./test-user.db';

// Service URLs for testing
process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
process.env.USER_SERVICE_URL = 'http://localhost:3002';
process.env.GATEWAY_URL = 'http://localhost:3003';

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  // Clear any mocks
  jest.clearAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('🧪 Test environment initialized');

