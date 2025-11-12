/**
 * AUTH SERVICE DATABASE SCHEMA
 * 
 * This SQL file defines the structure (schema) of the authentication service database.
 * It creates all the tables needed to store user authentication data.
 * 
 * WHAT IS A DATABASE SCHEMA?
 * A schema is like a blueprint that defines:
 * - What tables exist (like "User")
 * - What columns each table has (like "id", "email", "password")
 * - What rules apply (like "email must be unique", "password cannot be empty")
 * 
 * This schema is executed automatically when the database is first created.
 * The "IF NOT EXISTS" clause means it's safe to run multiple times.
 */

-- ============================================================================
-- USER TABLE
-- ============================================================================
-- Purpose: Stores user authentication credentials (email and password)
-- 
-- This is the ONLY table in the auth service database.
-- It contains only the minimum data needed for login/signup:
-- - Email address (used to identify the user)
-- - Password (hashed using bcrypt for security)
-- - Timestamps (when account was created and last updated)
--
-- NOTE: User profile data (name, profile picture, bio) is stored in the
-- user-service database, not here. This separation keeps authentication
-- separate from user management.
--
-- ============================================================================

CREATE TABLE IF NOT EXISTS User (
  -- PRIMARY KEY: A unique identifier for each user
  -- AUTOINCREMENT: Automatically generates a new ID for each new user (1, 2, 3, ...)
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Email address - must be unique (no two users can have the same email)
  -- NOT NULL means this field is required (cannot be empty)
  email TEXT UNIQUE NOT NULL,
  
  -- Password - stored as a hash (encrypted) using bcrypt
  -- NOT NULL means this field is required
  -- The actual password is never stored in plain text for security
  password TEXT NOT NULL,
  
  -- Timestamp when the user account was created
  -- DEFAULT (datetime('now')) means it's automatically set to the current time
  createdAt TEXT DEFAULT (datetime('now')),
  
  -- Timestamp when the user account was last updated
  -- DEFAULT (datetime('now')) means it's automatically set to the current time
  updatedAt TEXT DEFAULT (datetime('now'))
);

