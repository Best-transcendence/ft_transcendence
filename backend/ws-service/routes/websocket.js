// ws-service/routes/websocket.js
import jwt from 'jsonwebtoken';
import { WebSocket } from 'ws';
import { registerRoomHandlers } from './rooms.js';
import { registerGameHandlers } from './game.js';

const onlineUsers = new Map();

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

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      app.log.error({
        error: err.message,
        token: 'Present',
        ip: req.socket.remoteAddress,
      }, 'Invalid WebSocket Token — closing connection');
      ws.close();
      return;
    }

    ws.user = payload;
    onlineUsers.set(String(ws.user.id), ws);

    app.log.info({ userId: ws.user.id }, 'WS Connected');
    ws.send(JSON.stringify({ type: 'welcome', user: payload }));
    broadcastUsers();

    ws.on('message', (raw) => {
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        app.log.warn({ raw }, 'Invalid JSON message');
        return;
      }

      if (!data?.type) {
        app.log.warn({ raw }, 'Missing message type');
        return;
      }

      try {
        switch (data.type) {
          case 'invite':
          case 'invite:send':
            roomHandlers.handleInvite(ws, { ...data, to: String(data.to) });
            break;

          case 'invite:accepted':
            roomHandlers.handleInviteAccepted(ws, { from: String(data.from) });
            break;

          case 'invite:declined':
            roomHandlers.handleInviteDeclined(ws, { from: String(data.from) });
            break;

          case 'game:join':
            gameHandlers.handleGameJoin(ws, { ...data, roomId: String(data.roomId) });
            break;
          case "matchmaking:join":
            roomHandlers.handleMatchmakingJoin(ws);
            break;
          case "matchmaking:leave":
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
            app.log.warn({ type: data.type }, 'Unhandled WS message');
        }

      } catch (err) {
        app.log.error({ error: err.message, type: data.type }, 'Error handling WS message');
      }
    });

    ws.on('close', () => {
      onlineUsers.delete(String(ws.user.id));
      app.log.info({ userId: ws.user.id }, 'WS Disconnected');
      broadcastUsers();
    });
  });

  function broadcastUsers() {
    const users = [...onlineUsers.values()].map(ws => ({
      id: ws.user.id,
      name: ws.user.name,
    }));
    const payload = JSON.stringify({ type: 'user:list', users });

    for (const client of onlineUsers.values()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }
}
