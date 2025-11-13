/**
 * DATABASE CONNECTION MODULE - USER SERVICE
 * 
 * This file handles all database connection logic for the user management service.
 * It uses SQLite (a file-based database) to store user profiles, friendships, and game match data.
 * 
 * What this file does:
 * 1. Determines where the database file should be located
 * 2. Creates a connection to the database
 * 3. Sets up database settings (like enabling foreign keys, setting cache size)
 * 4. Creates the database tables if they don't exist yet (UserProfile, Friends, Matches)
 * 5. Provides functions to open and close database connections
 * 
 * NOTE: This service stores more complex data than the auth service:
 * - User profiles (name, email, profile picture, bio)
 * - Friend relationships (many-to-many relationships between users)
 * - Game match history (scores, winners, dates)
 */

// Import the SQLite database library (better-sqlite3 is a fast, synchronous SQLite library)
import Database from 'better-sqlite3';
// Import file system functions to read SQL files and create directories
import { readFileSync, mkdirSync } from 'fs';
// Import path utilities to work with file paths
import { join, dirname as pathDirname } from 'path';
// Import URL utilities to convert file URLs to paths
import { fileURLToPath } from 'url';

// Get the current file's directory path (needed to find the schema.sql file)
const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);

/**
 * FUNCTION: getDatabasePath()
 * 
 * Purpose: Determines where the database file should be stored on disk
 * 
 * How it works:
 * - First checks if an environment variable (USER_DATABASE_URL) is set
 * - If set, uses that path (supports different formats like "file:./path" or just "./path")
 * - If not set, uses a default path:
 *   - In production/Docker: /app/data/user.db
 *   - In development: ./data/user.db (relative to project root)
 * 
 * Returns: The full path to where the database file should be located
 */
const getDatabasePath = () => {
  // Check if a custom database path was provided via environment variable
  const dbUrl = process.env.USER_DATABASE_URL;
  
  let dbPath;
  if (dbUrl) {
    // Environment variable was set - parse it to get the actual path
    // Support Prisma-style URL format (file:./path) for backward compatibility
    // or plain path format
    if (dbUrl.startsWith('file:')) {
      // Remove "file:" prefix to get the actual path
      const path = dbUrl.replace('file:', '');
      // If relative path (starts with ./ or ../), convert to absolute path
      if (path.startsWith('./') || path.startsWith('../')) {
        dbPath = join(process.cwd(), path);
      } else {
        // Already an absolute path, use as-is
        dbPath = path;
      }
    } else {
      // Plain path format (not starting with "file:")
      if (dbUrl.startsWith('./') || dbUrl.startsWith('../')) {
        // Relative path - convert to absolute
        dbPath = join(process.cwd(), dbUrl);
      } else {
        // Absolute path - use as-is
        dbPath = dbUrl;
      }
    }
  } else {
    // No environment variable set - use default paths based on environment
    // Default to /app/data/user.db in Docker, ./data/user.db locally
    dbPath = process.env.NODE_ENV === 'production' 
      ? '/app/data/user.db'  // Production path (inside Docker container)
      : join(process.cwd(), 'data', 'user.db');  // Development path (local machine)
  }
  
  // Ensure the directory where the database file will be stored actually exists
  // This prevents errors if the directory doesn't exist yet
  const dbDir = pathDirname(dbPath);
  try {
    mkdirSync(dbDir, { recursive: true });  // Create directory if it doesn't exist
  } catch (_error) {
    // Directory might already exist, ignore error (that's fine)
  }
  
  return dbPath;
};

/**
 * FUNCTION: createDatabase()
 * 
 * Purpose: Creates and configures a connection to the SQLite database
 * 
 * This is the main function that:
 * 1. Gets the database file path
 * 2. Opens a connection to the database (creates the file if it doesn't exist)
 * 3. Configures database settings (pragmas) for optimal performance and reliability
 * 4. Creates the database tables (schema) if they don't exist
 * 5. Returns the database connection object
 * 
 * NOTE: Foreign keys are especially important here because this database has:
 * - UserProfile table that references auth-service user IDs
 * - Friend relationships that reference UserProfile IDs
 * - Match records that reference UserProfile IDs
 * Foreign keys ensure these relationships stay valid (can't delete a user if matches reference them)
 * 
 * Returns: A Database connection object that can be used to run SQL queries
 */
export function createDatabase() {
  // Step 1: Determine where the database file should be located
  const dbPath = getDatabasePath();
  
  console.log(`📂 Connecting to database at: ${dbPath}`);
  
  // Step 2: Open/create the database file
  // fileMustExist: false means "create the file if it doesn't exist"
  // This allows the database to be created automatically on first run
  const db = new Database(dbPath, { 
    fileMustExist: false 
  });
  
  // Step 3: Configure database settings (called "pragmas" in SQLite)
  // These settings optimize the database for our use case
  
  // Enable foreign keys - CRITICAL for this service!
  // Ensures data integrity when tables reference each other
  // For example: prevents deleting a user if they have matches or friends
  db.pragma('foreign_keys = ON');
  
  // Write-Ahead Logging (WAL) mode - allows multiple readers and one writer simultaneously
  // This improves performance when multiple parts of the app access the database
  db.pragma('journal_mode = WAL');
  
  // FULL synchronous mode - ensures data is completely written to disk before continuing
  // This prevents data loss if the system crashes, but is slightly slower
  db.pragma('synchronous = FULL');
  
  // Increase database size limits for storing large data (like base64-encoded profile pictures)
  db.pragma('max_page_count = 2147483646'); // Maximum number of pages (essentially unlimited)
  db.pragma('page_size = 4096'); // Each page is 4KB (standard size)
  
  // Set cache size to 64MB - keeps frequently accessed data in memory for faster queries
  // Negative value means kilobytes, so -64000 = 64MB
  // This is important because we frequently query user profiles, friends, and match history
  db.pragma('cache_size = -64000');
  
  // Step 4: Create database tables if they don't exist yet
  // This reads the schema.sql file and executes it to create:
  // - UserProfile table (user information)
  // - _UserFriends table (friend relationships)
  // - Match table (game history)
  initializeSchema(db);
  
  console.log('✅ Database connected and schema initialized');
  console.log(`🔧 Database pragmas - foreign_keys: ${db.pragma('foreign_keys', { simple: true })}, journal_mode: ${db.pragma('journal_mode', { simple: true })}`);
  
  // Step 5: Return the database connection so other parts of the app can use it
  return db;
}

/**
 * FUNCTION: initializeSchema(db)
 * 
 * Purpose: Creates the database tables by reading and executing the schema.sql file
 * 
 * How it works:
 * 1. Finds the schema.sql file in the same directory as this file
 * 2. Reads the SQL commands from that file
 * 3. Executes those SQL commands to create tables
 * 
 * The schema.sql file contains CREATE TABLE statements that define:
 * - UserProfile table: stores user profile information (name, email, profile picture, bio)
 * - _UserFriends table: stores friend relationships between users (many-to-many)
 * - Match table: stores game match history (players, scores, winners, dates)
 * - Indexes: speed up queries on frequently searched columns
 * 
 * Note: SQLite's "CREATE TABLE IF NOT EXISTS" means this is safe to run multiple times
 * - If tables already exist, nothing happens
 * - If tables don't exist, they get created
 * 
 * @param {Database} db - The database connection object
 */
function initializeSchema(db) {
  try {
    // Find the schema.sql file in the same directory as this connection.js file
    const schemaPath = join(__dirname, 'schema.sql');
    
    // Read the entire SQL file as text
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Execute all SQL commands in the file
    // This creates all the tables, indexes, and constraints defined in schema.sql
    db.exec(schema);
  } catch (error) {
    // If something goes wrong (file not found, invalid SQL, etc.), log and throw error
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

/**
 * FUNCTION: closeDatabase(db)
 * 
 * Purpose: Properly closes the database connection when the application shuts down
 * 
 * Why this is important:
 * - SQLite databases should be closed gracefully to ensure all data is written
 * - Prevents file locks that could prevent the database from being accessed later
 * - Frees up system resources
 * 
 * This function is called automatically when the server shuts down (via the plugin)
 * 
 * @param {Database} db - The database connection object to close
 */
export function closeDatabase(db) {
  if (db) {
    db.close();  // Close the connection and release the database file
  }
}

