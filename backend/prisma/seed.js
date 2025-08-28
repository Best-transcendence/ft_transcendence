import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
    { email: 'yioffe@example.com', name: 'Yulia' },
    { email: 'thuy-ngu@example.com', name: 'Tina' },
    { email: 'juan-pma@example.com', name: 'Juan' },
    { email: 'cbouvet@example.com', name: 'Camille' },
];

async function main() {
    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }

    console.log('✅ Seed complete');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
