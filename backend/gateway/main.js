import Fastify from 'fastify';
// import dotenv from 'dotenv';
import './env.js';
import fastifyJwt from '@fastify/jwt';
import fastifyHttpProxy from '@fastify/http-proxy';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';
import Vault from 'node-vault';

// Load environment variables from centralized .env file
// dotenv.config();

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
  },
});

// Register CORS plugin
// Build origin array to support only HTTPS LAN_IP (no localhost, no ports)
const buildOrigins = () => {
  const origins = [];
  const lanIp = process.env.LAN_IP;

  // Helper function to normalize URL: ensure HTTPS and remove port
  const normalizeUrl = (url) => {
    if (!url) return null;
    // Remove protocol if present
    let normalized = url.replace(/^https?:\/\//, '');
    // Remove port if present
    normalized = normalized.replace(/:\d+$/, '');
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    // Return as HTTPS URL
    return `https://${normalized}`;
  };

  // Add LAN_IP origin if set (HTTPS only, no port)
  if (lanIp) {
    const normalizedLanIp = lanIp.replace(/:\d+$/, '').replace(/\/$/, '');
    origins.push(`https://${normalizedLanIp}`);
  }

  // Add explicit URLs from env if they differ (normalize to HTTPS without port)
  const envUrls = [
    process.env.FRONTEND_URL,
    process.env.GATEWAY_URL,
    process.env.AUTH_SERVICE_URL,
    process.env.USER_SERVICE_URL
  ];

  envUrls.forEach(url => {
    if (url) {
      const normalized = normalizeUrl(url);
      if (normalized && !origins.includes(normalized)) {
        origins.push(normalized);
      }
    }
  });

  return origins;
};

await app.register(fastifyCors, {
  origin: buildOrigins(),
  credentials: true
});

// NO_VAULT - removing Vault query:
// Register JWT plugin for token generation and verification
/* const vault = Vault(
  {
    endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
    token: process.env.VAULT_TOKEN
  });

let jwtSecret;
try
{
  const secret = await vault.read('secret/data/jwt');
  jwtSecret = secret.data.data.JWT_SECRET;
}
catch (err)
{
  console.error('Failed to read JWT secret from Vault:', err);
  process.exit(1);
}
await app.register(fastifyJwt, { secret: jwtSecret }); */

//NO_VAULT: retrieving JWT from env
await app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET
});

// Paths to exempt from jwt protection:
const publicPaths = ['/auth', '/health', '/docs', '/favicon.ico'];

// Global JWT protection for all routes except auth
app.addHook('onRequest', async (request, reply) =>
{
  if (publicPaths.some(path => request.raw.url.startsWith(path)))
    return;
  try
  {
    await request.jwtVerify();
  }
  catch
  {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Register Swagger for API documentation
await app.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'Gateway API',
      description: `
                API Gateway for ft_transcendence microservices - routes requests to individual services.

                **Service Documentation:**
                - [Auth Service](${process.env.AUTH_SERVICE_URL ? process.env.AUTH_SERVICE_URL.replace(/:\d+$/, '').replace(/\/$/, '') : `https://${process.env.LAN_IP || 'LAN_IP'}`}/auth-docs/) - Authentication and JWT handling
                - [User Service](${process.env.USER_SERVICE_URL ? process.env.USER_SERVICE_URL.replace(/:\d+$/, '').replace(/\/$/, '') : `https://${process.env.LAN_IP || 'LAN_IP'}`}/user-docs/) - User profiles and management

                **Note:** This gateway proxies requests to the individual microservices.
                For detailed API schemas and examples, refer to the individual service documentation above.
            `,
      version: '1.0.0',
    },
    // Dynamic host will be set in transformSpecification
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      {
        name: 'Authentication',
        description: `Auth service endpoints (login, signup) - [See detailed docs](${process.env.AUTH_SERVICE_URL ? process.env.AUTH_SERVICE_URL.replace(/:\d+$/, '').replace(/\/$/, '') : `https://${process.env.LAN_IP || 'LAN_IP'}`}/auth-docs/)`
      },
      {
        name: 'User Management',
        description: `User service endpoints (profiles, data) - [See detailed docs](${process.env.USER_SERVICE_URL ? process.env.USER_SERVICE_URL.replace(/:\d+$/, '').replace(/\/$/, '') : `https://${process.env.LAN_IP || 'LAN_IP'}`}/user-docs/)`
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
  transformSpecification: (swaggerObject, request, _reply) => {
    // Dynamically set host from request headers (remove port if present)
    const hostHeader = request?.headers?.host || process.env.LAN_IP || 'LAN_IP';
    const hostname = hostHeader.split(':')[0]; // Remove port if present
    swaggerObject.host = hostname;
    swaggerObject.schemes = ['https'];

    // Set basePath for reverse proxy (WAF routes /api/ to gateway)
    // Check X-Forwarded-Prefix header or Referer to determine base path
    const forwardedPrefix = request?.headers?.['x-forwarded-prefix'];
    const referer = request?.headers?.referer || '';
    let basePath = '';

    if (forwardedPrefix) {
      basePath = forwardedPrefix;
    } else if (referer.includes('/api/')) {
      basePath = '/api';
    }

    swaggerObject.basePath = basePath;

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
              authService: { type: 'string', example: process.env.AUTH_SERVICE_URL || `https://${process.env.LAN_IP || 'LAN_IP'}/auth-docs/` },
              userService: { type: 'string', example: process.env.USER_SERVICE_URL || `https://${process.env.LAN_IP || 'LAN_IP'}/user-docs/` }
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
      authService: process.env.AUTH_SERVICE_URL || `https://${process.env.LAN_IP || 'LAN_IP'}/auth-docs/`,
      userService: process.env.USER_SERVICE_URL || `https://${process.env.LAN_IP || 'LAN_IP'}/user-docs/`
    }
  };
});

// Auth service routes (no JWT validation needed)
app.register(async function (fastify) {
  fastify.addHook('preHandler', logRequest);

  fastify.register(fastifyHttpProxy, {
    upstream: process.env.AUTH_SERVICE_URL || `http://auth_service:${process.env.AUTH_SERVICE_PORT || 3001}`,
    prefix: '/auth',
    rewritePrefix: '/auth',
    // Only handle specific methods to avoid generic route generation
    methods: ['POST'],
    // Add Swagger metadata for documentation
    schema: {
      tags: ['Authentication'],
      summary: 'Auth Service Endpoints',
      description: `Authentication endpoints - [See detailed docs](${process.env.AUTH_SERVICE_URL ? process.env.AUTH_SERVICE_URL.replace(/:\d+$/, '').replace(/\/$/, '') : `https://${process.env.LAN_IP || 'LAN_IP'}`}/auth-docs/)`
    }
  });
});

// User service routes (JWT validation required)
app.register(async function (fastify) {
  fastify.addHook('preHandler', logRequest);

  fastify.register(fastifyHttpProxy, {
    upstream: process.env.USER_SERVICE_URL || `http://user_service:${process.env.USER_SERVICE_PORT || 3002}`,
    prefix: '/users',
    rewritePrefix: '/users',
    // Only handle specific methods to avoid generic route generation
    methods: ['GET', 'POST'],
    // Add Swagger metadata for documentation
    schema: {
      tags: ['User Management'],
      summary: 'User Service Endpoints',
      description: `User management endpoints - [See detailed docs](${process.env.USER_SERVICE_URL ? process.env.USER_SERVICE_URL.replace(/:\d+$/, '').replace(/\/$/, '') : `https://${process.env.LAN_IP || 'LAN_IP'}`}/user-docs/)`
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

    // Listen on all interfaces (0.0.0.0) to allow external connections
    await app.listen({ port: port, host: '0.0.0.0' });

    const gatewayUrl = process.env.GATEWAY_URL || `https://${process.env.LAN_IP || 'LAN_IP'}/api`;
    console.log(`🚪 Gateway Service running at ${gatewayUrl}`);
    console.log(`📊 Health check: ${gatewayUrl}/health`);
    console.log(`📚 API Documentation: ${gatewayUrl}/docs`);
    const authServiceUrl = process.env.AUTH_SERVICE_URL ? process.env.AUTH_SERVICE_URL.replace(/:\d+$/, '').replace(/\/$/, '') : `https://${process.env.LAN_IP || 'LAN_IP'}/auth-docs/`;
    const userServiceUrl = process.env.USER_SERVICE_URL ? process.env.USER_SERVICE_URL.replace(/:\d+$/, '').replace(/\/$/, '') : `https://${process.env.LAN_IP || 'LAN_IP'}/user-docs/`;
    console.log(`🔐 Auth endpoints: ${authServiceUrl}/login`);
    console.log(`👥 User endpoints: ${userServiceUrl}`);

  } catch (err) {
    console.error('Failed to start gateway service:');
    console.error('Error details:', err);
    console.error('Stack trace:', err.stack);
    app.log.error('Failed to start gateway service:', err);
    process.exit(1);
  }
};

start();
