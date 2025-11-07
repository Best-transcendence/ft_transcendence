import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Test users for auth service
// NOTE: createdAt and updatedAt are automatically handled by Prisma
// Passwords are in plaintext here for initial entry demonstration only - they do get hashed before reaching DB
const users = [
  { email: 'yioffe@example.com', password: 'q' },
  { email: 'thuy-ngu@example.com', password: 'q' },
  { email: 'juan-pma@example.com', password: 'q' },
  { email: 'cbouvet@example.com', password: 'q' },
];

async function main() {
  console.log('🌱 Starting auth service seed...');

  // Check if any user already exists
  const existingUserCount = await prisma.user.count();

  if (existingUserCount > 0) {
    console.log(`ℹ️ ${existingUserCount} users already exist — skipping seed.`);
    return;
  }

  for (const user of users) {
	const hashedPass = await bcrypt.hash(user.password, SALT_ROUNDS);

    const result = await prisma.user.upsert({
      where: { email: user.email },
      update: {}, // No update if user exists
      create: {
        email: user.email,
        password: hashedPass,
      },
    });
    console.log(`👤 Created user: ${result.email}`);
  }

  console.log('✅ Auth service seed completed successfully');
}

main()
  .catch((error) => {
    console.error('❌ Seed error:', error.message);
    // Do NOT exit with code 1 — so container doesn't crash
    process.exit(0);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
