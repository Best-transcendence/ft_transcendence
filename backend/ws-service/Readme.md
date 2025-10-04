# ws-service

Standalone WebSocket microservice for presence, lobby, and game-room signaling.
Handles JWT-authenticated WebSocket connections, tracks online users (multiple sockets per user), and broadcasts user lists and room events.

---

## Features
- JWT verification on connection
- Multiple sockets per user (one user across tabs/devices)
- Broadcasts online users with id

---

## Table of contents
1. Prerequisites
2. Environment variables
3. Install and run
4. WebSocket message contract
5. Behavior and flow
6. Troubleshooting

---

## Prerequisites
- Node.js 18+
- npm
- A shared JWT secret used by your auth-service so tokens verify in this service

---

## Environment variables
Create a `.env` file in the ws-service root with these values:

- **JWT_SECRET** — secret (or public key) used to verify incoming JWTs
- **WS_PORT** — port to bind the HTTP/WebSocket server (default: 4000)

Example `.env`:
```env
JWT_SECRET=your-super-secret
WS_PORT=4000
```

Restart the service after editing `.env`.

---

## Install and run

1. Install dependencies
```bash
cd ws-service
npm install
npm install @fastify/cors@8

```

2. Development (auto-reload)
```bash
npm run dev
```

Notes:
- `dev` uses nodemon (dev dependency). Ensure `npm install` was run inside `ws-service`.
- The service logs the loaded secret prefix at startup for quick verification.
**NOTE** be careful with the version of npm install @fastify/cors@8 because the last verison is just compatible
with @fastify 5.* and our project is in 4.2.*

---

## WebSocket connection (client)
- Connect only after login or guest-join (client must possess a valid JWT).
- Recommended: keep WS URL in client env (VITE_WS_URL or similar).

---

## Behavior and flows

- Connection flow:
  1. Client obtains JWT (login or guest token) from auth-service.
  2. Client opens WebSocket with `?token=...`.
  3. Server verifies JWT (`jwt.verify(token, JWT_SECRET)`).
  4. On success: attach `ws.user`, add socket to `onlineUsers` map (Map<userId, Set<sockets>>), send `welcome`, broadcast `user:list`.
  5. On failure: log error and immediately `ws.close()`.

- Disconnect flow:
  - On `close`, remove only that socket; if user has no remaining sockets, remove user from `onlineUsers` and broadcast updated list.

---


## Troubleshooting

- “Invalid token, closing WS” or “secret or public key must be provided”
  - Ensure `.env` exists in ws-service root, contains `JWT_SECRET`, and `dotenv.config()` runs before verification.
  - Restart service after changes.

- Socket connects then immediately disconnects
  - Log the incoming token on connect and the `jwt.verify` error message. Common causes: expired token, invalid signature, missing token.

- Only one user shown or name is `undefined`
  - Ensure JWT payload includes `id` and `name`; update auth-service to sign tokens with those claims, or fetch user info after verify.
  - For multiple tabs per user: this service de-duplicates users in `user:list` (one entry per user id). Switch to broadcasting per connection if you want separate entries per tab.

- `nodemon: not found`
  - Run `npm install` in ws-service or change `dev` script to `node main.js` if you don’t want nodemon.

---
