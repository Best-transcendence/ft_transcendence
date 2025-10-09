# WebSocket Service Tests

This directory contains HTML test files for testing the WebSocket service with different users.

## 🧪 Test Files

- `ws-test-yulia.html` - Test as Yulia (User ID: 1)
- `ws-test-tina.html` - Test as Tina (User ID: 2)  
- `ws-test-juan.html` - Test as Juan (User ID: 3)
- `ws-test-camille.html` - Test as Camille (User ID: 4)

## 🚀 How to Use

1. **Start the WebSocket service**:
   ```bash
   cd backend/ws-service
   npm run dev
   ```

2. **Open test files in browser**:
   - Open any of the HTML files in your browser
   - Each file connects as a different user
   - You can open multiple files to test multiple users

3. **Test scenarios**:
   - **Single user**: Open one file to test basic connection
   - **Multiple users**: Open multiple files to test user list broadcasting
   - **Connection/disconnection**: Close and reopen tabs to test presence

## 🔑 JWT Tokens

**Important**: JWT tokens expire after a certain time. If you get authentication errors:

1. **Get fresh tokens**:
   ```bash
   # Login as Yulia
   curl -X POST http://localhost:3003/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "yioffe@example.com", "password": "q"}'
   
   # Login as Tina  
   curl -X POST http://localhost:3003/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "thuy-ngu@example.com", "password": "q"}'
   
   # Login as Juan
   curl -X POST http://localhost:3003/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "juan-pma@example.com", "password": "q"}'
   
   # Login as Camille
   curl -X POST http://localhost:3003/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "cbouvet@example.com", "password": "q"}'
   ```

2. **Update the JWT_TOKEN variable** in the HTML files with the new token

## 📊 Expected Behavior

### Connection Flow
1. **WebSocket connects** with JWT token
2. **Server verifies token** and extracts user info
3. **Server sends welcome message** with user data
4. **Server broadcasts user list** to all connected clients

### User List Updates
- **When user connects**: User appears in list for all clients
- **When user disconnects**: User disappears from list for all clients
- **Multiple connections**: Same user appears only once in list

### Test Messages
- Each test file has a "Send Test Message" button
- Messages are sent to the WebSocket server
- All connected clients receive the message

## 🐛 Troubleshooting

### Connection Issues
- **Check WebSocket service is running** on port 4000
- **Check JWT token is valid** (not expired)
- **Check browser console** for error messages

### Authentication Issues
- **Token expired**: Get a fresh token using curl commands above
- **Invalid token**: Check the token format and JWT_SECRET

### User List Issues
- **User not appearing**: Check if user is actually connected
- **Duplicate users**: This shouldn't happen with current implementation
- **Missing users**: Check WebSocket service logs for connection errors
