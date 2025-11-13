/**
 * DATABASE SEED FILE - USER SERVICE
 * 
 * WHAT IS A SEED FILE?
 * A seed file populates the database with initial/test data.
 * This is useful for:
 * - Development: Having test users, friends, and matches to work with
 * - Testing: Having known data to test against
 * - Demos: Having sample data to show the application
 * 
 * HOW IT WORKS:
 * 1. Connects to the database
 * 2. Checks if any profiles already exist
 * 3. If the database is empty, inserts:
 *    - User profiles (linked to auth-service users)
 *    - Friend relationships between users
 *    - Sample game match history
 * 4. If data already exists, skips seeding (prevents duplicates)
 * 
 * NOTE: This seed file assumes the auth-service seed has already run,
 *       because it references auth-service user IDs (authUserId: 1, 2, 3, 4)
 */

// Import database connection functions
import { createDatabase, closeDatabase } from './connection.js';

/**
 * SAMPLE USER PROFILES DATA
 * 
 * These are sample user profiles that will be created in the database if it's empty.
 * Each profile has:
 * - authUserId: Links to the user ID in the auth-service database (must match auth-service seed)
 * - name: Username (must be unique)
 * - email: Email address (duplicated from auth-service for performance)
 * - profilePicture: Path to profile picture image
 * - bio: User's biography/description
 * 
 * NOTE: The authUserId values (1, 2, 3, 4) must match the user IDs created
 *       in the auth-service seed file. This creates the link between the two databases.
 */
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

/**
 * FRIEND RELATIONSHIPS DATA
 * 
 * These define which users are friends with each other.
 * 
 * HOW FRIEND RELATIONSHIPS WORK:
 * - userProfileId: The user who has this friend in their friends list
 * - friendId: The user who is the friend
 * - Friendships can be one-way or mutual
 * 
 * NOTE: The userProfileId and friendId values here refer to authUserId (1, 2, 3, 4)
 *       These will be converted to actual UserProfile.id values after profiles are created.
 * 
 * EXAMPLE:
 * - { userProfileId: 1, friendId: 2 } means "User 1 (Yulia) has User 2 (Tina) as a friend"
 * - { userProfileId: 2, friendId: 1 } means "User 2 (Tina) has User 1 (Yulia) as a friend"
 * - Together, these create a mutual friendship
 */
const friendRelationships = [
  // Yulia (authUserId 1) is friends with Tina (2) and Juan (3)
  { userProfileId: 1, friendId: 2 },
  { userProfileId: 1, friendId: 3 },
  // Tina (authUserId 2) is friends with Yulia (1) and Juan (3)
  { userProfileId: 2, friendId: 1 },
  { userProfileId: 2, friendId: 3 },
  // Juan (authUserId 3) is friends with Yulia (1) and Tina (2)
  { userProfileId: 3, friendId: 1 },
  { userProfileId: 3, friendId: 2 },
  // Camille (authUserId 4) is friends with Yulia (1), Tina (2), and Juan (3)
  { userProfileId: 4, friendId: 1 },
  { userProfileId: 4, friendId: 2 },
  { userProfileId: 4, friendId: 3 },
];

/**
 * MAIN SEED FUNCTION
 * 
 * This function:
 * 1. Connects to the database
 * 2. Checks if profiles already exist (to avoid duplicates)
 * 3. If database is empty:
 *    a. Creates user profiles
 *    b. Creates friend relationships
 *    c. Creates sample match history
 * 4. Closes the database connection when done
 */
function main() {
  console.log('🌱 Starting user service seed...');

  let db = null;
  try {
    // Step 1: Create/connect to the database
    // This also creates the tables if they don't exist
    db = createDatabase();

    // Step 2: Check if any profiles already exist in the database
    // We use a prepared statement for security and performance
    // COUNT(*) counts all rows in the UserProfile table
    const existingProfiles = db.prepare('SELECT COUNT(*) as count FROM UserProfile').get();
    
    // Step 3: If profiles already exist, skip seeding
    // This prevents duplicate data if the seed script runs multiple times
    if (existingProfiles.count > 0) {
      console.log(`ℹ️ ${existingProfiles.count} profiles already exist — skipping seed.`);
      return;
    }

    // ========================================================================
    // STEP 4: INSERT USER PROFILES
    // ========================================================================
    
    // Prepare the INSERT statement for user profiles
    // Prepared statements are safer and faster than building SQL strings
    // The ? placeholders will be replaced with actual values when we call .run()
    const insertProfile = db.prepare(
      'INSERT INTO UserProfile (authUserId, name, email, profilePicture, bio) VALUES (?, ?, ?, ?, ?)'
    );
    
    // Store a mapping of authUserId -> UserProfile.id
    // This is needed later when creating friend relationships and matches
    // because those use UserProfile.id, not authUserId
    const profileIds = {};

    // Insert each user profile into the database
    for (const profile of userProfiles) {
      try {
        // Execute the INSERT statement with the profile data
        // .run() executes the statement and returns information about the operation
        const result = insertProfile.run(
          profile.authUserId,      // Links to auth-service user
          profile.name,             // Username
          profile.email,            // Email address
          profile.profilePicture,   // Profile picture path
          profile.bio               // Biography
        );
        
        // Store the newly created UserProfile.id
        // result.lastInsertRowid is the ID of the row we just inserted
        profileIds[profile.authUserId] = Number(result.lastInsertRowid);
        console.log(`👤 Created profile: ${profile.name} (${profile.email})`);
      } catch (error) {
        // If something goes wrong (e.g., duplicate name), log and continue
        console.log(`⚠️ Skipped profile ${profile.name}: ${error.message}`);
      }
    }

    // ========================================================================
    // STEP 5: CREATE FRIEND RELATIONSHIPS
    // ========================================================================
    
    // Prepare the INSERT statement for friend relationships
    const insertFriend = db.prepare(
      'INSERT INTO _UserFriends (userProfileId, friendId) VALUES (?, ?)'
    );

    // Create each friend relationship
    for (const rel of friendRelationships) {
      try {
        // Convert authUserId to UserProfile.id using our mapping
        // rel.userProfileId and rel.friendId are authUserIds (1, 2, 3, 4)
        // We need to convert them to actual UserProfile.id values
        const userProfileId = profileIds[rel.userProfileId];
        const friendId = profileIds[rel.friendId];
        
        // Only create the relationship if both profiles exist
        if (userProfileId && friendId) {
          // Insert the friend relationship into the _UserFriends table
          insertFriend.run(userProfileId, friendId);
        }
      } catch (error) {
        // Skip if relationship already exists or other error
        console.log(`⚠️ Skipped friend relationship: ${error.message}`);
      }
    }

    // ========================================================================
    // STEP 6: CREATE SAMPLE MATCH HISTORY
    // ========================================================================
    
    // First, retrieve the UserProfile.id values for each user
    // We need these to create match records (matches use UserProfile.id, not authUserId)
    const getProfileId = db.prepare('SELECT id FROM UserProfile WHERE authUserId = ?');
    const yulia = getProfileId.get(1);    // Get Yulia's UserProfile.id
    const tina = getProfileId.get(2);      // Get Tina's UserProfile.id
    const juan = getProfileId.get(3);      // Get Juan's UserProfile.id
    const camille = getProfileId.get(4);   // Get Camille's UserProfile.id

    /**
     * SAMPLE MATCH DATA
     * 
     * These are example game matches that will be created in the database.
     * Each match has:
     * - type: What kind of match (ONE_VS_ONE, TOURNAMENT_INTERMEDIATE, TOURNAMENT_FINAL)
     * - player1Id and player2Id: The two players (using UserProfile.id)
     * - player1Score and player2Score: Their final scores
     * - winnerId: Who won (null if it was a draw)
     * - date: When the match was played
     * 
     * This creates a realistic match history for testing and demos.
     */
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

    // Prepare the INSERT statement for match records
    const insertMatch = db.prepare(
      'INSERT INTO Match (type, date, player1Id, player2Id, player1Score, player2Score, winnerId) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    // Insert each match into the database
    for (const matchData of sampleMatches) {
      try {
        // Execute the INSERT statement with the match data
        insertMatch.run(
          matchData.type,           // Match type (ONE_VS_ONE, TOURNAMENT_INTERMEDIATE, etc.)
          matchData.date,            // When the match was played
          matchData.player1Id,       // First player's UserProfile.id
          matchData.player2Id,       // Second player's UserProfile.id
          matchData.player1Score,    // First player's score
          matchData.player2Score,   // Second player's score
          matchData.winnerId         // Winner's UserProfile.id (null if draw)
        );
        console.log(`🎮 Created match: ${matchData.type} (${matchData.player1Score}-${matchData.player2Score})`);
      } catch (error) {
        // If something goes wrong (e.g., invalid player ID), log and continue
        console.log(`⚠️ Skipped match: ${error.message}`);
      }
    }

    console.log(`✅ User service seed completed successfully (${sampleMatches.length} matches created)`);
  } catch (error) {
    // If a critical error occurs (e.g., database connection fails), log it
    console.error('❌ Seed error:', error.message);
    // Do NOT exit with code 1 — so container doesn't crash
    // Exit with 0 (success) even on error to allow the container to continue running
    process.exit(0);
  } finally {
    // Step 7: Always close the database connection, even if an error occurred
    // The 'finally' block always runs, ensuring we clean up resources
    if (db) {
      closeDatabase(db);
    }
  }
}

// Run the seed function
main();

