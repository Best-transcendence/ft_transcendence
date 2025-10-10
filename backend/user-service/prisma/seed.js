import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test user profiles for user service
// These correspond to users created in auth-service
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
  console.log('🌱 Seeding user service database...');

  for (const profile of userProfiles) {
    const result = await prisma.userProfile.upsert({
      where: { authUserId: profile.authUserId },
      update: {}, // Don't update if exists
      create: {
        authUserId: profile.authUserId,
        name: profile.name,
        email: profile.email,
        profilePicture: profile.profilePicture,
        bio: profile.bio,
        friends: profile.friends || {}, //import profile.friends or empty object
        stats: profile.stats
      },
    });
    console.log(`👤 Created/found profile: ${result.name} (${result.email})`);
  }

  // Yulia's friends
  await prisma.userProfile.update(
    {
      where: { authUserId: 1 },
      data: { friends: { connect: [{ authUserId: 2 }, { authUserId: 3 }] } }
    });

  // Tina's friends
  await prisma.userProfile.update(
    {
      where: { authUserId: 2 },
      data: { friends: { connect: [{ authUserId: 1 }, { authUserId: 3}] } }
    });

  // Juan's friends
  await prisma.userProfile.update(
    {
      where: { authUserId: 3 },
      data: { friends: { connect: [{ authUserId: 1 }, {authUserId: 2}] } }
    });

  //Camille's friends
  await prisma.userProfile.update(
    {
      where: { authUserId: 4 },
      data: { friends: { connect: [{ authUserId: 1 }, { authUserId: 2 }, {authUserId: 3 } ] } }
    });

  const yulia = await prisma.userProfile.findUnique({ where: { authUserId: 1 } });
  const tina = await prisma.userProfile.findUnique({ where: { authUserId: 2 } });
  const juan = await prisma.userProfile.findUnique({ where: { authUserId: 3 } });
  //const camille = await prisma.userProfile.findUnique({ where: { authUserId: 4 } });

  const sampleMatches =
	[
	  {
	    type: 'Tournament Match',
	    player1Id: tina.id,
	    player2Id: yulia.id,
	    player1Score: 5,
	    player2Score: 3,
	    date: new Date('2025-10-01T15:45:00Z')
	  },
	  {
	    type: '1v1 Match',
	    player1Id: juan.id,
	    player2Id: tina.id,
	    player1Score: 2,
	    player2Score: 5,
	    date: new Date('2025-09-28T10:30:00Z')
	  },
	  {
	    type: '1v1 Match',
	    player1Id: yulia.id,
	    player2Id: juan.id,
	    player1Score: 0,
	    player2Score: 0,
	    date: new Date('2025-09-18T11:38:00Z')
	  },
	  {
	    type: 'AI Match',
	    date: new Date('2025-10-06T12:00:00Z'),
	    player1Id: tina.id,
	    player2Id: null,
	    player1Score: 7,
	    player2Score: 3,
	  },
	  {
	    type: '1v1 Match',
	    date: new Date('2025-10-06T13:00:00Z'),
	    player1Id: null,
	    player2Id: yulia.id,
	    player1Score: 4,
	    player2Score: 5,
	  }
	];

  for (const matchData of sampleMatches)
  		await prisma.match.create({ data: matchData });

  console.log('✅ User service seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
