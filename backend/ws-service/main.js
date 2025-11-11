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
// Build origin array to support both localhost and LAN_IP with HTTP and HTTPS
const buildOrigins = () => {
  const origins = [];
  const lanIp = process.env.LAN_IP;
  const frontendPort = process.env.FRONTEND_PORT || 3000;
  const gatewayPort = process.env.GATEWAY_PORT || 3003;
  const authServicePort = process.env.AUTH_SERVICE_PORT || 3001;
  const userServicePort = process.env.USER_SERVICE_PORT || 3002;
  
  // Add localhost origins (HTTP and HTTPS)
  origins.push(`http://localhost:${frontendPort}`);
  origins.push(`https://localhost:${frontendPort}`);
  origins.push(`http://localhost:${gatewayPort}`);
  origins.push(`https://localhost:${gatewayPort}`);
  origins.push(`http://localhost:${authServicePort}`);
  origins.push(`https://localhost:${authServicePort}`);
  origins.push(`http://localhost:${userServicePort}`);
  origins.push(`https://localhost:${userServicePort}`);
  
  // Add LAN_IP origins if set (HTTP and HTTPS)
  if (lanIp) {
    origins.push(`http://${lanIp}:${frontendPort}`);
    origins.push(`https://${lanIp}:${frontendPort}`);
    origins.push(`http://${lanIp}:${gatewayPort}`);
    origins.push(`https://${lanIp}:${gatewayPort}`);
    origins.push(`http://${lanIp}:${authServicePort}`);
    origins.push(`https://${lanIp}:${authServicePort}`);
    origins.push(`http://${lanIp}:${userServicePort}`);
    origins.push(`https://${lanIp}:${userServicePort}`);
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
  if (process.env.USER_SERVICE_URL && !origins.includes(process.env.USER_SERVICE_URL)) {
    origins.push(process.env.USER_SERVICE_URL);
  }
  
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
