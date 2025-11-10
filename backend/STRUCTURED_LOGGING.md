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

```
error_code:USERNAME_ALREADY_EXISTS
error_code:EMAIL_ALREADY_EXISTS
error_code:MISSING_REQUIRED_FIELDS
```

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

## Benefits

- **Structured Data**: All errors have consistent fields
- **Easy Filtering**: Filter by error type, code, or metadata in Kibana
- **Better Analytics**: Track error rates, types, and patterns
- **Request Tracing**: Use correlation_id to trace requests across services
- **Metadata**: Include relevant context (username, email, etc.) for debugging

