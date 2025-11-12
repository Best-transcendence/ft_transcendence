/**
 * DATABASE PLUGIN - USER SERVICE
 * 
 * WHAT IS A FASTIFY PLUGIN?
 * A plugin is a way to add functionality to the Fastify web server.
 * This plugin makes the database connection available to all routes in the user service.
 * 
 * HOW IT WORKS:
 * 1. Creates a database connection when the server starts
 * 2. Tests the connection to make sure it works
 * 3. Makes the database available to all routes via fastify.db
 * 4. Closes the database connection when the server shuts down
 * 
 * WHY USE A PLUGIN?
 * - Centralized database management (one place to create/close connections)
 * - Automatic cleanup when server stops
 * - Database is available in all route handlers via fastify.db
 * 
 * NOTE: This is similar to the auth-service plugin, but connects to a different
 *       database file (user.db instead of auth.db) with different tables.
 */

// Import Fastify plugin helper (fp = fastify-plugin)
import fp from 'fastify-plugin';
// Import database connection functions
import { createDatabase, closeDatabase } from '../db/connection.js';

/**
 * DATABASE PLUGIN
 * 
 * This plugin integrates the SQLite database with the Fastify web server.
 * It runs automatically when the server starts.
 */
export default fp(async (fastify, _opts) => {
  // Step 1: Create the database connection
  // This also creates tables if they don't exist (UserProfile, _UserFriends, Match)
  const db = createDatabase();

  try {
    // Step 2: Test the database connection
    // We run a simple query (SELECT 1) to make sure the database is working
    // If this fails, the database connection is broken
    db.prepare('SELECT 1').get();
    fastify.log.info('✅ SQLite database connected successfully (user service)');
  } catch (err) {
    // If the test query fails, log the error and stop the server
    // This prevents the server from starting with a broken database
    fastify.log.error(`❌ Failed to connect to database: ${err.message}`);
    throw err;
  }

  // Step 3: Make the database available to all routes
  // fastify.decorate() adds a 'db' property to the fastify instance
  // Now any route can access the database via fastify.db or request.server.db
  fastify.decorate('db', db);

  // Step 4: Set up cleanup when server shuts down
  // This hook runs automatically when the server stops (e.g., Ctrl+C, Docker stop)
  // It ensures the database connection is properly closed
  fastify.addHook('onClose', async (app) => {
    closeDatabase(app.db);
  });
});

