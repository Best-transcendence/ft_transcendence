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
await app.register(fastifyCors, {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',  // Frontend
    process.env.GATEWAY_URL || 'http://localhost:3003',  // Gateway
    process.env.AUTH_SERVICE_URL || 'http://localhost:3001',  // Auth service
    process.env.USER_SERVICE_URL || 'http://localhost:3002'   // User service
  ],
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
    // We clean the URL from the protocol to avoid issues with Swagger UI
    host: (process.env.WS_SERVICE_URL || 'http://localhost:4000').replace(/^https?:\/\//, ''),
    schemes: ['http'],
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