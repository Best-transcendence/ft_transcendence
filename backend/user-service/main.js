import Fastify from 'fastify';
// import dotenv from 'dotenv';
import './env.js';
import databasePlugin from './plugins/database.js';
import userRoutes from './routes/users.js';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';

// Load environment variables from local .env file
// dotenv.config();

// Create Fastify server instance with logging
const app = Fastify({
  logger: true,
  ajv: false,
  trustProxy: false, // Don't trust proxy headers, always use HTTP
  // Critical fix — keep full objects in responses
  serializerOpts: {
    removeAdditional: false,
    skipNull: false
  }
});



// Register Swagger for API documentation
await app.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'User Service API',
      description: 'User management microservice for ft_transcendence - handles user profiles, friends, and statistics',
      version: '1.0.0',
    },
    // Swagger will auto-detect host from request
    // Schemes allowed for API calls
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
  staticCSP: {
    'default-src': ['\'self\''],
    'script-src': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''],
    'style-src': ['\'self\'', '\'unsafe-inline\''],
    'img-src': ['\'self\'', 'data:', 'https:'],
    'font-src': ['\'self\'', 'data:'],
    // Explicitly allow HTTP (no upgrade-insecure-requests)
  },
  transformSpecificationClone: true,
  transformSpecification: (swaggerObject, request, _reply) => {
    // Dynamically set host from request, always use HTTP
    const host = request.headers.host || 'localhost:3002';
    swaggerObject.host = host;
    swaggerObject.schemes = ['http']; // Force HTTP since we don't use HTTPS
    // Ensure basePath is set correctly
    if (!swaggerObject.basePath) {
      swaggerObject.basePath = '';
    }
    return swaggerObject;
  },
});

// Register CORS plugin
await app.register(fastifyCors, {
  origin: true, // Allow all origins (or specify exact origins in production)
  credentials: true
});

// Register JWT plugin for token validation (shared secret with auth-service)
await app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'super-secret-pass',
});

// Register database plugin to connect to user database
app.register(databasePlugin);

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
