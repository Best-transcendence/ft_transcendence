import Fastify from 'fastify';
import './env.js';
import databasePlugin from './plugins/database.js';
import userRoutes from './routes/users.js';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';
import Vault from 'node-vault';

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
    schemes: ['https'],
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
    // Dynamically set host from request headers (remove port if present)
    const hostHeader = request?.headers?.host || process.env.LAN_IP || 'LAN_IP';
    const hostname = hostHeader.split(':')[0]; // Remove port if present
    swaggerObject.host = hostname;
    swaggerObject.schemes = ['https'];
    // Ensure basePath is set correctly
    if (!swaggerObject.basePath) {
      swaggerObject.basePath = '';
    }
    return swaggerObject;
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
    process.env.AUTH_SERVICE_URL
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

// Register JWT plugin for token validation (shared secret with auth-service)
// Register JWT plugin for token generation and verification
const vault = Vault(
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
await app.register(fastifyJwt, { secret: jwtSecret });

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
