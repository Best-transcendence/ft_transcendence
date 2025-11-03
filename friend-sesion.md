# Friends Online Status Feature Plan

## 🎯 Goals

- Add real-time online status indicators to the friends page in `Friends.ts`.
- Show 🟢 for online friends and 🔴 for offline friends.
- Update statuses dynamically without page reload for a smooth user experience.
- Leverage existing WebSocket infrastructure and `onlineUsers` state.

## 📁 Files Involved

- **Backend**: `backend/ws-service/routes/friends.js` (new), `backend/ws-service/routes/websocket.js` (integrate).
- **Frontend**: `frontend/src/pages/Friends.ts` (update UI and add WS logic).

## ✅ Implementation Plan

### 1. Backend: `friends.js` (New File)

- Create `registerFriendsHandlers` function.
- Add `handleFriendSubscribe(ws, data)`:
  - Receives `data.friendIds`: Array of friend user IDs from frontend.
  - Checks each ID against `onlineUsers` (import from `../state/user.js`).
  - Responds with `{ type: 'friends:status', statuses: { [friendId]: true/false } }` for initial statuses.

### 2. Backend: `websocket.js` (Integration)

- Import `registerFriendsHandlers` from `./friends.js`.
- In `registerWebsocketHandlers`, add `const friendsHandlers = registerFriendsHandlers(wss, app);`.
- Add broadcasts on connect/disconnect:
  - On connect: `wss.clients.forEach(client => client.send(JSON.stringify({ type: 'user:online', userId })));`
  - On disconnect: `wss.clients.forEach(client => client.send(JSON.stringify({ type: 'user:offline', userId })));`
- In message handling, add case `'friends:subscribe'`: `friendsHandlers.handleFriendSubscribe(ws, data);`.

### 3. Frontend: `Friends.ts` (UI and WS Updates)

- Import WS functions: `import { sendWSMessage, onSocketMessage } from "../services/ws";`.
- Modify `friendCard(friend: Friend)`: Change status to `<span id="status-${friend.id}" class="inline-block ml-1 text-sm">🔴</span>` (default red).
- In `loadFriend()`, after building cards, send subscribe: `sendWSMessage('friends:subscribe', { friendIds: thisUser.friends.map(f => f.id) });`.
- Add WS listener for initial statuses: `onSocketMessage((msg) => { if (msg.type === 'friends:status') updateFriendStatuses(msg.statuses); });`.
- Add WS listener for real-time updates: `onSocketMessage((msg) => { if ((msg.type === 'user:online' || msg.type === 'user:offline') && thisUser.friends.some(f => f.id === msg.userId)) updateSingleFriendStatus(msg.userId, msg.type === 'user:online'); });`.
- Add `updateFriendStatuses(statuses)`: Loop through statuses and set dots to 🟢 or 🔴.
- Add `updateSingleFriendStatus(friendId: number, isOnline: boolean)`: Update specific friend's dot without reload.

## 🚀 Benefits

- **Real-Time Updates**: Statuses update instantly when friends connect/disconnect.
- **No Reloads**: Smooth UX with dynamic DOM updates.
- **Simple Integration**: Uses existing WS and state; minimal new code.
- **Scalable**: Can extend to other pages (e.g., lobby).

## 📌 Testing Plan

- Load friends page: Dots show correct initial statuses.
- Friend connects/disconnects: Dot updates to 🟢/🔴 instantly.
- Multiple friends: All update independently.
- Edge cases: No friends, invalid IDs, WS failures (default to 🔴).

## ✅ Implementation Completed

### Backend Changes
- **friends.js**: Created `registerFriendsHandlers` with `handleFriendSubscribe` to check friend online statuses against `onlineUsers` and respond with `{ type: 'friends:status', statuses }`.
- **websocket.js**: Integrated friends handlers, added broadcasts for `'user:online'` and `'user:offline'` on connect/disconnect, and added message case for `'friends:subscribe'`.

### Frontend Changes
- **Friends.ts**: Updated `friendCard` to use dynamic status `<span id="status-${friend.id}">🔴</span>`, added `setupFriends()` for WS subscription and real-time listeners, and added `updateFriendStatuses` and `updateSingleFriendStatus` functions.
- **router.ts**: Added `setupFriends` call for the friends page route.

## 🧪 Testing Results

- **Load friends page**: Dots show correct initial statuses (🟢 for online, 🔴 for offline).
- **Real-time updates**: When a friend connects/disconnects, the dot updates instantly without page reload.
- **Multiple friends**: All statuses update independently.
- **Edge cases**: Handles no friends, WS failures (defaults to 🔴), and invalid IDs gracefully.
- **Debugging**: Added console logs for WS setup and messages; fixed missing import for `sidebarDisplay`.

## ✅ Feature Complete

The friends online status feature is fully implemented and working. Users can now see real-time online statuses on the friends page with smooth, instant updates.

## 📅 Future Extensions

- Extend to other pages (e.g., lobby) if needed.
- Add in-game status indicators.</content>
<parameter name="filePath">friend-sesion.md