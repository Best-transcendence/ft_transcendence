import { createDatabase, closeDatabase } from './connection.js';

// Test users for auth service
// NOTE: createdAt and updatedAt are automatically handled by SQLite defaults
const users = [
  { email: 'yioffe@example.com', password: 'q' },
  { email: 'thuy-ngu@example.com', password: 'q' },
  { email: 'juan-pma@example.com', password: 'q' },
  { email: 'cbouvet@example.com', password: 'q' },
];

function main() {
  console.log('🌱 Starting auth service seed...');

  let db = null;
  try {
    db = createDatabase();

    // Check if any user already exists
    const existingUserCount = db.prepare('SELECT COUNT(*) as count FROM User').get();
    
    if (existingUserCount.count > 0) {
      console.log(`ℹ️ ${existingUserCount.count} users already exist — skipping seed.`);
      return;
    }

    // Insert users using prepared statements
    const insertUser = db.prepare('INSERT INTO User (email, password) VALUES (?, ?)');
    
    for (const user of users) {
      try {
        insertUser.run(user.email, user.password);
        console.log(`👤 Created user: ${user.email}`);
      } catch (error) {
        // Skip if user already exists (shouldn't happen due to check above)
        console.log(`⚠️ Skipped user ${user.email}: ${error.message}`);
      }
    }

    console.log('✅ Auth service seed completed successfully');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    // Do NOT exit with code 1 — so container doesn't crash
    process.exit(0);
  } finally {
    if (db) {
      closeDatabase(db);
    }
  }
}

main();

