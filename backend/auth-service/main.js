import Fastify from 'fastify';
import dotenv from 'dotenv';
import prismaPlugin from './plugins/prisma.js';
import authRoutes from './routes/auth.js';
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';

// Load environment variables from .env file
dotenv.config();

// Create Fastify server instance with logging
const app = Fastify({ logger: true });

// Register Swagger for API documentation
await app.register(fastifySwagger, {
    swagger: {
        info: {
            title: 'Auth Service API',
            description: 'Authentication microservice for ft_transcendence - handles user login, registration, and JWT token management',
            version: '1.0.0',
        },
        host: `${process.env.HOST || 'localhost'}:${process.env.AUTH_SERVICE_PORT || 3001}`,
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
    staticCSP: true,
    transformSpecificationClone: true,
});

// Register JWT plugin for token generation and verification
await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "super-secret-pass",
});

// Register Prisma plugin to connect to auth database
app.register(prismaPlugin);

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
}, async (request, reply) => {
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
        const host = process.env.HOST || 'localhost';
        
        await app.listen({ port: port, host: '0.0.0.0' });
        
        console.log(`🔐 Auth Service running at http://${host}:${port}`);
        console.log(`📊 Health check: http://${host}:${port}/health`);
        console.log(`📚 API Documentation: http://${host}:${port}/docs`);
        console.log(`🔑 Auth endpoints: http://${host}:${port}/auth/login`);
        
    } catch (err) {
        console.error('Failed to start auth service:');
        console.error('Error details:', err);
        console.error('Stack trace:', err.stack);
        app.log.error('Failed to start auth service:', err);
        process.exit(1);
    }
};

start();
