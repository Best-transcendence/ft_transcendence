# Auth Service Migration Testing Guide

## Testing Checkpoint 1: Basic Service Startup

### Prerequisites
- Node.js installed
- `better-sqlite3` installed (already done)

### Steps to Test

1. **Start the service:**
```bash
cd backend/auth-service
npm start
```

**Expected output:**
- Should see: `✅ SQLite database connected successfully`
- Service should start on port 3001 (or your configured port)
- No database-related errors

2. **Test health endpoint:**
```bash
curl http://localhost:3001/health
```

**Expected response:**
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "..."
}
```

3. **Test database file creation:**
```bash
# Check if database file was created
ls -la data/auth.db  # Database file location
```

**Expected:** Database file should exist

---

## Testing Checkpoint 2: Seed Script

### Steps to Test

1. **Run seed script:**
```bash
cd backend/auth-service
npm run seed
```

**Expected output:**
- Should see: `🌱 Starting auth service seed...`
- Should see: `👤 Created user: yioffe@example.com`
- Should see: `👤 Created user: thuy-ngu@example.com`
- Should see: `👤 Created user: juan-pma@example.com`
- Should see: `👤 Created user: cbouvet@example.com`
- Should see: `✅ Auth service seed completed successfully`

2. **Run seed again (should skip):**
```bash
npm run seed
```
**Expected output:**
- Should see: `ℹ️ 4 users already exist — skipping seed.`

3. **Verify users in database:**
```bash
# Using sqlite3 CLI (if installed)
sqlite3 data/auth.db "SELECT id, email FROM User;"
```

**Expected:** Should see 4 users with IDs 1-4

---

## Testing Checkpoint 3: Login Endpoint

### Steps to Test

1. **Test successful login:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "yioffe@example.com", "password": "q"}'
```

**Expected response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "yioffe@example.com"
  }
}
```

2. **Test invalid credentials:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "yioffe@example.com", "password": "wrong"}'
```

**Expected response:**
```json
{
  "error": "Invalid credentials"
}
```
Status code: 401

3. **Test non-existent user:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@example.com", "password": "q"}'
```

**Expected response:**
```json
{
  "error": "Invalid credentials"
}
```
Status code: 401

---

## Testing Checkpoint 4: Signup Endpoint

### Steps to Test

1. **Test successful signup:**
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "testuser",
    "email": "testuser@example.com",
    "password": "testpass",
    "confirmPassword": "testpass"
  }'
```

**Expected response:**
```json
{
  "id": 5,
  "email": "testuser@example.com"
}
```
Status code: 200

**Note:** This will also attempt to bootstrap the user profile in user-service. If user-service isn't running, you'll see a warning but signup should still succeed.

2. **Test duplicate email:**
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "anotheruser",
    "email": "testuser@example.com",
    "password": "testpass",
    "confirmPassword": "testpass"
  }'
```

**Expected response:**
```json
{
  "error": "User with this email already exists"
}
```
Status code: 400

3. **Test validation errors:**
```bash
# Missing fields
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Password mismatch
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test2",
    "email": "test2@example.com",
    "password": "pass1",
    "confirmPassword": "pass2"
  }'
```

**Expected:** Appropriate validation error messages

---

## Testing Checkpoint 5: Docker Build

### Steps to Test

1. **Build Docker image:**
```bash
cd backend/auth-service
docker build -t auth-service-test .
```

**Expected:** Build should complete successfully without database errors

2. **Run container:**
```bash
docker run -p 3001:3001 \
  -e AUTH_DATABASE_URL="file:/app/data/auth.db" \
  -e AUTH_SERVICE_PORT=3001 \
  -e JWT_SECRET="test-secret" \
  -v auth_data:/app/data \
  auth-service-test
```

**Expected:** 
- Container should start
- Should see database connection success
- Seed should run automatically
- Service should be accessible on port 3001

3. **Test endpoints in Docker:**
```bash
curl http://localhost:3001/health
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "yioffe@example.com", "password": "q"}'
```

---

## Common Issues and Solutions

### Issue: "Cannot find module 'better-sqlite3'"
**Solution:** Run `npm install` in backend/auth-service

### Issue: "Database file not found"
**Solution:** Check AUTH_DATABASE_URL environment variable. Default is `file:./data/auth.db`

### Issue: "SQLITE_ERROR: no such table: User"
**Solution:** The schema should auto-initialize. Check that `db/schema.sql` exists and is readable.

### Issue: "EACCES: permission denied" (in Docker)
**Solution:** The `/app/data` directory should have proper permissions. Check Dockerfile has `chmod 777 /app/data`

---

## Next Steps After Testing

Once all tests pass:
1. Remove old database files if needed (data/auth.db)
2. Run `npm install` to update package-lock.json
3. Continue with user-service migration

