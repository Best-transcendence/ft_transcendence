import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test users for auth service
// Note: createdAt and updatedAt are automatically handled by Prisma
const users = [
  { email: 'yioffe@example.com', password: 'q' },
  { email: 'thuy-ngu@example.com', password: 'q' },
  { email: 'juan-pma@example.com', password: 'q' },
  { email: 'cbouvet@example.com', password: 'q' },
];

async function main() {
  console.log('🌱 Seeding auth service database...');

  for (const user of users) {
    const result = await prisma.user.upsert({
      where: { email: user.email },
      update: {}, // Don't update if exists
      create: {
        email: user.email,
        password: user.password // TODO: Should be hashed in production
      },
    });
    console.log(`👤 Created/found user: ${result.email}`);
  }

  console.log('✅ Auth service seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
