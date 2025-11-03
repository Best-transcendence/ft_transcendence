# WebSocket Service Refactor Summary

## 🎯 Goals

- Modularize the WebSocket service into **handlers** (`lobby.js`, `rooms.js`, `game.js`, `friends.js` later).
- Centralize **shared state** (`onlineUsers`, `lobbyUsers`, `namesCache`) in `state/user.js`.
- Keep `websocket.js` slim: **auth → attach user → delegate → cleanup**.
- Ensure **invite validation** and **matchmaking** logic are robust and consistent.

---

## ✅ Changes Implemented

### 1. `state/user.js`

- Created a **state manager** for:
    - `onlineUsers`, `lobbyUsers`, `namesCache`.
- Added helpers:
    - `addOnlineUser`, `removeOnlineUser`, `isUserOnline`.
    - `addLobbyUser`, `removeLobbyUser`, `getLobbyUsers`.
    - `cacheUserName`, `getUserName`.
    - `fetchUserName(app, userId, token)` → supports optional JWT header.
- Removed message‑sending logic (`sendUserList`) to keep it pure state.

---

### 2. `lobby.js`

- Handles:
    - `lobby:join`, `lobby:leave`, `lobby:request`.
    - `broadcastLobby()` → rebroadcasts lobby presence to all clients.
    - `cleanup(ws)` → removes user from lobby on disconnect.

---

### 3. `rooms.js`

- Added **invite flow**:
    - `handleInvite` with guards:
        - Invalid target (`BAD_INVITE`).
        - Self‑invite (`SELF_INVITE`).
        - Target not in lobby (`USER_NOT_IN_LOBBY`).
    - `handleInviteAccepted` → creates a room, prevents duplicates.
    - `handleInviteDeclined` → notifies inviter.
- Added **matchmaking flow**:
    - `handleMatchmakingJoin` → queue system, pairs players.
    - `handleMatchmakingLeave` → cancels search.

---

### 4. `websocket.js`

- Now only:
    - Verifies JWT and extracts `userId`.
    - Attaches `ws.user = { id, name }`.
    - Calls `addOnlineUser` and hydrates missing names via `fetchUserName(app, userId, token)`.
    - Delegates messages to:
        - `lobbyHandlers[type]`
        - `roomHandlers.handleInvite / handleInviteAccepted / handleInviteDeclined`
        - `gameHandlers` for game events.
    - Cleans up on `close` with `lobbyHandlers.cleanup(ws)` + `removeOnlineUser(ws.user.id, ws)`.
- Removed direct references to `onlineUsers`, `lobbyUsers`, `namesCache`.

---

## 🚀 Benefits

- **Separation of concerns**: each domain (lobby, rooms, game) has its own file.
- **Future‑proof**: `fetchUserName` always passes token if needed.
- **Cleaner code**: `websocket.js` is now a router, not a dumping ground.
- **Robust invites**: all validation logic centralized in `rooms.js`.
- **Scalable**: easy to add `friends.js` or other handlers without touching core.

---

## 📌 Next Steps

- Add `friends.js` handler for real‑time friend presence/notifications.

---

## session 2

---

## 🗂️ Backend (ws_service)

### `rooms.js`

- **Exported Structures**:
    - `rooms`: Map with active rooms.
    - `userRoom`: Map `userId -> roomId|null`.
    - `pendingKickIntro`: Set with users who must return to intro after disconnection.
- **Invite Flow**:
    - `handleInvite`: validates and forwards invitation.
    - `handleInviteAccepted`: creates room, assigns `roomId` to sockets, updates `userRoom`, sends `room:start`.
    - `handleInviteDeclined`: notifies inviter.
- **Matchmaking**:
    - `handleMatchmakingJoin`: adds to queue, if 2 players, creates room and sends `room:start`.
    - `handleMatchmakingLeave`: removes from queue.
- **Disconnection**:
    - `handleDisconnect`:
        - Copies original players.
        - Removes disconnected player.
        - If one left, sends `game:end`.
        - Cleans `userRoom`.
        - Marks disconnected in `pendingKickIntro`.
        - Clears timers and deletes room.

---

### `session.js`

- **Function `onWsConnected(ws)`**:
    - If `uid` is in `pendingKickIntro`:
        - Removes from set.
        - Sends `session:kickIntro`.
    - Otherwise:
        - Checks `userRoom`.
        - Sends `session:state` with `{ inRoom, roomId }`.

---

### `websocket.js`

- **On `connection`**:
    - Verifies JWT.
    - Attaches `ws.user`.
    - Calls `addOnlineUser`.
    - 🔥 Calls `onWsConnected(ws)`.
    - Handles messages (`invite:*`, `game:*`, `matchmaking:*`).
    - On `close`: cleans lobby, `removeOnlineUser`, `handleDisconnect`.

---

### `main.js`

- Fastify + WS server.
- Registers `registerWebsocketHandlers`.
- Health check and Swagger.
- Startup logs.
- Note: better to create `wss` after `app.listen`.

---

## 🗂️ Frontend

### `services/ws.ts`

- Maintains global `socket`.
- `connectSocket(token)`: opens WS with token.
- `autoConnect()`: reads `jwt` from `localStorage` and connects.
- `onSocketMessage(fn)`: subscribes to messages.
- `disconnectSocket()`: manual close.
- Automatic reconnection if not manual close.

👉 **Key**: call `autoConnect()` on app startup (in `main.ts` or in `protectedPage` of router).

---

### `router.ts`

- Handles hash routes.
- `protectedPage`: validates user → renders page.
- Here we add `autoConnect()` to always open WS on protected pages.

---

### `PongRemote.ts` / `pong2d.ts`

- Subscribes to game messages.
- Handled cases: `room:start`, `game:start`, `game:update`, `game:end`, `game:timeup`.
- Now also:
    - `session:kickIntro` → `window.location.hash = "intro"`.
    - `session:state` → if not in room and on `#game`/`#remote`, return to intro.
- Game end overlay.
- Cleanup of keyboard handlers in `leaveRemoteGame`.

---

## 🔑 Detected Problem

- The backend does mark `pendingKickIntro`, but after reloading the client **it wouldn't reopen the WebSocket** → `session:kickIntro` never arrived.
- Solution: **call `autoConnect()` on startup** (router or main.ts).

---

## 📌 Pending for Tomorrow

- Confirm that `autoConnect()` executes on reload.
- See in console:
    - `WS open`
    - `WS message: { type: "session:kickIntro" }`
- Verify that the frontend redirects to intro.
- Review UX for the remaining player (overlay + redirect after 3s).

---

## Session 3 - Mon Nov 03 2025

### Goals
- Fix navigation back issue where leaving the game via browser back button caused the game to freeze for the remaining player.
- Fix overlay display issue where game elements (paddles, ball, scores) were visible behind the win overlay.

### Changes Implemented

#### Backend (`ws-service/routes/game.js`)
- **Modified `handleGameLeave`**: Now sends `game:end` to the remaining player and `session:kickIntro` to the leaver when a player intentionally leaves the game (e.g., navigation back). This ensures both players are properly notified and redirected, preventing the game from freezing.
- Added import for `userRoom` from `rooms.js` to clean up user room mappings on leave.

#### Frontend (`src/games/Pong2dRemote.ts`)
- **Overlay Z-Index Fix**: Changed `timeUpOverlay` z-index from `z-20` to `z-30` to ensure it renders above game elements.
- **Element Hiding**: Added code to hide paddles, ball, and scores (`display: "none"`) when showing `game:end` or `game:timeup` overlays, preventing overlap with the win message.
- **Cleanup**: Removed redundant hiding code after confirming z-index fix, but re-added for reliability.

### Benefits
- **Smooth Navigation**: Browser back button now properly ends the game for both players without freezing.
- **Clean UI**: Win overlays now display cleanly without overlapping game elements.
- **Consistent Behavior**: Leaving the game (intentional or accidental) now mirrors disconnect handling.

### Next Steps
- Implement sounds and visual effects for scoring.
- Add background animations using machine.png assets.
- Extend fixes to other game modes (AI, tournament).
