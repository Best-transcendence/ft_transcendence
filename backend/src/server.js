import Fastify from 'fastify';
import dotenv from 'dotenv';
import prismaPlugin from './plugins/prisma.js';
import usersRoutes from './routes/users.js';
import rootRoute from './routes/root.js';

dotenv.config();

const app = Fastify({ logger: true });

app.register(prismaPlugin);
app.register(usersRoutes, { prefix: '/users' });
app.register(rootRoute);

const start = async () => {
    try {
        await app.listen({ port: process.env.PORT || 3000 });
        console.log(`Server running at http://localhost:${process.env.PORT || 3000}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
