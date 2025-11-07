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
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database
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

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🔧 Environment Variables

```bash
# Database
AUTH_DATABASE_URL="file:./prisma/auth.db"

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
- `npm run seed` - Seed the database
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations

## 🔒 Security Notes

- Passwords are encrypted with `bcrypt`
- JWT tokens are signed with a shared secret located in Vault
- CORS is configured for frontend communication
- Input validation is implemented for all endpoints
