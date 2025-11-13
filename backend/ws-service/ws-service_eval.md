# WebSocket Service - Evaluation Overview

## Purpose

The WebSocket Service provides real-time bidirectional communication for user presence, game signaling, and live updates. It handles authenticated WebSocket connections and manages online user state.

## Structure

```
ws-service/
├── main.js           # Fastify server, WebSocket server setup
├── routes/
│   ├── websocket.js  # WebSocket connection handlers
│   ├── rooms.js     # Game room management
│   └── game.js      # Game-related WebSocket events
├── sok.js            # Socket.io compatibility (if used)
└── utils/
    └── logger.js     # Structured logging utility
```

## Key Functions

### Connection Management
- **JWT Authentication**: Validates JWT token on connection
- **User Identification**: Extracts user ID from JWT payload
- **Multiple Connections**: Supports multiple sockets per user (tabs/devices)
- **Connection Tracking**: Maintains map of online users and their sockets

### Real-time Features
- **User Presence**: Tracks online/offline status
- **User List Broadcasting**: Sends updated user list to all connected clients
- **Welcome Messages**: Sends user data on successful connection
- **Disconnect Handling**: Removes user from online list when all sockets close

### Game Signaling
- Game room creation and management
- Real-time game event broadcasting
- Player-to-player communication
- Match state synchronization

## Main Components

### WebSocket Server
- Built on `ws` library (WebSocketServer)
- Attached to Fastify HTTP server
- Handles upgrade requests from HTTP to WebSocket

### Connection Handlers
- **Authentication**: Verifies JWT token from query string
- **User Mapping**: Maps user IDs to sets of WebSocket connections
- **Message Broadcasting**: Sends messages to all or specific users
- **Error Handling**: Closes connections on authentication failure

### Message Types
- `welcome`: Sent to newly connected user
- `user:list`: Broadcasted list of online users
- Game-specific events (room creation, game state, etc.)

## Integration Points

- **Auth Service**: Validates JWT tokens (shared secret from Vault)
- **Frontend**: Direct WebSocket connection (bypasses Gateway)
- **User Service**: May query user data for presence information
- **ELK**: Sends structured logs for monitoring

## Connection Flow

```
Client connects with JWT token
    ↓
Server validates JWT
    ↓
Extract user ID from token
    ↓
Add socket to user's connection set
    ↓
Send welcome message
    ↓
Broadcast updated user list to all clients
```

## Features

- **Multiple Devices**: Same user can connect from multiple tabs/devices
- **Presence Tracking**: Real-time online user list
- **Automatic Cleanup**: Removes users when all connections close
- **Error Recovery**: Handles connection drops gracefully

