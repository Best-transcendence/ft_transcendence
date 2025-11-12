// ws-service/routes/websocket.js
import jwt from 'jsonwebtoken';
import Vault from 'node-vault';
import { WebSocket } from 'ws';
import { registerRoomHandlers, rooms } from './rooms.js';
import { registerGameHandlers, saveRemoteMatch } from './game.js';
import { createLogger, ErrorType } from '../utils/logger.js';

const namesCache = new Map(); // userId(string) name

async function fetchUserName(app, userId) {
  const base = process.env.USER_SERVICE_URL || `http://user_service:${process.env.USER_SERVICE_PORT || 3002}`;
  try {
    const res = await fetch(`${base}/users/public/${userId}`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const user = await res.json();
    const name = user?.name ?? null;
    if (name) namesCache.set(String(userId), name);
    return name;
  } catch (err) {
    const correlationId = `fetch-user-${userId}-${Date.now()}`;
    app.log.warn({ userId, err: err.message }, 'Failed to fetch username');
    return null;
  }
}

async function fetchUserFriends(app, userId, token) {
  const base = process.env.USER_SERVICE_URL || 'http://localhost:3002';
  try {
    const res = await fetch(`${base}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    const friends = data.user?.friends?.map(f => f.id) || [];
    return friends;
  } catch (err) {
    const correlationId = `fetch-friends-${userId}-${Date.now()}`;
    app.log.warn({ userId, err: err.message }, 'Failed to fetch user friends');
    return [];
  }
}

const onlineUsers = new Map();

const lobbyUsers = new Map(); // track only users who are on lobby page

async function broadcastFriendStatus(app, userId, isOnline) {
  const friends = await fetchUserFriends(app, userId, onlineUsers.get(String(userId))?.user?.token);
  for (const friendId of friends) {
    const friendWs = onlineUsers.get(String(friendId));
    if (friendWs && friendWs.readyState === WebSocket.OPEN) {
      friendWs.send(JSON.stringify({ type: 'friends:status:update', userId, isOnline }));
    }
  }
}

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

export async function registerWebsocketHandlers(wss, app) {
  const logger = createLogger(app.log);

	const vault = Vault(
	{
		endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
		token: process.env.VAULT_TOKEN,
	});

	let jwtSecret;
	try
	{
		const secret = await vault.read('secret/data/jwt');
		jwtSecret = secret.data.data.JWT_SECRET;
	}
	catch (err)
	{
		const correlationId = `vault-${Date.now()}`;
		logger.error(correlationId, `Failed to read JWT secret from Vault: ${err.message}`, {
			errorType: ErrorType.EXTERNAL_SERVICE_ERROR,
			errorCode: 'VAULT_READ_ERROR',
			httpStatus: 500,
			metadata: { error: err.message }
		});
		console.error('Failed to read JWT secret from Vault:', err);
		process.exit(1);
	}

  const roomHandlers = registerRoomHandlers(wss, onlineUsers, app);
  const gameHandlers = registerGameHandlers(wss, onlineUsers, app);

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      const correlationId = `ws-auth-${Date.now()}`;
      logger.error(correlationId, 'Missing WebSocket token — closing connection', {
        errorType: ErrorType.AUTHENTICATION_ERROR,
        errorCode: 'MISSING_WEBSOCKET_TOKEN',
        httpStatus: 401,
        metadata: { ip: req.socket.remoteAddress }
      });
      ws.close();
      return;
    }

    // Verify & normalize JWT
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      const correlationId = `ws-auth-${Date.now()}`;
      logger.error(correlationId, `Invalid WebSocket Token — closing: ${err.message}`, {
        errorType: ErrorType.AUTHENTICATION_ERROR,
        errorCode: 'INVALID_WEBSOCKET_TOKEN',
        httpStatus: 401,
        metadata: { ip: req.socket.remoteAddress, error: err.message }
      });
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
      const correlationId = `ws-auth-${Date.now()}`;
      logger.error(correlationId, 'JWT missing user id — closing connection', {
        errorType: ErrorType.AUTHENTICATION_ERROR,
        errorCode: 'INVALID_TOKEN_PAYLOAD',
        httpStatus: 401,
        metadata: { decoded }
      });
      ws.close(1008, 'Invalid token payload');
      return;
    }

    // Track this connection (1 entry per user; last tab wins)
    onlineUsers.set(String(userId), ws);

    // Broadcast online status to friends
    await broadcastFriendStatus(app, userId, true);

    app.log.info({ userId }, 'WS connected');
    ws.send(JSON.stringify({ type: 'welcome', user: ws.user }));
    broadcastLobby();

    ws.on('message', async (raw) => {
      let data;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        const correlationId = `ws-msg-${Date.now()}`;
        logger.warn(correlationId, 'Invalid JSON message', {
          metadata: { raw: raw?.toString() }
        });
        return;
      }

      const type = data?.type;
      if (!type) {
        const correlationId = `ws-msg-${Date.now()}`;
        logger.warn(correlationId, 'Missing message type', {
          metadata: { raw: raw?.toString() }
        });
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

           case 'game:leave':
             gameHandlers.handleGameLeave(ws, { ...data, roomId: String(data.roomId) });
             break;

           case "lobby:leave":
            lobbyUsers.delete(ws.user.id);
            broadcastLobby();
            break;

           case 'friends:status:request': {
             const friends = await fetchUserFriends(app, ws.user.id, ws.user.token);
             const statuses = [];
             for (const friendId of friends) {
               const isOnline = onlineUsers.has(String(friendId));
               statuses.push({ userId: friendId, isOnline });
             }
             ws.send(JSON.stringify({ type: 'friends:status:response', friends: statuses }));
             break;
           }

           default:
             app.log.warn({ type }, 'Unhandled WS message');
        }
      } catch (err) {
        const correlationId = `ws-handler-${Date.now()}`;
        logger.error(correlationId, `Error handling WS message: ${err.message}`, {
          errorType: ErrorType.WEBSOCKET_ERROR,
          errorCode: 'MESSAGE_HANDLER_ERROR',
          httpStatus: 500,
          metadata: { type, error: err.message, userId: ws.user?.id }
        });
      }
    });

    ws.on('close', async () => {
      // Broadcast offline status to friends before cleanup
      await broadcastFriendStatus(app, ws.user.id, false);

      // cleanup both maps
      lobbyUsers.delete(ws.user.id);
      const current = onlineUsers.get(String(ws.user.id));
      if (current === ws) onlineUsers.delete(String(ws.user.id));

      // NEW: Handle game disconnection
      if (ws.roomId) {
        const room = rooms.get(ws.roomId);
        if (room && room.state && room.state.active) {
          // Clear game timers
          if (room.loopId) clearInterval(room.loopId);
          if (room.timerId) clearInterval(room.timerId);
          room.loopId = null;
          room.timerId = null;

          // Find remaining player
          const remainingPlayer = room.players.find(p => p !== ws);
          if (remainingPlayer) {
            // Declare remaining player as winner
            const winner = room.players.indexOf(remainingPlayer) === 0 ? 'p1' : 'p2';

            // Send game:end to remaining player
            remainingPlayer.send(JSON.stringify({
              type: 'game:end',
              winner: winner
            }));

            // Save match result
            const [p1, p2] = room.players;
            const sortedPlayers = [p1, p2].sort((a, b) => b.user.id - a.user.id);
            const [higherIdPlayer, lowerIdPlayer] = sortedPlayers;
            const score1 = higherIdPlayer === p1 ? room.state.s1 : room.state.s2;
            const score2 = higherIdPlayer === p1 ? room.state.s2 : room.state.s1;

            // Note: saveRemoteMatch is async, but we don't await in close handler
            saveRemoteMatch(app, higherIdPlayer, lowerIdPlayer, score1, score2);
          }

          // Clean up room
          room.state.active = false;
          rooms.delete(ws.roomId);
        }
      }

      broadcastLobby(); // update lists
      app.log.info({ userId: ws.user.id }, 'WS disconnected');
    });
  });
}
