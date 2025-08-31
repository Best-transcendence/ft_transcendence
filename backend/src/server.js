import Fastify from 'fastify';
import dotenv from 'dotenv';
import prismaPlugin from './plugins/prisma.js';
import usersRoutes from './routes/users.js';
import rootRoute from './routes/root.js';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';

dotenv.config();

// basic logging setup
const app = Fastify({ logger: true });

// QUESTION: check why we need twice the swagger registration
await app.register(fastifySwagger, {
    swagger: {
        info: {
            title: 'Transcendence API',
            description: 'Auto-generated docs',
            version: '0.1.0',
        },
        host: 'localhost:3001',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
    },
});

await app.register(fastifySwaggerUI, {
    routePrefix: '/api/docs',
    uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
    },
});

app.register(prismaPlugin);
app.register(usersRoutes, { prefix: '/users' });
app.register(rootRoute);

// QUESTION: read more about async/await in this context
const start = async () => {
    try {
        await app.listen({ port: process.env.PORT || 3001 });
        console.log(`Server running at http://localhost:${process.env.PORT || 3001}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
