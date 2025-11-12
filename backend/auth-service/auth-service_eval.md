# Auth Service - Evaluation Overview

## Purpose

The Auth Service handles user authentication, registration, and JWT token management. It is responsible for securely storing user credentials and issuing authentication tokens.

## Structure

```
auth-service/
├── main.js           # Fastify server setup, plugins, routes
├── routes/
│   └── auth.js       # Login and signup endpoints
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

### Authentication
- **User Registration** (`POST /auth/signup`):
  - Validates input (email format, password match)
  - Checks for duplicate email/username
  - Hashes password with bcrypt
  - Creates user in auth database
  - Bootstraps user profile in User Service
  - Returns user data (no token on signup)

- **User Login** (`POST /auth/login`):
  - Validates email and password
  - Verifies credentials against database
  - Generates JWT token with user ID
  - Returns token and user information

### Token Management
- JWT tokens signed with secret from Vault
- Tokens contain user ID for identification
- Shared secret enables cross-service validation

## Main Components

### Database Schema
```sql
User (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- bcrypt hashed
  createdAt TEXT,
  updatedAt TEXT
)
```

### Routes
- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `GET /health` - Service health check
- `GET /docs` - Swagger API documentation

### Plugins & Middleware
- **Fastify JWT**: Token generation and verification
- **Fastify Swagger**: API documentation
- **Fastify CORS**: Cross-origin resource sharing
- **Database Plugin**: SQLite connection management
- **Vault Integration**: JWT secret retrieval

## Integration Points

- **Vault**: Fetches `JWT_SECRET` at startup for token signing
- **User Service**: Calls `/users/bootstrap` endpoint after registration
- **Gateway**: Receives proxied requests from Gateway service
- **ELK**: Sends structured logs for monitoring

## Security Features

- Password hashing with bcrypt
- JWT tokens for stateless authentication
- Input validation and sanitization
- Generic error messages to prevent user enumeration
- CORS configuration for allowed origins

