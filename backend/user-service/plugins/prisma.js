import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Plugin to integrate Prisma ORM with Fastify for user service
export default fp(async (fastify, _opts) => {
  try {
    // Initialize database schema if needed
    console.log('🔄 Initializing database...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Database initialized successfully');
    
    // Check if database needs seeding
    console.log('🌱 Checking if database needs seeding...');
    const prisma = new PrismaClient();
    
    try {
      const userCount = await prisma.userProfile.count();
      
      if (userCount === 0) {
        console.log('🌱 Database is empty, running seed script...');
        execSync('npm run seed', { stdio: 'inherit' });
        console.log('✅ Database seeded successfully');
      } else {
        console.log(`ℹ️ Database already has ${userCount} users, skipping seed`);
      }
    } catch (seedError) {
      console.log('⚠️ Seeding error:', seedError.message);
      // Continue anyway - app can still work without seed data
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.log('⚠️ Database initialization warning:', error.message);
    // Continue anyway - database might already exist
  }

  // Create new Prisma client instance for user service
  const prisma = new PrismaClient();
    
  // Connect to the user service database
  await prisma.$connect();

  // Decorate Fastify instance with Prisma client
  // This makes it available as fastify.prisma in all routes
  fastify.decorate('prisma', prisma);

  // Clean up database connection when server shuts down
  fastify.addHook('onClose', async (app) => {
    await app.prisma.$disconnect();
  });
});
