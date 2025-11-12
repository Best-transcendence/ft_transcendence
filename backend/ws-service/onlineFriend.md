Planning friend status indicators
- The task involves creating dynamic online status indicators for friends, showing green dots for online and red dots for offline.
Plan for Friend Online Status Indicators
Current State Analysis
Frontend (Friends.ts):
- Shows hardcoded green dot (🟢) for all friends
- No dynamic status updates
- No WebSocket integration for friend status
Backend (websocket.js):
- onlineUsers Map tracks all connected WebSocket users
- lobbyUsers Map tracks users specifically on lobby page
- No friend-specific status broadcasting
Requirements
- ✅ Show green dot for online friends
- ✅ Show red dot for offline friends  
- ✅ Update dynamically when friends connect/disconnect
- ✅ Preserve status on page refresh
- ✅ No page refresh required for updates
Implementation Plan
1. Backend Changes (websocket.js)
Add Friend Status Broadcasting:
- Create broadcastFriendStatus(userId, isOnline) function
- When user connects: broadcast online status to friends
- When user disconnects: broadcast offline status to friends
- Need to fetch user's friends list from user-service API
New WebSocket Message Types:
- friends:status:update - Send to friends when status changes
- friends:status:request - Frontend requests current status of all friends
- friends:status:response - Backend responds with current friend statuses
Integration Points:
- On connection: Add to onlineUsers, broadcast online to friends
- On disconnection: Remove from onlineUsers, broadcast offline to friends
- Add new message handlers for friend status requests
2. Frontend Changes (Friends.ts)
Dynamic Status Updates:
- Replace hardcoded green dot with dynamic status element
- Add WebSocket listener for friends:status:update messages
- Update friend cards in real-time when status changes
Page Load Handling:
- On friends page load, send friends:status:request to get current statuses
- Update all friend cards based on response
- Handle page refresh by re-requesting statuses
UI Changes:
- Change friend card to use dynamic status indicator
- Add CSS classes for online/offline states
- Ensure status persists across page navigation
3. API Integration
User Service Calls:
- Need endpoint to get user's friends list for broadcasting
- Backend will call user-service to get friends when user connects
WebSocket Message Flow:
User A connects → Backend gets A's friends → Broadcast "A is online" to friends
User A disconnects → Backend broadcasts "A is offline" to friends  
Friends page loads → Frontend requests status → Backend responds with all friends' status
4. Data Structures
WebSocket Messages:
// Status update to friends
{ type: 'friends:status:update', userId: 123, isOnline: true }
// Request current status
{ type: 'friends:status:request' }
// Response with all friends' status
{ type: 'friends:status:response', friends: [{userId: 123, isOnline: true}, ...] }
Frontend State:
- Track friend online status in a Map or object
- Update DOM elements based on status changes
5. Edge Cases & Considerations
Race Conditions:
- Handle multiple tabs/windows per user
- Ensure status updates are atomic
Performance:
- Only broadcast to actual friends, not all users
- Cache friend lists where possible
Page Refresh:
- Status should be preserved/restored on refresh
- Handle case where WebSocket reconnects after refresh
Offline Detection:
- Use WebSocket disconnect as offline indicator
- Consider heartbeat mechanism for more accurate detection
Implementation Steps
1. Backend API Integration: Add function to fetch user's friends
2. Backend Broadcasting: Implement status broadcast functions  
3. Backend Message Handlers: Add friend status WebSocket handlers
4. Frontend WebSocket: Add listeners for friend status messages
5. Frontend UI: Make status indicators dynamic
6. Frontend State: Track and update friend statuses
7. Testing: Verify real-time updates and page refresh behavior
Files to Modify
- backend/ws-service/routes/websocket.js - Add broadcasting and message handlers
- frontend/src/pages/Friends.ts - Add dynamic status updates
- frontend/src/services/ws.js - Add WebSocket message handling (if needed)
Success Criteria
- ✅ Friends show green dots when online
- ✅ Friends show red dots when offline
- ✅ Status updates instantly when friends connect/disconnect
- ✅ Status preserved on page refresh
- ✅ No performance impact on non-friends
- ✅ Works across multiple tabs/windows
This plan provides a comprehensive solution for real-time friend online status indicators with proper handling of page refreshes and dynamic updates.
