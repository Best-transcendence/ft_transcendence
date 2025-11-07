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
// Build origin array to support both localhost and LAN_IP with HTTP and HTTPS
const buildOrigins = () => {
  const origins = [];
  const lanIp = process.env.LAN_IP;
  const frontendPort = process.env.FRONTEND_PORT || 3000;
  const gatewayPort = process.env.GATEWAY_PORT || 3003;
  const authServicePort = process.env.AUTH_SERVICE_PORT || 3001;
  
  // Add localhost origins (HTTP and HTTPS)
  origins.push(`http://localhost:${frontendPort}`);
  origins.push(`https://localhost:${frontendPort}`);
  origins.push(`http://localhost:${gatewayPort}`);
  origins.push(`https://localhost:${gatewayPort}`);
  origins.push(`http://localhost:${authServicePort}`);
  origins.push(`https://localhost:${authServicePort}`);
  
  // Add LAN_IP origins if set (HTTP and HTTPS)
  if (lanIp) {
    origins.push(`http://${lanIp}:${frontendPort}`);
    origins.push(`https://${lanIp}:${frontendPort}`);
    origins.push(`http://${lanIp}:${gatewayPort}`);
    origins.push(`https://${lanIp}:${gatewayPort}`);
    origins.push(`http://${lanIp}:${authServicePort}`);
    origins.push(`https://${lanIp}:${authServicePort}`);
  }
  
  // Also add any explicit URLs from env if they differ
  if (process.env.FRONTEND_URL && !origins.includes(process.env.FRONTEND_URL)) {
    origins.push(process.env.FRONTEND_URL);
  }
  if (process.env.GATEWAY_URL && !origins.includes(process.env.GATEWAY_URL)) {
    origins.push(process.env.GATEWAY_URL);
  }
  if (process.env.AUTH_SERVICE_URL && !origins.includes(process.env.AUTH_SERVICE_URL)) {
    origins.push(process.env.AUTH_SERVICE_URL);
  }
  
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
