# Gateway Service - Evaluation Overview

## Purpose

The Gateway Service acts as the single entry point for all backend microservices. It routes requests to appropriate services, validates JWT tokens, and provides unified API documentation.

## Structure

```
gateway/
├── main.js           # Fastify server, routing, middleware
├── env.js            # Environment variable loading
└── static/           # Static files (if any)
```

## Key Functions

### Request Routing
- **Auth Routes** (`/auth/*`):
  - Proxies to Auth Service
  - No JWT validation required
  - Handles login and signup requests

- **User Routes** (`/users/*`):
  - Proxies to User Service
  - JWT validation for protected endpoints
  - `/users/me` requires authentication
  - `/users` (public listing) may not require auth

### Authentication Middleware
- Validates JWT tokens for protected routes
- Extracts user information from token
- Returns 401 Unauthorized for invalid/missing tokens
- Uses shared JWT secret from Vault

### Logging & Monitoring
- Request/response logging with correlation IDs
- Service identification in logs
- Response time tracking
- Error logging

## Main Components

### Routing Configuration
- **HTTP Proxy**: Uses `@fastify/http-proxy` for request forwarding
- **Route Prefixes**: `/auth` → Auth Service, `/users` → User Service
- **Method Filtering**: Only handles specific HTTP methods (GET, POST)

### Middleware Stack
1. **CORS**: Handles cross-origin requests
2. **JWT Validation**: Validates tokens for protected routes
3. **Request Logging**: Logs incoming requests
4. **Response Logging**: Logs completed requests with timing

### API Documentation
- Swagger UI at `/docs`
- Links to individual service documentation
- Unified view of all available endpoints

## Integration Points

- **Vault**: Fetches `JWT_SECRET` for token validation
- **Auth Service**: Proxies authentication requests
- **User Service**: Proxies user management requests
- **Frontend**: Single entry point for all API calls
- **ELK**: Sends structured logs for monitoring

## Request Flow

```
Frontend Request
    ↓
Gateway (JWT validation if needed)
    ↓
Auth Service or User Service
    ↓
Response back through Gateway
    ↓
Frontend
```

## Security Features

- JWT token validation before forwarding protected requests
- CORS configuration for allowed origins
- Request logging for audit trail
- Error handling and proper status codes

