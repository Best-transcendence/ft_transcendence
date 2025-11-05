-- User Service Database Schema
-- This is the user management microservice database
-- Contains user profiles, friends, and game-related data

-- UserProfile table for user service
-- Contains profile data, friends, and game statistics
CREATE TABLE IF NOT EXISTS UserProfile (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  authUserId INTEGER UNIQUE NOT NULL,  -- References auth-service user ID
  name TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,  -- Duplicated from auth-service for performance
  profilePicture TEXT DEFAULT '/assets/default-avatar.jpeg',
  bio TEXT DEFAULT 'Hi, I''m playing Arcade Clash',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Join table for many-to-many friends relationship
CREATE TABLE IF NOT EXISTS _UserFriends (
  userProfileId INTEGER NOT NULL,
  friendId INTEGER NOT NULL,
  PRIMARY KEY (userProfileId, friendId),
  FOREIGN KEY (userProfileId) REFERENCES UserProfile(id) ON DELETE CASCADE,
  FOREIGN KEY (friendId) REFERENCES UserProfile(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_userprofile_authUserId ON UserProfile(authUserId);
CREATE INDEX IF NOT EXISTS idx_userprofile_name ON UserProfile(name);
CREATE INDEX IF NOT EXISTS idx_userfriends_userProfileId ON _UserFriends(userProfileId);
CREATE INDEX IF NOT EXISTS idx_userfriends_friendId ON _UserFriends(friendId);

-- Match table
CREATE TABLE IF NOT EXISTS Match (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,  -- ONE_VS_ONE, TOURNAMENT_1V1, TOURNAMENT_INTERMEDIATE, TOURNAMENT_FINAL
  date TEXT DEFAULT (datetime('now')),
  player1Id INTEGER,  -- First player's user ID (UserProfile.id)
  player2Id INTEGER,  -- Second player's user ID (UserProfile.id)
  winnerId INTEGER,   -- Winner's user ID (null if draw)
  player1Score INTEGER NOT NULL,
  player2Score INTEGER NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (player1Id) REFERENCES UserProfile(id),
  FOREIGN KEY (player2Id) REFERENCES UserProfile(id),
  FOREIGN KEY (winnerId) REFERENCES UserProfile(id)
);

-- Create indexes for match queries
CREATE INDEX IF NOT EXISTS idx_match_player1Id ON Match(player1Id);
CREATE INDEX IF NOT EXISTS idx_match_player2Id ON Match(player2Id);
CREATE INDEX IF NOT EXISTS idx_match_winnerId ON Match(winnerId);
CREATE INDEX IF NOT EXISTS idx_match_date ON Match(date);

