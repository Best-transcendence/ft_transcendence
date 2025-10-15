import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

// Plugin to integrate Prisma ORM with Fastify for user service
export default fp(async (fastify, _opts) => {
  const prisma = new PrismaClient();

  try {
    // Try connecting to the database
    await prisma.$connect();
    fastify.log.info('✅ Prisma connected successfully (user service)');
  } catch (err) {
    fastify.log.error(`❌ Failed to connect to database: ${err.message}`);
    throw err;
  }

  // Expose Prisma client via Fastify instance
  fastify.decorate('prisma', prisma);

  // Disconnect Prisma when the server shuts down
  fastify.addHook('onClose', async (app) => {
    await app.prisma.$disconnect();
  });
});
