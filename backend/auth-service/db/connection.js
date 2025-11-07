import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname as pathDirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);

// Get database path from environment or use default
// In Docker: /app/data/auth.db
// Locally: ./data/auth.db
const getDatabasePath = () => {
  const dbUrl = process.env.AUTH_DATABASE_URL;
  
  let dbPath;
  if (dbUrl) {
    // Support Prisma-style URL format (file:./path) for backward compatibility
    // or plain path format
    if (dbUrl.startsWith('file:')) {
      const path = dbUrl.replace('file:', '');
      // If relative path, resolve it
      if (path.startsWith('./') || path.startsWith('../')) {
        dbPath = join(process.cwd(), path);
      } else {
        dbPath = path;
      }
    } else {
      // Plain path format
      if (dbUrl.startsWith('./') || dbUrl.startsWith('../')) {
        dbPath = join(process.cwd(), dbUrl);
      } else {
        dbPath = dbUrl;
      }
    }
  } else {
    // Default to /app/data/auth.db in Docker, ./data/auth.db locally
    dbPath = process.env.NODE_ENV === 'production' 
      ? '/app/data/auth.db' 
      : join(process.cwd(), 'data', 'auth.db');
  }
  
  // Ensure directory exists
  const dbDir = pathDirname(dbPath);
  try {
    mkdirSync(dbDir, { recursive: true });
  } catch (_error) {
    // Directory might already exist, ignore error
  }
  
  return dbPath;
};

// Initialize database connection
export function createDatabase() {
  const dbPath = getDatabasePath();
  
  console.log(`📂 Connecting to database at: ${dbPath}`);
  
  // Ensure database is opened in read-write mode with full sync
  const db = new Database(dbPath, { 
    fileMustExist: false 
  });
  
  // Enable foreign keys (not needed for auth service, but good practice)
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
  db.pragma('synchronous = FULL'); // Ensure data is written to disk
  
  // Increase limits for storing large data
  db.pragma('max_page_count = 2147483646'); // Maximum pages
  db.pragma('page_size = 4096'); // 4KB pages
  
  // Set a reasonable cache size
  db.pragma('cache_size = -64000'); // 64MB cache
  
  // Initialize schema if tables don't exist
  initializeSchema(db);
  
  console.log('✅ Database connected and schema initialized');
  console.log(`🔧 Database pragmas - foreign_keys: ${db.pragma('foreign_keys', { simple: true })}, journal_mode: ${db.pragma('journal_mode', { simple: true })}`);
  
  return db;
}

// Initialize database schema from SQL file
function initializeSchema(db) {
  try {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

// Close database connection
export function closeDatabase(db) {
  if (db) {
    db.close();
  }
}

