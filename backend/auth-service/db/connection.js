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
  const dbUrl = process.env.AUTH_DATABASE_URL || 'file:./data/auth.db';
  
  // Extract path from Prisma-style URL format (file:./path) or use directly
  let dbPath;
  if (dbUrl.startsWith('file:')) {
    const path = dbUrl.replace('file:', '');
    // If relative path, resolve it
    if (path.startsWith('./') || path.startsWith('../')) {
      dbPath = join(process.cwd(), path);
    } else {
      dbPath = path;
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
  const db = new Database(dbPath);
  
  // Enable foreign keys (not needed for auth service, but good practice)
  db.pragma('foreign_keys = ON');
  
  // Initialize schema if tables don't exist
  initializeSchema(db);
  
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

