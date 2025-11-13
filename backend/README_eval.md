# Backend Architecture - Evaluation Overview

## Purpose

The backend implements a **microservices architecture** using Fastify and SQLite, providing authentication, user management, API routing, and real-time communication capabilities.

## Architecture Structure

The backend consists of four main microservices:

```
Frontend → Gateway (Port 3003) → Auth Service (Port 3001)
                                → User Service (Port 3002)
         ↓
    WebSocket Service (Port 4000)
```

## Services Overview

### Auth Service (Port 3001)
- **Purpose**: User authentication, registration, JWT token generation
- **Database**: SQLite (`auth.db`)
- **Key Functions**:
  - User registration with email/password
  - User login with credential validation
  - JWT token generation and signing
  - Password hashing with bcrypt
  - User profile bootstrap (creates profile in User Service)

### User Service (Port 3002)
- **Purpose**: User profile management, game data, statistics
- **Database**: SQLite (`user.db`)
- **Key Functions**:
  - User profile CRUD operations
  - Friend relationships management
  - Match history tracking
  - Game statistics calculation
  - Public user listing

### Gateway Service (Port 3003)
- **Purpose**: Single entry point, request routing, authentication middleware
- **Key Functions**:
  - Routes `/auth/*` requests to Auth Service
  - Routes `/users/*` requests to User Service
  - JWT token validation for protected routes
  - Request/response logging with correlation IDs
  - CORS handling
  - API documentation (Swagger)

### WebSocket Service (Port 4000)
- **Purpose**: Real-time bidirectional communication
- **Key Functions**:
  - JWT-authenticated WebSocket connections
  - User presence tracking (online/offline)
  - Real-time user list broadcasting
  - Game room signaling
  - Multiple socket support per user

## Key Components

### Database Structure
- **Auth Service**: `User` table (id, email, name, password, timestamps)
- **User Service**: 
  - `UserProfile` table (id, authUserId, name, email, profilePicture, bio)
  - `_UserFriends` table (many-to-many relationship)
  - `Match` table (game history with scores and winners)

### Authentication Flow
1. User registers/logs in through Gateway → Auth Service
2. Auth Service validates credentials and generates JWT
3. JWT contains user ID and is signed with secret from Vault
4. Protected routes validate JWT before processing
5. User Service uses JWT to identify authenticated users

### Inter-Service Communication
- **Auth → User**: HTTP POST to `/users/bootstrap` after registration
- **Gateway → Services**: HTTP proxy with request forwarding
- **Frontend → WebSocket**: Direct WebSocket connection with JWT in query string
- **All Services → Vault**: Fetch JWT secret and other credentials

## Integration Points

- **Vault Integration**: All services fetch JWT_SECRET from Vault at startup
- **ELK Integration**: Structured logging sent to ELK stack for centralized monitoring
- **Frontend Integration**: Gateway provides single API endpoint, WebSocket provides real-time updates
- **Database**: Each service maintains its own SQLite database for data isolation

