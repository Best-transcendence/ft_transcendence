// ws-service/routes/websocket.js
import jwt from 'jsonwebtoken';
import { WebSocket } from 'ws';
import { registerRoomHandlers } from './rooms.js';
import { registerGameHandlers } from './game.js';

const namesCache = new Map(); // userId(string) -> name

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

const onlineUsers = new Map();

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

function broadcastUsers() {
  // Tailor list per recipient to exclude themselves
  for (const [, recipient] of onlineUsers) {
    if (recipient.readyState === WebSocket.OPEN) {
      sendUserList(recipient);
    }
  }
}

export function registerWebsocketHandlers(wss, app) {
  const roomHandlers = registerRoomHandlers(wss, onlineUsers, app);
  const gameHandlers = registerGameHandlers(wss, onlineUsers, app);

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

	ws.user = { id: userId, name: displayName };
	onlineUsers.set(String(userId), ws);

	// kick off async hydration if name is still missing
	if (!ws.user.name) {
	(async () => {
		const resolved = await fetchUserName(app, userId, tokenFromQuery);
		if (resolved && ws.readyState === WebSocket.OPEN) {
		ws.user.name = resolved;
		// update the cache and rebroadcast so everyone sees the real name
		namesCache.set(String(userId), resolved);
		broadcastUsers();
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
    broadcastUsers();

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

      // Handle one-off utility first
      if (type === 'user:list:request') {
        sendUserList(ws);
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

            const target = onlineUsers.get(String(toUserId));
            if (!target || target.readyState !== WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                code: 'USER_OFFLINE',
                message: 'User is offline.',
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

          default:
            app.log.warn({ type }, 'Unhandled WS message');
        }
      } catch (err) {
        app.log.error({ error: err.message, type }, 'Error handling WS message');
      }
    });

    ws.on('close', () => {
      const current = onlineUsers.get(String(ws.user.id));
      if (current === ws) onlineUsers.delete(String(ws.user.id));
      broadcastUsers();
      app.log.info({ userId: ws.user.id }, 'WS disconnected');
    });
  });
}