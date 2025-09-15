# Backend Testing Guide

This directory contains comprehensive tests for the microservices architecture.

## 🧪 Test Structure

```
tests/
├── setup.js                    # Global test configuration
├── utils/
│   └── testHelpers.js          # Test utilities and helpers
├── auth-service/
│   └── auth.test.js            # Auth service unit tests
├── user-service/
│   └── users.test.js           # User service unit tests
├── gateway/
│   └── gateway.test.js         # Gateway service unit tests
└── integration/
    └── signup-flow.test.js     # End-to-end integration tests
```

## 🚀 Running Tests

### All Tests
```bash
# From backend/ directory
npm test
```

### Individual Service Tests
```bash
# Auth service only
npm run test -- --testPathPattern=auth-service

# User service only  
npm run test -- --testPathPattern=user-service

# Gateway only
npm run test -- --testPathPattern=gateway

# Integration tests only
npm run test -- --testPathPattern=integration
```

### Watch Mode
```bash
# Watch all tests
npm run test:watch

# Watch specific service
npm run test:watch -- --testPathPattern=auth-service
```

### Coverage Report
```bash
npm run test:coverage
```

## 🗄️ Test Database Setup

Tests use separate SQLite databases:
- **Auth Service**: `test-auth.db`
- **User Service**: `test-user.db`

These are automatically created and cleaned up during test runs.

## 📋 Test Categories

### Unit Tests
- **Auth Service**: Registration, login, validation
- **User Service**: Profile management, bootstrap endpoint
- **Gateway**: Routing, JWT validation, error handling

### Integration Tests
- **Complete Signup Flow**: Auth → User service communication
- **Login Flow**: JWT token generation and validation
- **Error Handling**: Service failures and recovery

## 🔧 Test Configuration

### Environment Variables
Tests automatically set:
```bash
NODE_ENV=test
AUTH_DATABASE_URL=file:./test-auth.db
USER_DATABASE_URL=file:./test-user.db
JWT_SECRET=test-jwt-secret-key-for-testing-only
```

### Jest Configuration
- **Timeout**: 10 seconds per test
- **Coverage**: 70% threshold for all metrics
- **Environment**: Node.js
- **Setup**: Automatic database cleanup

## 🛠️ Writing New Tests

### Test File Naming
- Unit tests: `*.test.js`
- Integration tests: `*.test.js` in `integration/` folder

### Test Structure
```javascript
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

describe('Service Name', () => {
  beforeAll(async () => {
    // Setup
  });

  afterAll(async () => {
    // Cleanup
  });

  test('should do something', async () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Using Test Helpers
```javascript
import { createTestAuthUser, cleanupTestDatabases } from '../utils/testHelpers.js';

// Create test data
const user = await createTestAuthUser(prisma, {
  name: 'testuser',
  email: 'test@example.com'
});

// Clean up after tests
await cleanupTestDatabases();
```

## 🐛 Debugging Tests

### Verbose Output
```bash
npm test -- --verbose
```

### Single Test
```bash
npm test -- --testNamePattern="should register a new user"
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📊 Coverage Goals

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🔍 Test Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Naming**: Use descriptive test names
4. **Assertions**: Test both success and failure cases
5. **Mocking**: Mock external dependencies when needed
6. **Coverage**: Aim for high test coverage
7. **Performance**: Keep tests fast and reliable

## 🚨 Common Issues

### Database Locked
```bash
# Clean up test databases
rm -f test-*.db
```

### Port Conflicts
```bash
# Kill processes using test ports
lsof -ti:3001,3002,3003 | xargs kill -9
```

### Module Import Errors
```bash
# Ensure all dependencies are installed
npm install
```

