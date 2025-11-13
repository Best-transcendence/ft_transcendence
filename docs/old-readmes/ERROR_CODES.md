# Error Codes Reference

This document lists all error codes used in the application for testing and debugging in Kibana.

## Current Error Codes

### User Service

| Error Code | Error Type | HTTP Status | Description | How to Test |
|------------|------------|-------------|-------------|-------------|
| `USERNAME_ALREADY_EXISTS` | `duplicate_username` | 400 | Username is already taken | Try to create a user with an existing username |
| `MISSING_REQUIRED_FIELDS` | `validation_error` | 400 | Required fields are missing | Create user without authUserId, name, or email |
| `INVALID_EMAIL_FORMAT` | `validation_error` | 400 | Email format is invalid | Create user with invalid email (no @ or .) |

### Auth Service

| Error Code | Error Type | HTTP Status | Description | How to Test |
|------------|------------|-------------|-------------|-------------|
| `EMAIL_ALREADY_EXISTS` | `duplicate_email` | 400 | Email is already registered | Try to register with an existing email |

## Searching in Kibana

### By Error Code
```
error_code:USERNAME_ALREADY_EXISTS
error_code:EMAIL_ALREADY_EXISTS
error_code:MISSING_REQUIRED_FIELDS
error_code:INVALID_EMAIL_FORMAT
```

### By Error Type
```
error_type:duplicate_username
error_type:duplicate_email
error_type:validation_error
```

### Combined Filters
```
error_code:USERNAME_ALREADY_EXISTS AND service:user
error_type:validation_error AND http_status:400
error_code:EMAIL_ALREADY_EXISTS AND service:auth
```

## Suggested Error Codes for Future Implementation

### Authentication Errors
- `INVALID_CREDENTIALS` - Wrong email/password
- `ACCOUNT_LOCKED` - Account locked due to too many failed attempts
- `TOKEN_EXPIRED` - JWT token has expired
- `TOKEN_INVALID` - JWT token is invalid or malformed
- `REFRESH_TOKEN_INVALID` - Refresh token is invalid

### Authorization Errors
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User doesn't have permission
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

### Validation Errors
- `INVALID_USERNAME_FORMAT` - Username doesn't meet requirements
- `INVALID_PASSWORD_FORMAT` - Password doesn't meet requirements
- `PASSWORD_TOO_SHORT` - Password is too short
- `PASSWORD_TOO_LONG` - Password is too long
- `INVALID_INPUT` - General input validation error

### Resource Errors
- `USER_NOT_FOUND` - User doesn't exist
- `PROFILE_NOT_FOUND` - User profile doesn't exist
- `MATCH_NOT_FOUND` - Match doesn't exist
- `RESOURCE_NOT_FOUND` - General resource not found

### Database Errors
- `DATABASE_CONNECTION_ERROR` - Cannot connect to database
- `DATABASE_QUERY_ERROR` - Database query failed
- `DATABASE_TIMEOUT` - Database operation timed out
- `CONSTRAINT_VIOLATION` - Database constraint violation

### External Service Errors
- `AUTH_SERVICE_UNAVAILABLE` - Auth service is down
- `USER_SERVICE_UNAVAILABLE` - User service is down
- `GATEWAY_SERVICE_UNAVAILABLE` - Gateway service is down
- `EXTERNAL_API_ERROR` - External API call failed

### Rate Limiting
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `TOO_MANY_REQUESTS` - Rate limit exceeded

### Business Logic Errors
- `FRIEND_REQUEST_ALREADY_SENT` - Friend request already exists
- `FRIEND_REQUEST_NOT_FOUND` - Friend request doesn't exist
- `ALREADY_FRIENDS` - Users are already friends
- `CANNOT_ADD_SELF` - Cannot add yourself as friend
- `MATCH_ALREADY_EXISTS` - Match already exists
- `INVALID_MATCH_STATE` - Match is in invalid state

## Testing Checklist

Use these error codes to test your logging and monitoring:

- [ ] `USERNAME_ALREADY_EXISTS` - Test duplicate username
- [ ] `EMAIL_ALREADY_EXISTS` - Test duplicate email
- [ ] `MISSING_REQUIRED_FIELDS` - Test missing fields
- [ ] `INVALID_EMAIL_FORMAT` - Test invalid email format
- [ ] `INVALID_CREDENTIALS` - Test wrong login credentials
- [ ] `TOKEN_EXPIRED` - Test expired token
- [ ] `USER_NOT_FOUND` - Test accessing non-existent user
- [ ] `UNAUTHORIZED` - Test accessing protected resource without auth
- [ ] `FORBIDDEN` - Test accessing resource without permission

## Quick Search Commands

```bash
# Search for all errors
error_code:*

# Search for validation errors
error_type:validation_error

# Search for duplicate errors
error_type:duplicate_username OR error_type:duplicate_email

# Search for 400 errors
http_status:400

# Search for errors in user service
error_code:* AND service:user

# Search for errors in last hour
error_code:* AND @timestamp:[now-1h TO now]
```

