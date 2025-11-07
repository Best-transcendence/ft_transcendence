import fp from 'fastify-plugin';
import { createDatabase, closeDatabase } from '../db/connection.js';

// Plugin to integrate SQLite database with Fastify
export default fp(async (fastify, _opts) => {
  const db = createDatabase();

  try {
    // Test connection by running a simple query
    db.prepare('SELECT 1').get();
    fastify.log.info('✅ SQLite database connected successfully');
  } catch (err) {
    fastify.log.error(`❌ Failed to connect to database: ${err.message}`);
    throw err;
  }

  // Decorate Fastify instance with database connection
  fastify.decorate('db', db);

  // Clean up database connection when server shuts down
  fastify.addHook('onClose', async (app) => {
    closeDatabase(app.db);
  });
});

