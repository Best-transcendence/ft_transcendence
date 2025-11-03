import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample user profiles (linked to auth service users)
const userProfiles = [
  {
    authUserId: 1,
    name: 'Yulia',
    email: 'yioffe@example.com',
    profilePicture: '/assets/default-avatar.jpeg',
    bio: 'Pong enthusiast and coding wizard!'
  },
  {
    authUserId: 2,
    name: 'Tina',
    email: 'thuy-ngu@example.com',
    profilePicture: '/assets/default-avatar.jpeg',
    bio: 'Love competitive gaming and teamwork!'
  },
  {
    authUserId: 3,
    name: 'Juan',
    email: 'juan-pma@example.com',
    profilePicture: '/assets/default-avatar.jpeg',
    bio: 'Strategic player always looking for a challenge!'
  },
  {
    authUserId: 4,
    name: 'Camille',
    email: 'cbouvet@example.com',
    profilePicture: '/assets/camille-avatar.jpeg',
    bio: 'Roses are red - Violets are blue - unexpected \'{\' on line 32'
  },
];

async function main() {
  console.log('🌱 Starting user service seed...');

  // Check if the database already contains profiles
  const existingProfiles = await prisma.userProfile.count();
  if (existingProfiles > 0) {
    console.log(`ℹ️ ${existingProfiles} profiles already exist — skipping seed.`);
    return;
  }

  // Create user profiles
  for (const profile of userProfiles) {
    const result = await prisma.userProfile.upsert({
      where: { authUserId: profile.authUserId },
      update: {},
      create: {
        authUserId: profile.authUserId,
        name: profile.name,
        email: profile.email,
        profilePicture: profile.profilePicture,
        bio: profile.bio,
        friends: profile.friends || {},
      },
    });
    console.log(`👤 Created profile: ${result.name} (${result.email})`);
  }

  // Create friend relationships
  await prisma.userProfile.update({
    where: { authUserId: 1 },
    data: { friends: { connect: [{ authUserId: 2 }, { authUserId: 3 }] } }
  });

  await prisma.userProfile.update({
    where: { authUserId: 2 },
    data: { friends: { connect: [{ authUserId: 1 }, { authUserId: 3 }] } }
  });

  await prisma.userProfile.update({
    where: { authUserId: 3 },
    data: { friends: { connect: [{ authUserId: 1 }, { authUserId: 2 }] } }
  });

  await prisma.userProfile.update({
    where: { authUserId: 4 },
    data: { friends: { connect: [{ authUserId: 1 }, { authUserId: 2 }, { authUserId: 3 }] } }
  });

  // Retrieve user IDs for match creation
  const yulia = await prisma.userProfile.findUnique({ where: { authUserId: 1 } });
  const tina = await prisma.userProfile.findUnique({ where: { authUserId: 2 } });
  const juan = await prisma.userProfile.findUnique({ where: { authUserId: 3 } });
  const camille = await prisma.userProfile.findUnique({ where: { authUserId: 4 } });

  // Sample match data with varied outcomes
  const sampleMatches = [
    {
      type: 'TOURNAMENT_INTERMEDIATE',
      player1Id: tina.id,
      player2Id: yulia.id,
      player1Score: 5,
      player2Score: 3,
      winnerId: tina.id,  // Tina wins
      date: new Date('2025-10-01T15:45:00Z')
    },
    {
      type: 'ONE_VS_ONE',
      player1Id: juan.id,
      player2Id: tina.id,
      player1Score: 2,
      player2Score: 5,
      winnerId: tina.id,  // Tina wins
      date: new Date('2025-09-28T10:30:00Z')
    },
    {
      type: 'ONE_VS_ONE',
      player1Id: yulia.id,
      player2Id: juan.id,
      player1Score: 3,
      player2Score: 3,
      winnerId: null,  // Draw
      date: new Date('2025-09-18T11:38:00Z')
    },
    {
      type: 'TOURNAMENT_FINAL',
      player1Id: camille.id,
      player2Id: yulia.id,
      player1Score: 5,
      player2Score: 2,
      winnerId: camille.id,  // Camille wins
      date: new Date('2025-10-06T12:00:00Z')
    },
    {
      type: 'ONE_VS_ONE',
      player1Id: juan.id,
      player2Id: camille.id,
      player1Score: 5,
      player2Score: 4,
      winnerId: juan.id,  // Juan wins
      date: new Date('2025-10-07T14:20:00Z')
    },
    {
      type: 'TOURNAMENT_INTERMEDIATE',
      player1Id: yulia.id,
      player2Id: tina.id,
      player1Score: 5,
      player2Score: 1,
      winnerId: yulia.id,  // Yulia wins
      date: new Date('2025-10-08T16:30:00Z')
    },
    {
      type: 'ONE_VS_ONE',
      player1Id: camille.id,
      player2Id: juan.id,
      player1Score: 2,
      player2Score: 5,
      winnerId: juan.id,  // Juan wins
      date: new Date('2025-10-09T10:15:00Z')
    }
  ];

  for (const matchData of sampleMatches) {
    const match = await prisma.match.create({ data: matchData });
    console.log(`🎮 Created match: ${match.type} (${match.player1Score}-${match.player2Score})`);
  }

  console.log(`✅ User service seed completed successfully (${sampleMatches.length} matches created)`);
}

main()
  .catch((error) => {
    console.error('❌ Seed error:', error.message);
    // Prevent container from crashing
    process.exit(0);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
