import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

// Plugin to integrate Prisma ORM with Fastify
export default fp(async (fastify, _opts) => {
  // Create new Prisma client instance
  const prisma = new PrismaClient();
    
  // Connect to the database
  await prisma.$connect();

  // Decorate Fastify instance with Prisma client
  // This makes it available as fastify.prisma in all routes
  fastify.decorate('prisma', prisma);

  // Clean up database connection when server shuts down
  fastify.addHook('onClose', async (app) => {
    await app.prisma.$disconnect();
  });
});