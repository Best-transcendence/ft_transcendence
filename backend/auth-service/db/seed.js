/**
 * DATABASE SEED FILE - AUTH SERVICE
 * 
 * WHAT IS A SEED FILE?
 * A seed file populates the database with initial/test data.
 * This is useful for:
 * - Development: Having test users to work with
 * - Testing: Having known data to test against
 * - Demos: Having sample data to show the application
 * 
 * HOW IT WORKS:
 * 1. Connects to the database
 * 2. Checks if any users already exist
 * 3. If the database is empty, inserts test users
 * 4. If users already exist, skips seeding (prevents duplicates)
 * 
 * SECURITY NOTE:
 * - Passwords are hashed using bcrypt before being stored
 * - The plaintext passwords shown here are only for development/testing
 * - In production, users would sign up through the normal registration process
 */

// Import database connection functions
import { createDatabase, closeDatabase } from './connection.js';
// Import bcrypt for password hashing
import bcrypt from 'bcrypt';

// Number of rounds for bcrypt hashing (higher = more secure but slower)
// 10 rounds is a good balance between security and performance
const SALT_ROUNDS = 10;

/**
 * TEST USERS DATA
 * 
 * These are sample users that will be created in the database if it's empty.
 * Each user has:
 * - email: Their email address (used for login)
 * - password: Hashed password (the actual password 'q' is hashed using bcrypt)
 * 
 * NOTE: createdAt and updatedAt are automatically handled by SQLite defaults
 * NOTE: Passwords are hashed here using bcrypt.hashSync() before being inserted
 *       The plaintext password 'q' is only for development/testing purposes
 */
const users = [
  { email: 'yioffe@example.com', password: bcrypt.hashSync('q', 10) },
  { email: 'thuy-ngu@example.com', password: bcrypt.hashSync('q', SALT_ROUNDS) },
  { email: 'juan-pma@example.com', password: bcrypt.hashSync('q', SALT_ROUNDS) },
  { email: 'cbouvet@example.com', password: bcrypt.hashSync('q', SALT_ROUNDS) },
];

/**
 * MAIN SEED FUNCTION
 * 
 * This function:
 * 1. Connects to the database
 * 2. Checks if users already exist (to avoid duplicates)
 * 3. If database is empty, inserts all test users
 * 4. Closes the database connection when done
 */
async function main() {
  console.log('🌱 Starting auth service seed...');
  let db = null;
  try {
    // Step 1: Create/connect to the database
    // This also creates the tables if they don't exist
    db = createDatabase();

    // Step 2: Check if any users already exist in the database
    // We use a prepared statement for security and performance
    // COUNT(*) counts all rows in the User table
    const existingUserCount = db.prepare('SELECT COUNT(*) as count FROM User').get();

    // Step 3: If users already exist, skip seeding
    // This prevents duplicate users if the seed script runs multiple times
    if (existingUserCount.count > 0) {
      console.log(`ℹ️ ${existingUserCount.count} users already exist — skipping seed.`);
      return;
    }

    // Step 4: Prepare the INSERT statement
    // Prepared statements are safer and faster than building SQL strings
    // The ? placeholders will be replaced with actual values when we call .run()
    const insertUser = db.prepare('INSERT INTO User (email, password) VALUES (?, ?)');

    // Step 5: Insert each test user into the database
    for (const user of users) {
      try {
        // Execute the INSERT statement with the user's email and hashed password
        // .run() executes the statement and returns information about the operation
        insertUser.run(user.email, user.password);
        console.log(`👤 Created user: ${user.email}`);
      } catch (error) {
        // If something goes wrong (e.g., duplicate email), log and continue
        // This shouldn't happen due to the check above, but it's good to handle errors
        console.log(`⚠️ Skipped user ${user.email}: ${error.message}`);
      }
    }

    console.log('✅ Auth service seed completed successfully');
  } catch (error) {
    // If a critical error occurs (e.g., database connection fails), log it
    console.error('❌ Seed error:', error.message);
    // Do NOT exit with code 1 — so container doesn't crash
    // Exit with 0 (success) even on error to allow the container to continue running
    process.exit(0);
  } finally {
    // Step 6: Always close the database connection, even if an error occurred
    // The 'finally' block always runs, ensuring we clean up resources
    if (db) {
      closeDatabase(db);
    }
  }
}

// Run the seed function
main();

