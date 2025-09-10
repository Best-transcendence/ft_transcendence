# Auth Service Environment Setup

Create a `.env` file in the `backend/auth-service/` directory with:

```bash
# Database configuration - separate database for auth service
DATABASE_URL="file:./prisma/auth.db"

# JWT configuration
JWT_SECRET="auth-service-super-secret-jwt-key-change-in-production"

# Service configuration
AUTH_SERVICE_PORT=3001
HOST="localhost"

# Development settings
NODE_ENV="development"
```

## Commands to run:

1. **Create the .env file manually** with the content above
2. **Generate Prisma client**: `npx prisma generate`  
3. **Run migrations**: `npx prisma migrate dev --name init`
4. **Seed the database**: `npm run seed`
5. **Start the service**: `npm run dev`
