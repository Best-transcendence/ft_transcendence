import Fastify from 'fastify';
import { WebSocketServer } from 'ws';
// import dotenv from 'dotenv';
import './env.js';
import { registerWebsocketHandlers } from './routes/websocket.js';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';

// Adding Env.
// dotenv.config();

// Create Fastify server instance with logging
const app = Fastify({ logger: true });

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

// Register Swagger for API documentation
await app.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'WebSocket Service API',
      description: 'WebSocket microservice for ft_transcendence - handles real-time connections, user presence, and game signaling',
      version: '1.0.0',
    },
    // Dynamic host will be set in transformSpecification
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'WebSocket', description: 'WebSocket connection and real-time features' },
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

const wss = new WebSocketServer({ server: app.server });

// Register WebSocket logic
registerWebsocketHandlers(wss, app);

// Health check endpoint
app.get('/health', {
  schema: {
    tags: ['Health'],
    summary: 'Service Health Check',
    description: 'Check if the WebSocket service is running and healthy',
    response: {
      200: {
        description: 'Service is healthy',
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          service: { type: 'string', example: 'ws-service' },
          timestamp: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00.000Z' }
        }
      }
    }
  }
}, async (_request, _reply) => {
  return {
    status: 'ok',
    service: 'ws-service',
    timestamp: new Date().toISOString()
  };
});

const start = async () => {
  try {
    const port = process.env.WS_PORT || 4000;
    const host = process.env.HOST || 'localhost';

    // Start Fastify server (this handles HTTP requests)
    await app.listen({ port: port, host: '0.0.0.0' });

    const wsServiceUrl = `ws://${host}:${port}`;
    const httpServiceUrl = `http://${host}:${port}`;
    console.log(`🔌 WS Service running at ${wsServiceUrl}`);
    console.log(`📊 Health check: ${httpServiceUrl}/health`);
    console.log(`📚 API Documentation: ${httpServiceUrl}/docs`);
    console.log(`🌐 WebSocket endpoint: ${wsServiceUrl}`);
  } catch (err) {
    console.error('Failed to start ws service:');
    console.error('Error details:', err);
    console.error('Stack trace:', err.stack);
    app.log.error('Failed to start ws service:', err);
    process.exit(1);
  }
};

start();
