import Fastify from 'fastify';
//import dotenv from 'dotenv';
import './env.js';
import databasePlugin from './plugins/database.js';
import authRoutes from './routes/auth.js';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';
import Vault from 'node-vault';

// Load environment variables from local .env file
//dotenv.config();

// Create Fastify server instance with logging
// TODO (Yulia): change everywhere HTTP to HTTPS once it's working
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
    schemes: ['https'],
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
