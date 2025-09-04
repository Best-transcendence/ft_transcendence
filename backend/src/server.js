import Fastify from 'fastify';
import dotenv from 'dotenv';
import prismaPlugin from './plugins/prisma.js';
import usersRoutes from './routes/users.js';
import rootRoute from './routes/root.js';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';

dotenv.config();

// basic logging setup
const app = Fastify({ logger: true });

// ____________ FRONT END CONNECTION TEST ______
// TODO: remove this when not needed or change from hardcoding
await app.register(fastifyCors, {
  origin: "http://localhost:1234", // The frontend end point with fastify Cross-Origin Resource Sharing
  credentials: true,
});

import authRoutes from './routes/auth.js'; // File where we check if the parameters passed are corrct. 
app.register(authRoutes);

//_______________________________________________
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
