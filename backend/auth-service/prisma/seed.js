import { PrismaClient } from '@prisma/client';
import Vault from 'node-vault';

const prisma = new PrismaClient();

// Vault client
const vault = Vault(
{
	endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
	token: process.env.VAULT_TOKEN,
});

// List of users to seed
const users = [
  'yioffe@example.com',
  'thuy-ngu@example.com',
  'juan-pma@example.com',
  'cbouvet@example.com',
];

async function main() {
  console.log('🌱 Starting auth service seed...');

  // Check if any user already exists
  const existingUserCount = await prisma.user.count();

  if (existingUserCount > 0) {
    console.log(`ℹ️ ${existingUserCount} users already exist — skipping seed.`);
    return;
  }

  // Read all passwords from Vault
  const vaultSecrets = await vault.read('secret/data/users');
  const passwords = vaultSecrets.data.data;

  for (const email of users) {
    const password = passwords[email]; // from Vault
    if (!password) continue;

    const result = await prisma.user.upsert({
      where: { email },
      update: {}, // Do not overwrite
      create: { email, password }, // password from Vault
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
