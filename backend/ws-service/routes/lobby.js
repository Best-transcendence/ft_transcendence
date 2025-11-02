// ws-service/routes/lobby.js
import { addLobbyUser, removeLobbyUser, getLobbyUsers, lobbyUsers } from '../state/user.js';
import { WebSocket } from 'ws';

// Send the lobby list to one client (excluding themselves)
function sendLobbyList(ws) {
  const all = getLobbyUsers();
  const filtered = all.filter(u => u.id !== ws.user.id);
  ws.send(JSON.stringify({ type: 'user:list', users: filtered }));
}

// Broadcast lobby list to all lobby members
export function broadcastLobby() {
  for (const [, recipient] of lobbyUsers) {
    if (recipient.readyState === WebSocket.OPEN) {
      sendLobbyList(recipient);
    }
  }
}

// Register lobby message handlers
export function registerLobbyHandlers(wss, app) {
  return {
    'lobby:join': (ws) => {
      addLobbyUser(ws.user.id, ws);
      broadcastLobby();
    },
    'lobby:leave': (ws) => {
      removeLobbyUser(ws.user.id);
      broadcastLobby();
    },
    'user:list:request': (ws) => {
      sendLobbyList(ws);
    },
    // Called on disconnect
    cleanup: (ws) => {
      removeLobbyUser(ws.user.id);
      broadcastLobby();
    }
  };
}
