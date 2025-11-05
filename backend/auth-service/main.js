import Fastify from 'fastify';
// import dotenv from 'dotenv';
import './env.js';
import databasePlugin from './plugins/database.js';
import authRoutes from './routes/auth.js';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';

// Load environment variables from local .env file
// dotenv.config();

// Create Fastify server instance with logging
const app = Fastify({ 
  logger: true,
  trustProxy: false // Don't trust proxy headers, always use HTTP
});

// Register Swagger for API documentation
await app.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'Auth Service API',
      description: 'Authentication microservice for ft_transcendence - handles user login, registration, and JWT token management',
      version: '1.0.0',
    },
    // Swagger will auto-detect host from request
    // Schemes allowed for API calls
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
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
    const host = request.headers.host || 'localhost:3001';
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

// Register JWT plugin for token generation and verification
await app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'super-secret-pass',
});

// Register database plugin to connect to auth database
app.register(databasePlugin);

// Register authentication routes with /auth prefix
app.register(authRoutes, { prefix: '/auth' });

// Health check endpoint
app.get('/health', {
  schema: {
    tags: ['Health'],
    summary: 'Service Health Check',
    description: 'Check if the auth service is running and healthy',
    response: {
      200: {
        description: 'Service is healthy',
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

// Start the server
const start = async () => {
  try {
    const port = process.env.AUTH_SERVICE_PORT || 3001;

    // Listen on all interfaces (0.0.0.0) to allow external connections
    await app.listen({ port: port, host: '0.0.0.0' });

    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    console.log(`🔐 Auth Service running at ${authServiceUrl}`);
    console.log(`📊 Health check: ${authServiceUrl}/health`);
    console.log(`📚 API Documentation: ${authServiceUrl}/docs`);
    console.log(`🔑 Auth endpoints: ${authServiceUrl}/auth/login`);

  } catch (err) {
    console.error('Failed to start auth service:');
    console.error('Error details:', err);
    console.error('Stack trace:', err.stack);
    app.log.error('Failed to start auth service:', err);
    process.exit(1);
  }
};

start();
