import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

// Plugin to integrate Prisma ORM with Fastify
export default fp(async (fastify, _opts) => {
  const prisma = new PrismaClient();

  try {
    // Connect to the database
    await prisma.$connect();
    fastify.log.info('✅ Prisma connected successfully');
  } catch (err) {
    fastify.log.error(`❌ Failed to connect to database: ${err.message}`);
    throw err;
  }

  // Decorate Fastify instance with Prisma client
  fastify.decorate('prisma', prisma);

  // Clean up database connection when server shuts down
  fastify.addHook('onClose', async (app) => {
    await app.prisma.$disconnect();
  });
});
