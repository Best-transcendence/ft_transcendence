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
    bio: 'Pong enthusiast and coding wizard!',
    matchHistory: {},
    stats: { totalMatches: 0, wins: 0, losses: 0, winRate: 0 },
  },
  {
    authUserId: 2,
    name: 'Tina',
    email: 'thuy-ngu@example.com',
    profilePicture: '/assets/default-avatar.jpeg',
    bio: 'Love competitive gaming and teamwork!',
    matchHistory: {},
    stats: { totalMatches: 0, wins: 0, losses: 0, winRate: 0 }
  },
  {
    authUserId: 3,
    name: 'Juan',
    email: 'juan-pma@example.com',
    profilePicture: '/assets/default-avatar.jpeg',
    bio: 'Strategic player always looking for a challenge!',
    matchHistory: {},
    stats: { totalMatches: 0, wins: 0, losses: 0, winRate: 0 }
  },
  {
    authUserId: 4,
    name: 'Camille',
    email: 'cbouvet@example.com',
    profilePicture: '/assets/default-avatar.jpeg',
    bio: 'Fast reflexes and quick thinking!',
    matchHistory: {},
    stats: { totalMatches: 0, wins: 0, losses: 0, winRate: 0 }
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
		friends: profile.friends || {},
        matchHistory: profile.matchHistory,
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

  console.log('✅ User service seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
