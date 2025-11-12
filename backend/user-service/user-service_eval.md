# User Service - Evaluation Overview

## Purpose

The User Service manages user profiles, friend relationships, match history, and game statistics. It handles all user-related data separate from authentication credentials.

## Structure

```
user-service/
├── main.js           # Fastify server setup, plugins, routes
├── routes/
│   └── users.js      # User profile and data endpoints
├── db/
│   ├── connection.js # SQLite database connection
│   ├── schema.sql    # Database schema definition
│   └── seed.js       # Database seeding script
├── plugins/
│   └── database.js   # Database plugin registration
└── utils/
    └── logger.js      # Structured logging utility
```

## Key Functions

### User Profile Management
- **Get All Users** (`GET /users`):
  - Returns public user profiles (name, email, avatar, bio)
  - No authentication required
  - Excludes sensitive data

- **Get Current User** (`GET /users/me`):
  - Returns complete user profile with statistics
  - Requires JWT authentication
  - Includes match history and game stats

- **Bootstrap Profile** (`POST /users/bootstrap`):
  - Creates user profile after registration
  - Called by Auth Service
  - Idempotent operation (creates or updates)

### Friend Management
- Friend relationships stored in join table
- Many-to-many relationship support
- Friend list retrieval and management

### Game Statistics
- Match history tracking
- Win/loss statistics calculation
- Win rate computation
- Score tracking per match

## Main Components

### Database Schema
```sql
UserProfile (
  id INTEGER PRIMARY KEY,
  authUserId INTEGER UNIQUE,  -- Links to Auth Service
  name TEXT UNIQUE,
  email TEXT,
  profilePicture TEXT,
  bio TEXT,
  timestamps
)

_UserFriends (
  userProfileId INTEGER,
  friendId INTEGER,
  PRIMARY KEY (userProfileId, friendId)
)

Match (
  id INTEGER PRIMARY KEY,
  type TEXT,
  date TEXT,
  player1Id INTEGER,
  player2Id INTEGER,
  winnerId INTEGER,
  player1Score INTEGER,
  player2Score INTEGER
)
```

### Routes
- `GET /users` - Get all public user profiles
- `GET /users/me` - Get authenticated user's complete profile
- `POST /users/bootstrap` - Create/update profile (internal)
- `GET /health` - Service health check
- `GET /docs` - Swagger API documentation

### Plugins & Middleware
- **Fastify JWT**: Token validation (shared secret with Auth Service)
- **Fastify Swagger**: API documentation
- **Fastify CORS**: Cross-origin resource sharing
- **Database Plugin**: SQLite connection management
- **Vault Integration**: JWT secret retrieval

## Integration Points

- **Vault**: Fetches `JWT_SECRET` for token validation
- **Auth Service**: Receives bootstrap requests after user registration
- **Gateway**: Receives proxied requests from Gateway service
- **ELK**: Sends structured logs for monitoring

## Data Relationships

- **UserProfile ↔ Auth User**: One-to-one via `authUserId`
- **UserProfile ↔ Friends**: Many-to-many via `_UserFriends` join table
- **UserProfile ↔ Matches**: One-to-many (player1/player2 relationships)

