import jwt from 'jsonwebtoken';
import { registerRoomHandlers } from './rooms.js';
import { registerGameHandlers } from './game.js';
import { registerLobbyHandlers, broadcastLobby } from './lobby.js';
import { registerFriendsHandlers } from './friends.js';
import {
  addOnlineUser,
  removeOnlineUser,
  cacheUserName,
  getUserName,
  fetchUserName
} from '../state/user.js';
import { onWsConnected } from '../state/session.js';

export function registerWebsocketHandlers(wss, app) {
  const roomHandlers = registerRoomHandlers(wss, app);
  const gameHandlers = registerGameHandlers(wss, app);
  const lobbyHandlers = registerLobbyHandlers(wss, app);
  const friendsHandlers = registerFriendsHandlers(wss, app);

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      app.log.warn({ ip: req.socket.remoteAddress }, 'Missing WebSocket token — closing connection');
      ws.close();
      return;
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      app.log.error({ error: err.message, ip: req.socket.remoteAddress }, 'Invalid WebSocket Token — closing');
      ws.close(1008, 'Invalid or expired token');
      return;
    }

    const userId = Number(decoded.id ?? decoded.userId ?? decoded.userID ?? decoded.sub);
    if (!userId || Number.isNaN(userId)) {
      app.log.warn({ decoded }, 'JWT missing user id — closing connection');
      ws.close(1008, 'Invalid token payload');
      return;
    }

    // Attach user info
    let displayName = decoded.name ?? decoded.username ?? getUserName(userId) ?? null;
    // ws.user = { id: userId, name: displayName };
    // Store user info including token for 1v1 match history saving
    // The token is needed to authenticate match save requests to user-service
    ws.user = { id: userId, name: displayName, token: tokenFromQuery };
    onlineUsers.set(String(userId), ws);

    addOnlineUser(userId, ws);
    // Broadcast online status
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'user:online', userId }));
      }
    });
    onWsConnected(ws);
    // Hydrate name if missing
    if (!ws.user.name) {
      (async () => {
        const resolved = await fetchUserName(app, userId, token);
        if (resolved && ws.readyState === ws.OPEN) {
          ws.user.name = resolved;
          cacheUserName(userId, resolved);
          broadcastLobby();
        }
      })();
    }

    app.log.info({ userId }, 'WS connected');
    ws.send(JSON.stringify({ type: 'welcome', user: ws.user }));
    broadcastLobby();

    // ---------------- Message handling ----------------
    ws.on('message', (raw) => {
      let data;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        app.log.warn({ raw: raw?.toString() }, 'Invalid JSON message');
        return;
      }

      const type = data?.type;
      if (!type) return;

      // Delegate to lobby
      if (lobbyHandlers[type]) return lobbyHandlers[type](ws, data);

      // Delegate to rooms/game
      try {
        switch (type) {
        case 'invite':
        case 'invite:send':
          roomHandlers.handleInvite(ws, data);
          break;
        case 'invite:accepted':
          roomHandlers.handleInviteAccepted(ws, data);
          break;
        case 'invite:declined':
          roomHandlers.handleInviteDeclined(ws, data);
          break;
        case 'game:join':
          gameHandlers.handleGameJoin(ws, { ...data, roomId: String(data.roomId) });
          break;
        case 'game:leave':
          gameHandlers.handleGameLeave(ws, data);
          break;

        case 'matchmaking:join':
          lobbyHandlers['lobby:leave'](ws); // leave lobby before matchmaking
          roomHandlers.handleMatchmakingJoin(ws);
          break;
        case 'matchmaking:leave':
          roomHandlers.handleMatchmakingLeave(ws);
          break;
        case 'game:move':
          gameHandlers.handleGameMove(ws, { ...data, roomId: String(data.roomId), direction: data.direction });
          break;
        case 'game:begin':
          gameHandlers.handleGameBegin(ws, data);
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

    // ---------------- Cleanup ----------------
    ws.on('close', () => {
      // Broadcast offline status before cleanup
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'user:offline', userId: ws.user.id }));
        }
      });
      lobbyHandlers.cleanup(ws);
      removeOnlineUser(ws.user.id, ws);
      roomHandlers.handleDisconnect(ws);
      app.log.info({ userId: ws.user.id }, 'WS disconnected');
    });
  });
}
