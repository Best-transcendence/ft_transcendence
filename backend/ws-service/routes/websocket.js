// ws-service/routes/websocket.js
import jwt from 'jsonwebtoken';
import Vault from 'node-vault';
import { WebSocket } from 'ws';
import { registerRoomHandlers } from './rooms.js';
import { registerGameHandlers } from './game.js';
import { createLogger, ErrorType } from '../utils/logger.js';

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
    const correlationId = `fetch-user-${userId}-${Date.now()}`;
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

  wss.on('connection', (ws, req) => {
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

    app.log.info({ userId }, 'WS connected');
    ws.send(JSON.stringify({ type: 'welcome', user: ws.user }));
    broadcastLobby();

    ws.on('message', (raw) => {
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

          case "lobby:leave":
            lobbyUsers.delete(ws.user.id);
            broadcastLobby();
            break;

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

    ws.on('close', () => {
      // cleanup both maps
      lobbyUsers.delete(ws.user.id);
      const current = onlineUsers.get(String(ws.user.id));
      if (current === ws) onlineUsers.delete(String(ws.user.id));

      broadcastLobby(); // update lists
      app.log.info({ userId: ws.user.id }, 'WS disconnected');
    });
  });
}
