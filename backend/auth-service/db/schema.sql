-- Auth Service Database Schema
-- This is the authentication microservice database
-- Contains only authentication-related data

-- User table for authentication service
-- Contains only fields needed for login/signup
CREATE TABLE IF NOT EXISTS User (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

