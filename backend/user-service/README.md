# User Service

User management microservice for ft_transcendence - handles user profiles, friends, and game statistics.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm
- Auth Service running on port 3001

### Installation
```bash
cd backend/user-service
npm install
```

### Database Setup
```bash
# Seed the database (creates database and tables automatically)
npm run seed
```

### Start the Service
```bash
npm run dev
```

The service will start on `http://localhost:3002`

## 📚 API Documentation

Visit `http://localhost:3002/docs` for interactive Swagger documentation.

## 🔑 API Endpoints

### User Management

#### `GET /users`
Get all user profiles (public information only).

**Response:**
```json
[
  {
    "id": 1,
    "name": "Yulia",
    "email": "yioffe@example.com",
    "profilePicture": null,
    "bio": "Pong enthusiast and coding wizard!",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### `GET /users/me`
Get current user's complete profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "authUserId": 1,
    "name": "Yulia",
    "email": "yioffe@example.com",
    "profilePicture": null,
    "bio": "Pong enthusiast and coding wizard!",
    "matchHistory": {},
    "stats": {
      "totalMatches": 0,
      "wins": 0,
      "losses": 0,
      "winRate": 0
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Health Check

#### `GET /health`
Check if the service is running.

**Response:**
```json
{
  "status": "ok",
  "service": "user-service",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🗃️ Database Schema

The service uses SQLite with the following schema:

```sql
CREATE TABLE UserProfile (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  authUserId INTEGER UNIQUE NOT NULL,  -- References auth-service user ID
  name TEXT UNIQUE NOT NULL,           -- Duplicated from auth-service for performance
  email TEXT NOT NULL,                 -- Duplicated from auth-service for performance
  profilePicture TEXT DEFAULT '/assets/default-avatar.jpeg',
  bio TEXT DEFAULT 'Hi, I''m playing Arcade Clash',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Join table for many-to-many friends relationship
CREATE TABLE _UserFriends (
  userProfileId INTEGER NOT NULL,
  friendId INTEGER NOT NULL,
  PRIMARY KEY (userProfileId, friendId),
  FOREIGN KEY (userProfileId) REFERENCES UserProfile(id) ON DELETE CASCADE,
  FOREIGN KEY (friendId) REFERENCES UserProfile(id) ON DELETE CASCADE
);

-- Match table
CREATE TABLE Match (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  date TEXT DEFAULT (datetime('now')),
  player1Id INTEGER,
  player2Id INTEGER,
  winnerId INTEGER,
  player1Score INTEGER NOT NULL,
  player2Score INTEGER NOT NULL,
  FOREIGN KEY (player1Id) REFERENCES UserProfile(id),
  FOREIGN KEY (player2Id) REFERENCES UserProfile(id),
  FOREIGN KEY (winnerId) REFERENCES UserProfile(id)
);
```

## 🔧 Environment Variables

```bash
# Database (SQLite file path)
USER_DATABASE_URL="file:./data/user.db"

# JWT (shared with auth-service)
JWT_SECRET="your-jwt-secret"

# Service
USER_SERVICE_PORT=3002
HOST="localhost"
NODE_ENV="development"
```

## 🧪 Testing Guide

### Prerequisites
1. **Auth Service must be running** on port 3001
2. **User Service must be running** on port 3002
3. **Database must be seeded** with test data

### Step 1: Get JWT Token from Auth Service

```bash
# Login to get JWT token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "yioffe@example.com", "password": "q"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Yulia",
    "email": "yioffe@example.com"
  }
}
```

### Step 2: Test User Service Endpoints

#### Test Public Profiles (No Auth Required)
```bash
curl http://localhost:3002/users
```

#### Test My Profile (Auth Required)
```bash
# Replace YOUR_JWT_TOKEN with the token from step 1
curl -X GET http://localhost:3002/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Test Health Check
```bash
curl http://localhost:3002/health
```

### Step 3: Using Swagger UI (Recommended)

1. **Open Swagger Documentation:**
   ```
   http://localhost:3002/docs
   ```

2. **Get JWT Token:**
   - Go to `http://localhost:3001/docs`
   - Use `POST /auth/login` with test credentials
   - Copy the `token` from response

3. **Authorize in Swagger:**
   - Click the "Authorize" button (🔒)
   - Enter: `Bearer <your_jwt_token_with_no_quotes>`
   - Click "Authorize"

4. **Test Endpoints:**
   - Try `GET /users` (no auth needed)
   - Try `GET /users/me` (requires auth)

### Step 4: Using JavaScript/Fetch

```javascript
// Complete test example
async function testUserService() {
  try {
    // Step 1: Login to get token
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'yioffe@example.com',
        password: 'q'
      })
    });
    
    const { token } = await loginResponse.json();
    console.log('✅ Login successful, token:', token);
    
    // Step 2: Get public profiles
    const profilesResponse = await fetch('http://localhost:3002/users');
    const profiles = await profilesResponse.json();
    console.log('✅ Public profiles:', profiles);
    
    // Step 3: Get my profile
    const myProfileResponse = await fetch('http://localhost:3002/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const myProfile = await myProfileResponse.json();
    console.log('✅ My profile:', myProfile);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUserService();
```

### Test Users Available

The service comes with pre-seeded test profiles:
- **Yulia** (`yioffe@example.com`) - "Pong enthusiast and coding wizard!"
- **Tina** (`thuy-ngu@example.com`) - "Love competitive gaming and teamwork!"
- **Juan** (`juan-pma@example.com`) - "Strategic player always looking for a challenge!"
- **Camille** (`cbouvet@example.com`) - "Fast reflexes and quick thinking!"

## 🏗️ Architecture

This service is part of a microservices architecture:

```
┌─────────────────┐    JWT Token    ┌─────────────────┐
│   Auth Service  │ ──────────────► │  User Service   │
│     :3001       │                 │     :3002       │
└─────────────────┘                 └─────────────────┘
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   Auth Database │                 │   User Database │
│   (auth.db)     │                 │   (user.db)     │
└─────────────────┘                 └─────────────────┘
```

- **Auth Service**: Handles authentication and JWT tokens
- **User Service**: Handles user profiles and data
- **Shared JWT Secret**: Enables cross-service authentication
- **Separate Databases**: Each service owns its data

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run start` - Start production server
- `npm run seed` - Seed the database with test data (creates DB and tables if needed)

## 🔒 Security Notes

- JWT tokens are validated using shared secret with auth-service
- Public endpoints only expose safe user data
- Private endpoints require valid JWT authentication
- User data is duplicated from auth-service for performance
- Database connections are properly managed and cleaned up

## 🚨 Troubleshooting

### Common Issues

1. **"Unauthorized" Error:**
   - Check if auth-service is running on port 3001
   - Verify JWT token is valid and not expired
   - Ensure both services use the same JWT_SECRET

2. **"User profile not found" Error:**
   - Run `npm run seed` to create test profiles
   - Check if authUserId in token matches existing profile

3. **Database Connection Error:**
   - Run `npm run seed` to create database and tables
   - Check USER_DATABASE_URL in .env file

4. **Service Not Starting:**
   - Check if port 3002 is available
   - Verify all dependencies are installed
   - Check console logs for specific error messages
