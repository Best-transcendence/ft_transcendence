# Structured Logging Guide

## Overview

We use structured logging with explicit error types, codes, and metadata for better log analysis in Kibana.

## Usage

### Import the Logger

```javascript
import { createLogger, ErrorType } from '../utils/logger.js';

export default async function (fastify, _opts) {
  const logger = createLogger(fastify.log);
  // ... your routes
}
```

### Logging Errors

```javascript
logger.error(correlationId, 'Error message', {
  errorType: ErrorType.DUPLICATE_USERNAME,
  errorCode: 'USERNAME_ALREADY_EXISTS',
  httpStatus: 400,
  metadata: { username: name, authUserId }
});
```

### Available Error Types

- `ErrorType.DUPLICATE_USERNAME` - Username already exists
- `ErrorType.DUPLICATE_EMAIL` - Email already exists
- `ErrorType.VALIDATION_ERROR` - Input validation failed
- `ErrorType.AUTHENTICATION_ERROR` - Authentication failed
- `ErrorType.AUTHORIZATION_ERROR` - Authorization failed
- `ErrorType.NOT_FOUND` - Resource not found
- `ErrorType.DATABASE_ERROR` - Database operation failed
- `ErrorType.INTERNAL_ERROR` - Internal server error
- `ErrorType.EXTERNAL_SERVICE_ERROR` - External service error

### Logging Levels

```javascript
logger.error(correlationId, 'Error message', options);
logger.warn(correlationId, 'Warning message', options);
logger.info(correlationId, 'Info message', options);
logger.debug(correlationId, 'Debug message', options);
```

## Finding Logs in Kibana

### Filter by Error Type

```
error_type:duplicate_username
error_type:duplicate_email
error_type:validation_error
```

### Filter by Error Code

**Important**: Use the `.keyword` field for exact matches:

```
error_code.keyword:USERNAME_ALREADY_EXISTS
error_code.keyword:EMAIL_ALREADY_EXISTS
error_code.keyword:MISSING_REQUIRED_FIELDS
```

**Alternative**: You can also search without `.keyword`, but it may match partial text:
```
error_code:USERNAME_ALREADY_EXISTS
error_code:EMAIL_ALREADY_EXISTS
error_code:MISSING_REQUIRED_FIELDS
```

**Note**: If you don't see results, try:
1. Check the time range in Kibana (top right) - make sure it covers when the error occurred
2. Refresh the index pattern (Settings → Index Patterns → Refresh)
3. Use `error_code.keyword:USERNAME_ALREADY_EXISTS` for exact match

### Filter by Correlation ID

```
correlation_id:"user-123-1234567890"
```

### Combine Filters

```
error_type:duplicate_username AND service:user
error_type:duplicate_email AND http_status:400
```

## Example: Adding New Error Types

1. Add the error type to `ErrorType` enum in `utils/logger.js`
2. Use it in your code:
   ```javascript
   logger.error(correlationId, 'Custom error message', {
     errorType: ErrorType.YOUR_NEW_ERROR_TYPE,
     errorCode: 'YOUR_ERROR_CODE',
     httpStatus: 400,
     metadata: { /* relevant data */ }
   });
   ```
3. Logstash will automatically extract and index these fields

## Easy Tests to Verify Structured Logging

### Auth Service Tests

#### 1. Duplicate Email Registration
**Action**: Try to register with an email that already exists
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","email":"existing@example.com","password":"test123","confirmPassword":"test123"}'
```
**Expected Log in Kibana**:
- Search: `error_code:EMAIL_ALREADY_EXISTS`
- Should show: `error_type:duplicate_email`, `http_status:400`, `email` in metadata

#### 2. Invalid Login Credentials
**Action**: Try to login with wrong password
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"wrongpassword"}'
```
**Expected Log in Kibana**:
- Search: `error_code:INVALID_CREDENTIALS`
- Should show: `error_type:authentication_error`, `http_status:401`

#### 3. Missing Required Fields (Signup)
**Action**: Try to signup without email
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","password":"test123","confirmPassword":"test123"}'
```
**Expected Log in Kibana**:
- Search: `error_code:MISSING_REQUIRED_FIELDS`
- Should show: `error_type:validation_error`, `http_status:400`

#### 4. Invalid Email Format
**Action**: Try to signup with invalid email
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","email":"notanemail","password":"test123","confirmPassword":"test123"}'
```
**Expected Log in Kibana**:
- Search: `error_code:INVALID_EMAIL_FORMAT`
- Should show: `error_type:validation_error`, `http_status:400`, `email` in metadata

#### 5. Username with Capital Letters
**Action**: Try to signup with username containing capital letters
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser","email":"test@example.com","password":"test123","confirmPassword":"test123"}'
```
**Expected Log in Kibana**:
- Search: `error_code:INVALID_USERNAME_FORMAT`
- Should show: `error_type:validation_error`, `http_status:400`, `username` in metadata

### User Service Tests

#### 6. Duplicate Username
**Action**: Try to bootstrap/create user with existing username
```bash
curl -X POST http://localhost:3002/users/bootstrap \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: test-123" \
  -d '{"authUserId":1,"name":"existinguser","email":"new@example.com"}'
```
**Expected Log in Kibana**:
- Search: `error_code:USERNAME_ALREADY_EXISTS`
- Should show: `error_type:duplicate_username`, `http_status:400`, `username` in metadata

#### 7. Missing Required Fields (Bootstrap)
**Action**: Try to bootstrap without required fields
```bash
curl -X POST http://localhost:3002/users/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser"}'
```
**Expected Log in Kibana**:
- Search: `error_code:MISSING_REQUIRED_FIELDS`
- Should show: `error_type:validation_error`, `http_status:400`

### WebSocket Service Tests

#### 8. Missing WebSocket Token
**Action**: Try to connect to WebSocket without token
```javascript
// In browser console or WebSocket client
const ws = new WebSocket('ws://localhost:3004');
```
**Expected Log in Kibana**:
- Search: `error_code:MISSING_WEBSOCKET_TOKEN`
- Should show: `error_type:authentication_error`, `http_status:401`

#### 9. Invalid WebSocket Token
**Action**: Try to connect with invalid/expired token
```javascript
// In browser console or WebSocket client
const ws = new WebSocket('ws://localhost:3004?token=invalid_token');
```
**Expected Log in Kibana**:
- Search: `error_code:INVALID_WEBSOCKET_TOKEN`
- Should show: `error_type:authentication_error`, `http_status:401`

#### 10. Invalid JSON Message
**Action**: Send invalid JSON through WebSocket
```javascript
// After successful connection
ws.send('not valid json');
```
**Expected Log in Kibana**:
- Search: `message:"Invalid JSON message"`
- Should show warning level log

### Match Save Tests

#### 11. Match Save Failure
**Action**: Trigger a match save that fails (e.g., user-service down or invalid token)
**Expected Log in Kibana**:
- Search: `error_code:MATCH_SAVE_FAILED` or `error_code:MATCH_SAVE_ERROR`
- Should show: `error_type:external_service_error`, `http_status:500` or status code

### How to Verify in Kibana

1. **Wait 10-15 seconds** after triggering the error (for Logstash to process)
2. **Open Kibana** (usually `http://localhost:5601`)
3. **Go to Discover** and select the `logs-*` index pattern
4. **Search using the error codes** listed above:
   - Example: `error_code:EMAIL_ALREADY_EXISTS`
5. **Check the fields**:
   - `error_type` - Should match the error category
   - `error_code` - Should match the specific error
   - `http_status` - Should show the HTTP status code
   - `correlation_id` - Should be present for tracing
   - `metadata` - Should contain relevant context (username, email, etc.)
   - `service` - Should show which service logged the error

### Quick Verification Checklist

- [ ] Can search by `error_code` and find specific errors
- [ ] `error_type` field is populated correctly
- [ ] `http_status` matches the HTTP response code
- [ ] `correlation_id` is present for request tracing
- [ ] `metadata` contains relevant context (username, email, userId, etc.)
- [ ] `service` field shows the correct service name
- [ ] Logs appear within 10-15 seconds of the error

## Benefits

- **Structured Data**: All errors have consistent fields
- **Easy Filtering**: Filter by error type, code, or metadata in Kibana
- **Better Analytics**: Track error rates, types, and patterns
- **Request Tracing**: Use correlation_id to trace requests across services
- **Metadata**: Include relevant context (username, email, etc.) for debugging

