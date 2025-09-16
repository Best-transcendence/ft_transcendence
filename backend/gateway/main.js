import Fastify from 'fastify';
import dotenv from 'dotenv';
import fastifyJwt from '@fastify/jwt';
import fastifyHttpProxy from '@fastify/http-proxy';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';

// Load environment variables from centralized .env file
dotenv.config();

// Create Fastify server instance with logging
const app = Fastify({ 
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
});

// Register CORS plugin
await app.register(fastifyCors, {
  origin: [
    `http://${process.env.HOST || 'localhost'}:${process.env.FRONTEND_PORT || 3000}`,  // Frontend
    `http://${process.env.HOST || 'localhost'}:${process.env.AUTH_SERVICE_PORT || 3001}`,  // Auth service
    `http://${process.env.HOST || 'localhost'}:${process.env.USER_SERVICE_PORT || 3002}`   // User service
  ],
  credentials: true
});

// Register JWT plugin for token validation
await app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'super-secret-pass',
});

// Register Swagger for API documentation
await app.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'Gateway API',
      description: `
                API Gateway for ft_transcendence microservices - routes requests to individual services.
                
                **Service Documentation:**
                - [Auth Service](${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}/docs) - Authentication and JWT handling
                - [User Service](${process.env.USER_SERVICE_URL || 'http://localhost:3002'}/docs) - User profiles and management
                
                **Note:** This gateway proxies requests to the individual microservices. 
                For detailed API schemas and examples, refer to the individual service documentation above.
            `,
      version: '1.0.0',
    },
    // We clean the URL from the protocol to avoid issues with Swagger UI
    host: (process.env.GATEWAY_URL || 'localhost:3003').replace(/^https?:\/\//, ''),

    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { 
        name: 'Authentication', 
        description: `Auth service endpoints (login, signup) - [See detailed docs](${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}/docs)` 
      },
      { 
        name: 'User Management', 
        description: `User service endpoints (profiles, data) - [See detailed docs](${process.env.USER_SERVICE_URL || 'http://localhost:3002'}/docs)` 
      },
      { name: 'Health', description: 'Service health checks' }
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
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    displayRequestDuration: true,
    filter: true,
    showExtensions: false,
    showCommonExtensions: false,
    tryItOutEnabled: true
  },
  staticCSP: true,
  transformSpecificationClone: true,
  transformSpecification: (swaggerObject, _request, _reply) => {
    // Remove the default tag and its routes
    if (swaggerObject.tags) {
      swaggerObject.tags = swaggerObject.tags.filter(tag => tag.name !== 'default');
    }
    if (swaggerObject.paths) {
      // Remove any paths that don't have proper tags
      Object.keys(swaggerObject.paths).forEach(path => {
        Object.keys(swaggerObject.paths[path]).forEach(method => {
          const operation = swaggerObject.paths[path][method];
          if (!operation.tags || operation.tags.includes('default')) {
            delete swaggerObject.paths[path][method];
          }
        });
        // Remove empty path objects
        if (Object.keys(swaggerObject.paths[path]).length === 0) {
          delete swaggerObject.paths[path];
        }
      });
    }
    return swaggerObject;
  }
});

// JWT validation middleware for protected routes
const validateJWT = async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (_err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
};

// Request logging middleware
const logRequest = async (request, reply) => {
  const start = Date.now();
  const service = request.url.startsWith('/auth') ? 'auth-service' : 'user-service';
    
  // Log the incoming request
  app.log.info({
    method: request.method,
    url: request.url,
    service: service
  }, `Incoming request: ${request.method} ${request.url} → ${service}`);
    
  // Add response logging hook
  reply.raw.on('finish', () => {
    const duration = Date.now() - start;
    app.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
      service: service
    }, `Request completed: ${request.method} ${request.url} → ${service} → ${reply.statusCode} (${duration}ms)`);
  });
};

// Health check endpoint
app.get('/health', {
  schema: {
    tags: ['Health'],
    summary: 'Gateway Health Check',
    description: 'Check if the gateway service is running and healthy',
    response: {
      200: {
        description: 'Gateway is healthy',
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          service: { type: 'string', example: 'gateway' },
          timestamp: { type: 'string', format: 'date-time' },
          services: {
            type: 'object',
            properties: {
              authService: { type: 'string', example: process.env.AUTH_SERVICE_URL || 'http://localhost:3001' },
              userService: { type: 'string', example: process.env.USER_SERVICE_URL || 'http://localhost:3002' }
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

// Auth service routes (no JWT validation needed)
app.register(async function (fastify) {
  fastify.addHook('preHandler', logRequest);
    
  fastify.register(fastifyHttpProxy, {
    upstream: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    prefix: '/auth',
    rewritePrefix: '/auth',
    // Only handle specific methods to avoid generic route generation
    methods: ['POST'],
    // Add Swagger metadata for documentation
    schema: {
      tags: ['Authentication'],
      summary: 'Auth Service Endpoints',
      description: `Authentication endpoints - [See detailed docs](${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}/docs)`
    }
  });
});

// User service routes (JWT validation required)
app.register(async function (fastify) {
  fastify.addHook('preHandler', logRequest);
    
  fastify.register(fastifyHttpProxy, {
    upstream: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    prefix: '/users',
    rewritePrefix: '/users',
    // Only handle specific methods to avoid generic route generation
    methods: ['GET'],
    // Add Swagger metadata for documentation
    schema: {
      tags: ['User Management'],
      summary: 'User Service Endpoints',
      description: `User management endpoints - [See detailed docs](${process.env.USER_SERVICE_URL || 'http://localhost:3002'}/docs)`
    },
    preHandler: (request, reply, done) => {
      // Only validate JWT for /users/me endpoint
      if (request.url === '/users/me') {
        validateJWT(request, reply);
      }
      done();
    }
  });
});

// Start the server
const start = async () => {
  try {
    const port = process.env.GATEWAY_PORT || 3003;
    const host = process.env.HOST || 'localhost';
        
    // Listen on all interfaces (0.0.0.0) to allow external connections
    await app.listen({ port: port, host: '0.0.0.0' });
        
    const gatewayUrl = process.env.GATEWAY_URL || `http://${host}:${port}`;
    console.log(`🚪 Gateway Service running at ${gatewayUrl}`);
    console.log(`📊 Health check: ${gatewayUrl}/health`);
    console.log(`📚 API Documentation: ${gatewayUrl}/docs`);
    console.log(`🔐 Auth endpoints: ${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}/login`);
    console.log(`👥 User endpoints: ${process.env.USER_SERVICE_URL || 'http://localhost:3002'}`);
        
  } catch (err) {
    console.error('Failed to start gateway service:');
    console.error('Error details:', err);
    console.error('Stack trace:', err.stack);
    app.log.error('Failed to start gateway service:', err);
    process.exit(1);
  }
};

start();
