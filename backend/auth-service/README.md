# Auth Service

Authentication microservice for ft_transcendence - handles user login, registration, and JWT token management.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm

### Installation
```bash
cd backend/auth-service
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

The service will start on `http://localhost:3001`

## 📚 API Documentation

Visit `http://localhost:3001/docs` for interactive Swagger documentation.

## 🔑 API Endpoints

### Authentication

#### `POST /auth/login`
Authenticate user and return JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

#### `POST /auth/signup`
Register a new user account.

**Request:**
```json
{
  "name": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "johndoe",
  "email": "john@example.com"
}
```

### Health Check

#### `GET /health`
Check if the service is running.

**Response:**
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🗃️ Database Schema

The service uses SQLite with the following schema:

```sql
CREATE TABLE User (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);
```

## 🔧 Environment Variables

```bash
# Database (SQLite file path)
AUTH_DATABASE_URL="file:./data/auth.db"

# JWT
JWT_SECRET= fetched from Vault `vault-service`

# Service
AUTH_SERVICE_PORT=3001
HOST="localhost"
NODE_ENV="development"
```

## 🧪 Testing

### Test Users
The service comes with pre-seeded test users:
- `yioffe@example.com` / `q`
- `thuy-ngu@example.com` / `q`
- `juan-pma@example.com` / `q`
- `cbouvet@example.com` / `q`

### Example Test
```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "yioffe@example.com", "password": "q"}'

# Health check
curl http://localhost:3001/health
```

## 🏗️ Architecture

This service is part of a microservices architecture:
- **Auth Service**: Handles authentication and JWT tokens
- **User Service**: Handles user profiles and data (Port 3002)
- **Gateway Service**: Routes requests between services (Port 3003)

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run start` - Start production server
- `npm run seed` - Seed the database (creates DB and tables if needed)

## 🔒 Security Notes

- Passwords are currently stored in plain text (TODO: implement bcrypt)
- JWT tokens are signed with a shared secret
- CORS is configured for frontend communication
- Input validation is implemented for all endpoints
