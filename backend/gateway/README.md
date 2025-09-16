# Gateway Service

The Gateway Service acts as the single entry point for the ft_transcendence microservices architecture. It routes requests to the appropriate microservices and handles authentication validation.

## Overview

The Gateway Service is responsible for:
- **Request Routing**: Forwarding requests to the correct microservice
- **Authentication**: Validating JWT tokens for protected routes
- **Logging**: Basic request/response logging
- **API Documentation**: Swagger UI for testing endpoints
- **Health Checks**: Service status monitoring

## Architecture

```
Frontend → Gateway (Port 3000) → Auth Service (Port 3001)
                                → User Service (Port 3002)
```

## Setup

### Prerequisites
- Node.js (v18 or higher)
- All microservices running (auth-service, user-service)

### Installation
```bash
cd backend/gateway
npm install
```

### Environment Variables
The service uses the centralized `.env` file (symbolic link to `../../.env`).

Required variables:
- `GATEWAY_PORT=3003`
- `AUTH_SERVICE_URL=http://localhost:3001`
- `USER_SERVICE_URL=http://localhost:3002`
- `JWT_SECRET=your-secret-key`

### Running the Service
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Health Check
- **GET** `/health` - Service health status

### Authentication Routes (Forwarded to Auth Service)
- **POST** `/auth/login` - User login
- **POST** `/auth/signup` - User registration

### User Routes (Forwarded to User Service)
- **GET** `/users/` - Get all users (requires authentication)
- **GET** `/users/me` - Get current user profile (requires authentication)

## Authentication

The gateway validates JWT tokens for user-service routes:
- Tokens are validated using the shared `JWT_SECRET`
- Invalid or missing tokens return `401 Unauthorized`
- Valid tokens are forwarded to the user-service

## Testing

### 1. Start All Services
```bash
# Terminal 1 - Auth Service
cd backend/auth-service
npm run dev

# Terminal 2 - User Service  
cd backend/user-service
npm run dev

# Terminal 3 - Gateway
cd backend/gateway
npm run dev
```

### 2. Test Authentication Flow
```bash
# 1. Register a new user
curl -X POST http://localhost:3003/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","email":"test@example.com","password":"password123"}'

# 2. Login to get JWT token
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Use token to access protected routes
curl -X GET http://localhost:3003/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test with Swagger UI
Visit `http://localhost:3003/docs` for interactive API documentation.

### 4. Test Health Check
```bash
curl http://localhost:3003/health
```

## Logging

The gateway logs:
- Incoming requests (method, URL, timestamp)
- Authentication status
- Service responses
- Errors

## Error Handling

- **401 Unauthorized**: Invalid or missing JWT token
- **502 Bad Gateway**: Target service unavailable
- **500 Internal Server Error**: Gateway internal errors

## Development Notes

- The gateway uses `@fastify/http-proxy` for request forwarding
- JWT validation is handled by `@fastify/jwt`
- All services must be running for full functionality
- The gateway doesn't store any data - it only routes requests

## Troubleshooting

### Common Issues

1. **"Target service unavailable"**
   - Check if the target microservice is running
   - Verify the service URL in `.env`

2. **"Unauthorized" errors**
   - Ensure JWT_SECRET is the same across all services
   - Check if the token is valid and not expired

3. **"Connection refused"**
   - Verify all services are running on correct ports
   - Check firewall settings
