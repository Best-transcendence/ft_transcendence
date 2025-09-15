// Test utilities and helpers
import { PrismaClient } from '@prisma/client';
import { jest } from '@jest/globals';

/**
 * Create a test user in auth database
 */
export async function createTestAuthUser(prisma, userData = {}) {
  const defaultUser = {
    name: 'testuser',
    email: 'test@example.com',
    password: 'testpassword123',
    ...userData
  };

  return await prisma.user.create({
    data: defaultUser
  });
}

/**
 * Create a test user profile in user database
 */
export async function createTestUserProfile(prisma, profileData = {}) {
  const defaultProfile = {
    authUserId: 1,
    name: 'testuser',
    email: 'test@example.com',
    matchHistory: {},
    stats: {},
    ...profileData
  };

  return await prisma.userProfile.create({
    data: defaultProfile
  });
}

/**
 * Clean up test databases
 */
export async function cleanupTestDatabases() {
  const authPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  const userPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.USER_DATABASE_URL
      }
    }
  });

  try {
    // Clean auth database (ignore if table doesn't exist)
    try {
      await authPrisma.user.deleteMany();
    } catch (error) {
      if (error.code !== 'P2021') throw error; // P2021 = table doesn't exist
    }
    
    // Clean user database
    try {
      await userPrisma.userProfile.deleteMany();
    } catch (error) {
      if (error.code !== 'P2021') throw error; // P2021 = table doesn't exist
    }
    
    console.log('🧹 Test databases cleaned up');
  } catch (error) {
    console.error('Error cleaning test databases:', error);
  } finally {
    await authPrisma.$disconnect();
    await userPrisma.$disconnect();
  }
}

/**
 * Generate test JWT token
 */
export function generateTestJWT(payload = {}) {
  const jwt = require('jsonwebtoken');
  const defaultPayload = {
    userId: 1,
    email: 'test@example.com',
    ...payload
  };

  return jwt.sign(defaultPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Wait for a specified amount of time
 */
export function sleep(ms) {
  return new Promise(resolve => global.setTimeout(resolve, ms));
}

/**
 * Mock axios for testing inter-service communication
 */
export function mockAxios() {
  const _axios = require('axios');
  const mockAxios = jest.createMockFromModule('axios');
  
  // Default successful response
  mockAxios.post.mockResolvedValue({
    status: 201,
    data: { success: true }
  });
  
  return mockAxios;
}
