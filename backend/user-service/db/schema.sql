/**
 * USER SERVICE DATABASE SCHEMA
 * 
 * This SQL file defines the structure (schema) of the user management service database.
 * It creates all the tables needed to store user profiles, friendships, and game match data.
 * 
 * WHAT IS A DATABASE SCHEMA?
 * A schema is like a blueprint that defines:
 * - What tables exist (UserProfile, _UserFriends, Match)
 * - What columns each table has
 * - How tables relate to each other (foreign keys)
 * - What rules apply (unique constraints, required fields)
 * 
 * This schema is executed automatically when the database is first created.
 * The "IF NOT EXISTS" clause means it's safe to run multiple times.
 * 
 * DATABASE STRUCTURE OVERVIEW:
 * 1. UserProfile - stores user profile information
 * 2. _UserFriends - stores friend relationships (many-to-many)
 * 3. Match - stores game match history
 */

-- ============================================================================
-- USERPROFILE TABLE
-- ============================================================================
-- Purpose: Stores user profile information (name, email, profile picture, bio)
-- 
-- This table is linked to the auth-service User table via authUserId.
-- When a user signs up in auth-service, a corresponding profile is created here.
--
-- NOTE: Email is duplicated here for performance (avoids cross-service queries)
-- but the source of truth for authentication is still in auth-service.
--
-- ============================================================================

CREATE TABLE IF NOT EXISTS UserProfile (
  -- PRIMARY KEY: A unique identifier for each user profile
  -- AUTOINCREMENT: Automatically generates a new ID for each new profile (1, 2, 3, ...)
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Links to the user ID in the auth-service database
  -- UNIQUE: Each auth-service user can only have one profile
  -- NOT NULL: This field is required (every profile must link to an auth user)
  authUserId INTEGER UNIQUE NOT NULL,  -- References auth-service user ID
  
  -- Username - must be unique across all users
  -- NOT NULL: Every user must have a username
  name TEXT UNIQUE NOT NULL,
  
  -- Email address - duplicated from auth-service for faster queries
  -- NOT NULL: Required field
  -- This avoids having to query auth-service every time we need a user's email
  email TEXT NOT NULL,  -- Duplicated from auth-service for performance
  
  -- Profile picture - stored as a file path or base64-encoded image
  -- DEFAULT: If not provided, uses the default avatar image
  profilePicture TEXT DEFAULT '/assets/default-avatar.jpeg',
  
  -- User biography/description
  -- DEFAULT: If not provided, uses a default message
  bio TEXT DEFAULT 'Hi, I''m playing Arcade Clash',
  
  -- Timestamp when the profile was created
  -- DEFAULT: Automatically set to current time
  createdAt TEXT DEFAULT (datetime('now')),
  
  -- Timestamp when the profile was last updated
  -- DEFAULT: Automatically set to current time
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- _USERFRIENDS TABLE (JOIN TABLE)
-- ============================================================================
-- Purpose: Stores friend relationships between users (many-to-many relationship)
-- 
-- WHAT IS A MANY-TO-MANY RELATIONSHIP?
-- - One user can have many friends
-- - One user can be friends with many other users
-- - This requires a "join table" to store all the relationships
--
-- HOW IT WORKS:
-- - userProfileId: The user who added the friend
-- - friendId: The user who was added as a friend
-- - Both together form a unique pair (PRIMARY KEY)
-- - If user 1 adds user 2 as a friend, there's a row: (1, 2)
-- - If user 2 also adds user 1, there's another row: (2, 1)
--
-- FOREIGN KEYS:
-- - ON DELETE CASCADE: If a user is deleted, all their friend relationships are deleted too
--
-- ============================================================================

CREATE TABLE IF NOT EXISTS _UserFriends (
  -- The user who has this friend in their friends list
  userProfileId INTEGER NOT NULL,
  
  -- The user who is the friend
  friendId INTEGER NOT NULL,
  
  -- PRIMARY KEY on both columns means the combination must be unique
  -- This prevents duplicate friend relationships (user 1 can't add user 2 twice)
  PRIMARY KEY (userProfileId, friendId),
  
  -- FOREIGN KEY: Ensures userProfileId references a valid UserProfile
  -- ON DELETE CASCADE: If a user is deleted, delete all their friend relationships
  FOREIGN KEY (userProfileId) REFERENCES UserProfile(id) ON DELETE CASCADE,
  
  -- FOREIGN KEY: Ensures friendId references a valid UserProfile
  -- ON DELETE CASCADE: If a friend is deleted, remove them from all friends lists
  FOREIGN KEY (friendId) REFERENCES UserProfile(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR USERPROFILE TABLE
-- ============================================================================
-- Purpose: Speed up database queries
-- 
-- WHAT IS AN INDEX?
-- An index is like a book's index - it helps the database find data quickly.
-- Without indexes, the database has to scan every row (slow).
-- With indexes, the database can jump directly to the right rows (fast).
--
-- We create indexes on columns that are frequently searched:
-- - authUserId: Used to find a profile by auth-service user ID
-- - name: Used to search for users by username
--
-- ============================================================================

-- Index on authUserId - speeds up queries like "find profile for auth user 123"
CREATE INDEX IF NOT EXISTS idx_userprofile_authUserId ON UserProfile(authUserId);

-- Index on name - speeds up queries like "find user named 'john'"
CREATE INDEX IF NOT EXISTS idx_userprofile_name ON UserProfile(name);

-- ============================================================================
-- INDEXES FOR _USERFRIENDS TABLE
-- ============================================================================
-- Purpose: Speed up friend relationship queries
--
-- These indexes help with queries like:
-- - "Get all friends of user 1" (searches by userProfileId)
-- - "Get all users who have user 2 as a friend" (searches by friendId)
--
-- ============================================================================

-- Index on userProfileId - speeds up "get all friends of user X"
CREATE INDEX IF NOT EXISTS idx_userfriends_userProfileId ON _UserFriends(userProfileId);

-- Index on friendId - speeds up "get all users who have user X as a friend"
CREATE INDEX IF NOT EXISTS idx_userfriends_friendId ON _UserFriends(friendId);

-- ============================================================================
-- MATCH TABLE
-- ============================================================================
-- Purpose: Stores game match history (who played, scores, winners, dates)
-- 
-- This table records every game match that has been played:
-- - Regular 1v1 matches
-- - Tournament matches (preliminary, intermediate, final rounds)
--
-- HOW IT WORKS:
-- - player1Id and player2Id: The two players who competed
-- - player1Score and player2Score: Their final scores
-- - winnerId: Who won (null if it was a draw)
-- - type: What kind of match it was (ONE_VS_ONE, TOURNAMENT_1V1, etc.)
-- - date: When the match was played
--
-- FOREIGN KEYS:
-- - All player IDs reference UserProfile to ensure data integrity
-- - If a user is deleted, their matches can optionally be kept or deleted
--
-- ============================================================================

CREATE TABLE IF NOT EXISTS Match (
  -- PRIMARY KEY: A unique identifier for each match
  -- AUTOINCREMENT: Automatically generates a new ID for each match (1, 2, 3, ...)
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Type of match: ONE_VS_ONE, TOURNAMENT_1V1, TOURNAMENT_INTERMEDIATE, TOURNAMENT_FINAL
  -- NOT NULL: Every match must have a type
  type TEXT NOT NULL,  -- ONE_VS_ONE, TOURNAMENT_1V1, TOURNAMENT_INTERMEDIATE, TOURNAMENT_FINAL
  
  -- When the match was played
  -- DEFAULT: Automatically set to current time if not provided
  date TEXT DEFAULT (datetime('now')),
  
  -- First player's profile ID (references UserProfile.id)
  -- Can be null if match data is incomplete
  player1Id INTEGER,  -- First player's user ID (UserProfile.id)
  
  -- Second player's profile ID (references UserProfile.id)
  -- Can be null if match data is incomplete
  player2Id INTEGER,  -- Second player's user ID (UserProfile.id)
  
  -- Winner's profile ID (references UserProfile.id)
  -- NULL means the match was a draw (tie)
  winnerId INTEGER,   -- Winner's user ID (null if draw)
  
  -- First player's final score
  -- NOT NULL: Score must be recorded
  player1Score INTEGER NOT NULL,
  
  -- Second player's final score
  -- NOT NULL: Score must be recorded
  player2Score INTEGER NOT NULL,
  
  -- Timestamp when the match record was created
  -- DEFAULT: Automatically set to current time
  createdAt TEXT DEFAULT (datetime('now')),
  
  -- FOREIGN KEY: Ensures player1Id references a valid UserProfile
  FOREIGN KEY (player1Id) REFERENCES UserProfile(id),
  
  -- FOREIGN KEY: Ensures player2Id references a valid UserProfile
  FOREIGN KEY (player2Id) REFERENCES UserProfile(id),
  
  -- FOREIGN KEY: Ensures winnerId references a valid UserProfile (if not null)
  FOREIGN KEY (winnerId) REFERENCES UserProfile(id)
);

-- ============================================================================
-- INDEXES FOR MATCH TABLE
-- ============================================================================
-- Purpose: Speed up match history queries
--
-- These indexes help with queries like:
-- - "Get all matches for user 1" (searches by player1Id or player2Id)
-- - "Get all matches won by user 2" (searches by winnerId)
-- - "Get recent matches" (searches by date, sorted)
--
-- ============================================================================

-- Index on player1Id - speeds up "get all matches where user X was player 1"
CREATE INDEX IF NOT EXISTS idx_match_player1Id ON Match(player1Id);

-- Index on player2Id - speeds up "get all matches where user X was player 2"
CREATE INDEX IF NOT EXISTS idx_match_player2Id ON Match(player2Id);

-- Index on winnerId - speeds up "get all matches won by user X"
CREATE INDEX IF NOT EXISTS idx_match_winnerId ON Match(winnerId);

-- Index on date - speeds up "get recent matches" or "get matches from date range"
CREATE INDEX IF NOT EXISTS idx_match_date ON Match(date);

