// ws-service/routes/websocket.js
import jwt from 'jsonwebtoken';
import { WebSocket } from 'ws';
import { registerRoomHandlers } from './rooms.js';
import { registerGameHandlers } from './game.js';
import { registerFriendsHandlers } from './friends.js';

const namesCache = new Map(); // userId(string) name

async function fetchUserName(app, userId) {
  const base = process.env.USER_SERVICE_URL || 'http://localhost:3002';
  try {
    const res = await fetch(`${base}/users/public/${userId}`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const user = await res.json();
    const name = user?.name ?? null;
    if (name) namesCache.set(String(userId), name);
    return name;
  } catch (err) {
    app.log.warn({ userId, err: err.message }, 'Failed to fetch username');
    return null;
  }
}

//TODO show friends' online status
const onlineUsers = new Map();

// TODO delete if you don't use for checking online friends
function getAllUsers() {
  return [...onlineUsers.values()].map(s => {
    const id = s.user.id;
    const name = s.user.name ?? namesCache.get(String(id)) ?? null;
    return { id, name };
  });
}

function sendUserList(ws) {
  const all = getAllUsers();
  const filtered = all.filter(u => u.id !== ws.user.id); // hide self
  ws.send(JSON.stringify({ type: 'user:list', users: filtered }));
}
const lobbyUsers = new Map(); // track only users who are on lobby page


// Build lobby list
function getLobbyUsers() {
  return [...lobbyUsers.values()].map(s => {
    const id = s.user.id;
    const name = s.user.name ?? namesCache.get(String(id)) ?? null;
    return { id, name };
  });
}

// Send lobby list to one client (excluding themselves)
function sendLobbyList(ws) {
  const all = getLobbyUsers();
  const filtered = all.filter(u => u.id !== ws.user.id);
  ws.send(JSON.stringify({ type: 'user:list', users: filtered }));
}

// Broadcast lobby list to all lobby members (each gets a list without themselves)
function broadcastLobby() {
  for (const [, recipient] of lobbyUsers) {
    if (recipient.readyState === WebSocket.OPEN) {
      sendLobbyList(recipient);
    }
  }
}

export function registerWebsocketHandlers(wss, app) {
  const roomHandlers = registerRoomHandlers(wss, onlineUsers, app);
  const gameHandlers = registerGameHandlers(wss, onlineUsers, app);
  const friendsHandlers = registerFriendsHandlers(wss, app);

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      app.log.warn({ ip: req.socket.remoteAddress }, 'Missing WebSocket token — closing connection');
      ws.close();
      return;
    }

    // Verify & normalize JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      app.log.error({ error: err.message, ip: req.socket.remoteAddress }, 'Invalid WebSocket Token — closing');
      ws.close(1008, 'Invalid or expired token');
      return;
    }

    // existing normalization
    const userId = Number(decoded.id ?? decoded.userId ?? decoded.userID ?? decoded.sub);
    const tokenFromQuery = token; // keep the raw token for user-service

    // prefer a claim name if present; otherwise try cache
    let displayName =
      decoded.name ?? decoded.username ?? namesCache.get(String(userId)) ?? null;

    // Store user info including token for 1v1 match history saving
    // The token is needed to authenticate match save requests to user-service
    ws.user = { id: userId, name: displayName, token: tokenFromQuery };
    onlineUsers.set(String(userId), ws);

    // Broadcast online status
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'user:online', userId }));
      }
    });

    // kick off async hydration if name is still missing
    if (!ws.user.name) {
      (async () => {
        const resolved = await fetchUserName(app, userId, tokenFromQuery);
        if (resolved && ws.readyState === WebSocket.OPEN) {
          ws.user.name = resolved;
          // update the cache and rebroadcast so everyone sees the real name
          namesCache.set(String(userId), resolved);
          broadcastLobby();
        }
      })();
    }

    if (!userId || Number.isNaN(userId)) {
      app.log.warn({ decoded }, 'JWT missing user id — closing connection');
      ws.close(1008, 'Invalid token payload');
      return;
    }

    // Track this connection (1 entry per user; last tab wins)
    onlineUsers.set(String(userId), ws);

    app.log.info({ userId }, 'WS connected');
    ws.send(JSON.stringify({ type: 'welcome', user: ws.user }));
    broadcastLobby();

    ws.on('message', (raw) => {
      let data;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        app.log.warn({ raw: raw?.toString() }, 'Invalid JSON message');
        return;
      }

      const type = data?.type;
      if (!type) {
        app.log.warn({ raw: raw?.toString() }, 'Missing message type');
        return;
      }


      //Lobby presence messages
      if (type === 'lobby:join') {
        lobbyUsers.set(ws.user.id, ws);
        broadcastLobby();
        return;
      }
      if (type === 'lobby:leave') {
        lobbyUsers.delete(ws.user.id);
        broadcastLobby();
        return;
      }
      if (type === 'user:list:request') {
        // Send lobby-only list
        sendLobbyList(ws);
        return;
      }
      try {
        switch (type) {
          case 'invite':
          case 'invite:send': {
            // --- Self-invite & existence guard here ---
            const toUserId = Number(data.to ?? data.toUserId);
            const fromUserId = ws.user.id;

            if (!toUserId || Number.isNaN(toUserId)) {
              ws.send(JSON.stringify({
                type: 'error',
                code: 'BAD_INVITE',
                message: 'Invalid target user.',
              }));
              break;
            }

            if (toUserId === fromUserId) {
              ws.send(JSON.stringify({
                type: 'error',
                code: 'SELF_INVITE',
                message: 'You cannot invite yourself.',
              }));
              break;
            }

            // Only allow inviting players actually in the lobby
            const target = lobbyUsers.get(toUserId);
            if (!target || target.readyState !== WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                code: 'USER_NOT_IN_LOBBY',
                message: 'User is not in the lobby.',
              }));
              break;
            }

            // Proceed to handler after validation
            roomHandlers.handleInvite(ws, { ...data, to: String(toUserId) });
            break;
          }

          case 'invite:accepted':
            roomHandlers.handleInviteAccepted(ws, { from: String(data.from) });
            break;

          case 'invite:declined':
            roomHandlers.handleInviteDeclined(ws, { from: String(data.from) });
            break;

          case 'game:join':
            gameHandlers.handleGameJoin(ws, { ...data, roomId: String(data.roomId) });
            break;

          case 'matchmaking:join':
            // If you consider matchmaking leaving the lobby:
            lobbyUsers.delete(ws.user.id);
            broadcastLobby();
            roomHandlers.handleMatchmakingJoin(ws);
            break;

          case 'matchmaking:leave':
            roomHandlers.handleMatchmakingLeave(ws);
            break;

          case 'game:move':
            gameHandlers.handleGameMove(ws, {
              ...data,
              roomId: String(data.roomId),
              direction: data.direction,
            });
            break;
          case 'game:begin':
            gameHandlers.handleGameBegin(ws, data);
            break;

           case "lobby:leave":
             lobbyUsers.delete(ws.user.id);
             broadcastLobby();
             break;
           case 'friends:subscribe':
             friendsHandlers.handleFriendSubscribe(ws, data);
             break;

           default:
             app.log.warn({ type }, 'Unhandled WS message');
        }
      } catch (err) {
        app.log.error({ error: err.message, type }, 'Error handling WS message');
      }
    });

    ws.on('close', () => {
      // Broadcast offline status before cleanup
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'user:offline', userId: ws.user.id }));
        }
      });

      // cleanup both maps
      lobbyUsers.delete(ws.user.id);
      const current = onlineUsers.get(String(ws.user.id));
      if (current === ws) onlineUsers.delete(String(ws.user.id));

      broadcastLobby(); // update lists
      app.log.info({ userId: ws.user.id }, 'WS disconnected');
    });
  });
}