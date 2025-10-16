import Fastify from 'fastify';
import dotenv from 'dotenv';
import prismaPlugin from './plugins/prisma.js';
import userRoutes from './routes/users.js';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';

// Load environment variables from local .env file
dotenv.config();

// Create Fastify server instance with structured JSON logging for ELK
const app = Fastify({
  logger: {
    level: 'info',
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        hostname: req.hostname,
        remoteAddress: req.ip
      }),
      res: (res) => ({
        statusCode: res.statusCode
      })
    }
  },
  // Add request ID for tracing
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId'
});

// Register Swagger for API documentation
await app.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'User Service API',
      description: 'User management microservice for ft_transcendence - handles user profiles, friends, and statistics',
      version: '1.0.0',
    },
    // We clean the URL from the protocol to avoid issues with Swagger UI
    host: (process.env.USER_SERVICE_URL || 'localhost:3002').replace(/^https?:\/\//, ''),
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'User Management', description: 'User profile and data management' },
      { name: 'Health', description: 'Service health check' }
    ],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter JWT token as: Bearer <token>'
      }
    }
  },
});

await app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformSpecificationClone: true,
});

// Register CORS plugin
await app.register(fastifyCors, {
  origin: [
    'http://localhost:3000',  // Frontend
    'http://localhost:3003',  // Gateway
    'http://localhost:3001'   // Auth service
  ],
  credentials: true
});

// Register JWT plugin for token validation (shared secret with auth-service)
await app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'super-secret-pass',
});

// Register Prisma plugin to connect to user database
app.register(prismaPlugin);

// Register user routes with /users prefix
app.register(userRoutes, { prefix: '/users' });

// Health check endpoint
app.get('/health', {
  schema: {
    tags: ['Health'],
    summary: 'Service Health Check',
    description: 'Check if the user service is running and healthy',
    response: {
      200: {
        description: 'Service is healthy',
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

// Start the server
const start = async () => {
  try {
    const port = process.env.USER_SERVICE_PORT || 3002;

    // Listen on all interfaces (0.0.0.0) to allow external connections
    await app.listen({ port: port, host: '0.0.0.0' });

    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';
    console.log(`👤 User Service running at ${userServiceUrl}`);
    console.log(`📊 Health check: ${userServiceUrl}/health`);
    console.log(`📚 API Documentation: ${userServiceUrl}/docs`);
    console.log(`👥 User endpoints: ${userServiceUrl}/users`);

  } catch (err) {
    console.error('Failed to start user service:');
    console.error('Error details:', err);
    console.error('Stack trace:', err.stack);
    app.log.error('Failed to start user service:', err);
    process.exit(1);
  }
};

start();
