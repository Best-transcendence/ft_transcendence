import { createDatabase, closeDatabase } from './connection.js';

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

// Friend relationships (userProfileId -> friendId)
const friendRelationships = [
  // Yulia (1) is friends with Tina (2) and Juan (3)
  { userProfileId: 1, friendId: 2 },
  { userProfileId: 1, friendId: 3 },
  // Tina (2) is friends with Yulia (1) and Juan (3)
  { userProfileId: 2, friendId: 1 },
  { userProfileId: 2, friendId: 3 },
  // Juan (3) is friends with Yulia (1) and Tina (2)
  { userProfileId: 3, friendId: 1 },
  { userProfileId: 3, friendId: 2 },
  // Camille (4) is friends with Yulia (1), Tina (2), and Juan (3)
  { userProfileId: 4, friendId: 1 },
  { userProfileId: 4, friendId: 2 },
  { userProfileId: 4, friendId: 3 },
];

function main() {
  console.log('🌱 Starting user service seed...');

  let db = null;
  try {
    db = createDatabase();

    // Check if the database already contains profiles
    const existingProfiles = db.prepare('SELECT COUNT(*) as count FROM UserProfile').get();
    if (existingProfiles.count > 0) {
      console.log(`ℹ️ ${existingProfiles.count} profiles already exist — skipping seed.`);
      return;
    }

    // Insert user profiles
    const insertProfile = db.prepare(
      'INSERT INTO UserProfile (authUserId, name, email, profilePicture, bio) VALUES (?, ?, ?, ?, ?)'
    );
    const profileIds = {};

    for (const profile of userProfiles) {
      try {
        const result = insertProfile.run(
          profile.authUserId,
          profile.name,
          profile.email,
          profile.profilePicture,
          profile.bio
        );
        profileIds[profile.authUserId] = Number(result.lastInsertRowid);
        console.log(`👤 Created profile: ${profile.name} (${profile.email})`);
      } catch (error) {
        console.log(`⚠️ Skipped profile ${profile.name}: ${error.message}`);
      }
    }

    // Create friend relationships
    const insertFriend = db.prepare(
      'INSERT INTO _UserFriends (userProfileId, friendId) VALUES (?, ?)'
    );

    for (const rel of friendRelationships) {
      try {
        const userProfileId = profileIds[rel.userProfileId];
        const friendId = profileIds[rel.friendId];
        if (userProfileId && friendId) {
          insertFriend.run(userProfileId, friendId);
        }
      } catch (error) {
        // Skip if relationship already exists or other error
        console.log(`⚠️ Skipped friend relationship: ${error.message}`);
      }
    }

    // Retrieve user IDs for match creation
    const getProfileId = db.prepare('SELECT id FROM UserProfile WHERE authUserId = ?');
    const yulia = getProfileId.get(1);
    const tina = getProfileId.get(2);
    const juan = getProfileId.get(3);
    const camille = getProfileId.get(4);

    // Sample match data with varied outcomes
    const sampleMatches = [
      {
        type: 'TOURNAMENT_INTERMEDIATE',
        player1Id: tina.id,
        player2Id: yulia.id,
        player1Score: 5,
        player2Score: 3,
        winnerId: tina.id,
        date: new Date('2025-10-01T15:45:00Z').toISOString()
      },
      {
        type: 'ONE_VS_ONE',
        player1Id: juan.id,
        player2Id: tina.id,
        player1Score: 2,
        player2Score: 5,
        winnerId: tina.id,
        date: new Date('2025-09-28T10:30:00Z').toISOString()
      },
      {
        type: 'ONE_VS_ONE',
        player1Id: yulia.id,
        player2Id: juan.id,
        player1Score: 3,
        player2Score: 3,
        winnerId: null,
        date: new Date('2025-09-18T11:38:00Z').toISOString()
      },
      {
        type: 'TOURNAMENT_FINAL',
        player1Id: camille.id,
        player2Id: yulia.id,
        player1Score: 5,
        player2Score: 2,
        winnerId: camille.id,
        date: new Date('2025-10-06T12:00:00Z').toISOString()
      },
      {
        type: 'ONE_VS_ONE',
        player1Id: juan.id,
        player2Id: camille.id,
        player1Score: 5,
        player2Score: 4,
        winnerId: juan.id,
        date: new Date('2025-10-07T14:20:00Z').toISOString()
      },
      {
        type: 'TOURNAMENT_INTERMEDIATE',
        player1Id: yulia.id,
        player2Id: tina.id,
        player1Score: 5,
        player2Score: 1,
        winnerId: yulia.id,
        date: new Date('2025-10-08T16:30:00Z').toISOString()
      },
      {
        type: 'ONE_VS_ONE',
        player1Id: camille.id,
        player2Id: juan.id,
        player1Score: 2,
        player2Score: 5,
        winnerId: juan.id,
        date: new Date('2025-10-09T10:15:00Z').toISOString()
      }
    ];

    const insertMatch = db.prepare(
      'INSERT INTO Match (type, date, player1Id, player2Id, player1Score, player2Score, winnerId) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    for (const matchData of sampleMatches) {
      try {
        insertMatch.run(
          matchData.type,
          matchData.date,
          matchData.player1Id,
          matchData.player2Id,
          matchData.player1Score,
          matchData.player2Score,
          matchData.winnerId
        );
        console.log(`🎮 Created match: ${matchData.type} (${matchData.player1Score}-${matchData.player2Score})`);
      } catch (error) {
        console.log(`⚠️ Skipped match: ${error.message}`);
      }
    }

    console.log(`✅ User service seed completed successfully (${sampleMatches.length} matches created)`);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    // Prevent container from crashing
    process.exit(0);
  } finally {
    if (db) {
      closeDatabase(db);
    }
  }
}

main();

