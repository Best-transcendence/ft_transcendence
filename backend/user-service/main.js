import Fastify from 'fastify';
import dotenv from 'dotenv';
import prismaPlugin from './plugins/prisma.js';
import userRoutes from './routes/users.js';
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';

// Load environment variables from local .env file
dotenv.config();

// Create Fastify server instance with logging
const app = Fastify({ logger: true });

// Register Swagger for API documentation
await app.register(fastifySwagger, {
    swagger: {
        info: {
            title: 'User Service API',
            description: 'User management microservice for ft_transcendence - handles user profiles, friends, and statistics',
            version: '1.0.0',
        },
        host: `${process.env.HOST || 'localhost'}:${process.env.USER_SERVICE_PORT || 3002}`,
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
    staticCSP: true,
    transformSpecificationClone: true,
});

// Register JWT plugin for token validation (shared secret with auth-service)
await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "super-secret-pass",
});

// Register Prisma plugin to connect to user database
app.register(prismaPlugin);

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
}, async (request, reply) => {
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
        const host = process.env.HOST || 'localhost';
        
        await app.listen({ port: port, host: '0.0.0.0' });
        
        console.log(`👤 User Service running at http://${host}:${port}`);
        console.log(`📊 Health check: http://${host}:${port}/health`);
        console.log(`📚 API Documentation: http://${host}:${port}/docs`);
        console.log(`👥 User endpoints: http://${host}:${port}/users`);
        
    } catch (err) {
        console.error('Failed to start user service:');
        console.error('Error details:', err);
        console.error('Stack trace:', err.stack);
        app.log.error('Failed to start user service:', err);
        process.exit(1);
    }
};

start();
