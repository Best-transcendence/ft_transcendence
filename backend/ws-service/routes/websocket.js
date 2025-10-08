import jwt from 'jsonwebtoken';
import { registerRoomHandlers } from './rooms.js';

const onlineUsers = new Map();

export function registerWebsocketHandlers(wss, app) {
  const roomHandlers = registerRoomHandlers(wss, onlineUsers, app);

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    app.log.info({ token: token || 'MISSING' }, 'Incoming WS token');

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      ws.user = payload;

      // Save the user Id as string
      onlineUsers.set(String(ws.user.id), ws);

      app.log.info({ userId: ws.user.id }, ' WS Connected');
      ws.send(JSON.stringify({ type: 'welcome', user: payload }));
      broadcastUsers();

      // Message Handler.
      ws.on('message', (msg) => {
        try {
          const data = JSON.parse(msg);

          switch (data.type) {
            case 'invite':
              roomHandlers.handleInvite(ws, {
                ...data,
                to: String(data.to), // Make sure the id is a string
              });
              break;

            case 'invite:accepted':
              roomHandlers.handleInviteAccepted(ws, {
                ...data,
                from: String(data.from), // Make sure from is string.
              });
              break;

            case 'invite:declined':
              roomHandlers.handleInviteDeclined(ws, {
                ...data,
                from: String(data.from), // make sure again.
              });
              break;

            default:
              app.log.warn({ type: data.type }, 'Unhandled WS message');
          }
        } catch (e) {
          app.log.error('Bad WS message', e);
        }
      });

      ws.on('close', () => {
        // Delete id as string.
        onlineUsers.delete(String(ws.user.id));
        app.log.info({ userId: ws.user.id }, '❌ Disconnected');
        broadcastUsers();
      });
    } catch (err) {
      app.log.error({
        error: err.message,
        token: token ? 'Present' : 'Missing',
      }, 'Invalid WebSocket Token — closing connection');
      ws.close();
    }
  });

  function broadcastUsers() {
    const users = [...onlineUsers.values()].map((ws) => ({
      id: ws.user.id,
      name: ws.user.name,
    }));

    const payload = JSON.stringify({ type: 'user:list', users });
    for (const client of onlineUsers.values()) {
      if (client.readyState === 1) client.send(payload);
    }
  }
}