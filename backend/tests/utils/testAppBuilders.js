// Test app builders that create Fastify instances without top-level await
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';

/**
 * Build auth service app for testing
 */
export async function buildAuthApp() {
  const app = Fastify({ logger: false });
  
  // Register CORS
  await app.register(cors, {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.GATEWAY_URL || 'http://localhost:3003',
      process.env.USER_SERVICE_URL || 'http://localhost:3002'
    ],
    credentials: true
  });

  // Register JWT
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'test-secret'
  });

  // Register Swagger
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Auth Service API',
        description: 'Authentication microservice for ft_transcendence',
        version: '1.0.0'
      },
      servers: [
        {
          url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
          description: 'Auth Service'
        }
      ],
      tags: [
        {
          name: 'Authentication',
          description: 'User authentication and registration endpoints'
        }
      ]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    },
    staticCSP: true,
    transformSpecificationClone: true
  });

  // Register Prisma
  const authDbUrl = process.env.AUTH_DATABASE_URL || 'file:./test-auth.db';
  console.log('Auth service using database URL:', authDbUrl);
  
  // Force override the environment variable to ensure Prisma uses the test database
  process.env.AUTH_DATABASE_URL = authDbUrl;
  
  // Create Prisma client with explicit database URL
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: authDbUrl
      }
    }
  });
  
  // Test the connection to make sure we're using the right database
  try {
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table';`;
    console.log('Tables in auth database:', tables);
  } catch (error) {
    console.error('Error querying auth database:', error.message);
  }
  
  await prisma.$connect();
  app.decorate('prisma', prisma);

  // Register routes
  const authRoutes = await import('../../auth-service/routes/auth.js');
  await app.register(authRoutes.default, { prefix: '/auth' });

  // Health check
  app.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Health Check',
      description: 'Check if the auth service is running',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            service: { type: 'string', example: 'auth-service' },
            timestamp: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00.000Z' }
          }
        }
      }
    }
  }, async (_request, _reply) => {
    return { 
      status: 'ok', 
      service: 'auth-service', 
      timestamp: new Date().toISOString() 
    };
  });

  return app;
}

/**
 * Build user service app for testing
 */
export async function buildUserApp() {
  const app = Fastify({ logger: false });
  
  // Register CORS
  await app.register(cors, {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.GATEWAY_URL || 'http://localhost:3003',
      process.env.AUTH_SERVICE_URL || 'http://localhost:3001'
    ],
    credentials: true
  });

  // Register JWT
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'test-secret'
  });

  // Register Swagger
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'User Service API',
        description: 'User management microservice for ft_transcendence',
        version: '1.0.0'
      },
      servers: [
        {
          url: process.env.USER_SERVICE_URL || 'http://localhost:3002',
          description: 'User Service'
        }
      ],
      tags: [
        {
          name: 'User Management',
          description: 'User profile and management endpoints'
        }
      ]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    },
    staticCSP: true,
    transformSpecificationClone: true
  });

  // Register Prisma
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.USER_DATABASE_URL || 'file:./test-user.db'
      }
    }
  });
  
  await prisma.$connect();
  app.decorate('prisma', prisma);

  // Register routes
  const userRoutes = await import('../../user-service/routes/users.js');
  await app.register(userRoutes.default, { prefix: '/users' });

  // Health check
  app.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Health Check',
      description: 'Check if the user service is running',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            service: { type: 'string', example: 'user-service' },
            timestamp: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00.000Z' }
          }
        }
      }
    }
  }, async (_request, _reply) => {
    return { 
      status: 'ok', 
      service: 'user-service', 
      timestamp: new Date().toISOString() 
    };
  });

  return app;
}

/**
 * Build gateway app for testing
 */
export async function buildGatewayApp() {
  const app = Fastify({ logger: false });
  
  // Register CORS
  await app.register(cors, {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      process.env.USER_SERVICE_URL || 'http://localhost:3002'
    ],
    credentials: true
  });

  // Register JWT
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'test-secret'
  });

  // Register Swagger
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'API Gateway',
        description: 'API Gateway for ft_transcendence microservices',
        version: '1.0.0'
      },
      servers: [
        {
          url: process.env.GATEWAY_URL || 'http://localhost:3003',
          description: 'API Gateway'
        }
      ],
      tags: [
        {
          name: 'Authentication',
          description: 'Authentication endpoints (proxied to auth-service)'
        },
        {
          name: 'User Management',
          description: 'User management endpoints (proxied to user-service)'
        }
      ]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    },
    staticCSP: true,
    transformSpecificationClone: true
  });

  // JWT validation middleware for protected routes
  const validateJWT = async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (_err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  };

  // Auth service proxy routes
  app.all('/auth/*', async (_request, reply) => {
    // Mock proxy - in real tests, this would forward to auth service
    const _authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const _path = _request.url.replace('/auth', '');
    
    // For testing, return 404 to simulate service not running
    reply.status(404).send({ error: 'Auth service not available in test mode' });
  });

  // User service proxy routes
  app.all('/users/*', async (_request, reply) => {
    // Mock proxy - in real tests, this would forward to user service
    const _userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';
    const _path = _request.url;
    
    // For testing, return 404 to simulate service not running
    reply.status(404).send({ error: 'User service not available in test mode' });
  });

  // Protected user routes
  app.get('/users/me', { preHandler: validateJWT }, async (_request, reply) => {
    // Mock protected route
    reply.status(404).send({ error: 'User service not available in test mode' });
  });

  // Health check
  app.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Health Check',
      description: 'Check if the gateway is running',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            service: { type: 'string', example: 'gateway' },
            timestamp: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00.000Z' },
            services: {
              type: 'object',
              properties: {
                authService: { type: 'string', example: 'http://localhost:3001' },
                userService: { type: 'string', example: 'http://localhost:3002' }
              }
            }
          }
        }
      }
    }
  }, async (_request, _reply) => {
    return { 
      status: 'ok', 
      service: 'gateway',
      timestamp: new Date().toISOString(),
      services: {
        authService: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        userService: process.env.USER_SERVICE_URL || 'http://localhost:3002'
      }
    };
  });

  return app;
}
