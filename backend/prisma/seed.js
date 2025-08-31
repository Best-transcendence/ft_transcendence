import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
    { email: 'yioffe@example.com', name: 'Yulia', password: 'q' },
    { email: 'thuy-ngu@example.com', name: 'Tina', password: 'q' },
    { email: 'juan-pma@example.com', name: 'Juan', password: 'q' },
    { email: 'cbouvet@example.com', name: 'Camille', password: 'q' },
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
