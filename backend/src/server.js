import Fastify from 'fastify';
import dotenv from 'dotenv';
import prismaPlugin from './plugins/prisma.js';
import usersRoutes from './routes/users.js';
import rootRoute from './routes/root.js';
import authRoutes from './routes/auth.js'; // File where we check if the parameters passed are correct.
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';
import fastifyJwt from "@fastify/jwt"; // For Login.
// Load environment variables from root directory
dotenv.config({ path: '../.env' });

// basic logging setup
const app = Fastify({ logger: true });

// ____________ FRONT END CONNECTION TEST ______
await app.register(fastifyCors, {
  origin: process.env.FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT || 3000}`, // Frontend port from env
  credentials: true,
});

//_______________________________________________
// QUESTION: check why we need twice the swagger registration
await app.register(fastifySwagger, {
    swagger: {
        info: {
            title: 'Transcendence API',
            description: 'Auto-generated docs',
            version: '0.1.0',
        },
        host: `${process.env.HOST || 'localhost'}:${process.env.BACKEND_PORT || 3001}`,
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

// Register plugins and routes
app.register(prismaPlugin);
app.register(authRoutes, { prefix: '/auth' });
app.register(usersRoutes, { prefix: '/users' });
app.register(rootRoute);

// QUESTION: read more about async/await in this context
const start = async () => {
    try {
        await app.listen({ port: process.env.BACKEND_PORT || 3001 });
        console.log(`Server running at http://localhost:${process.env.BACKEND_PORT || 3001}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

//______________ Export datausers.

// Set up the Jwt to create a token for the front end export name and email.
await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "super-secret-pass",
});
//___________ get the current user login in the platform

start();
