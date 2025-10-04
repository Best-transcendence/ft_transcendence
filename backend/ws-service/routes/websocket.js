// ws-service/routes/websocket.js
import jwt from 'jsonwebtoken';

const onlineUsers = new Map();

export function registerWebsocketHandlers(wss, app) {
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    app.log(
      {
        token: token ? token : 'MISSING'
      },
      'Incoming WS token'
    );
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      ws.user = payload;
      onlineUsers.set(ws.user.id, ws);

      app.log.info({
        userId: ws.user?.id || 'MISSING'
      },
        'Ws Connected'
      );
      ws.send(JSON.stringify({ type: 'welcome', user: payload }));

      broadcastUsers();

      ws.on('close', () => {
        onlineUsers.delete(ws.user.id);
        app.log.info({
          userId: ws.user?.id || 'MISSING',
          userName: ws.user?.name || 'Unknown'
        },
          'User Disconnected'
        );
        broadcastUsers();
      });
    } catch (err) {
      app.log.error({
        error: err.message,
        token: token ? 'Present' : 'Missing',
        ip: req.socket.remoteAddress // we can log the remote IP for failed connection.
      },
        'Invalid Websocket Token, Closing Connection'
      );
      ws.close();
    }
  });

  function broadcastUsers() {
    const users = [...onlineUsers.values()].map((ws) => ({
      id: ws.user.id,
      name: ws.user.name,
    }));

    onlineUsers.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'user:list', users }));
      }
    });
  }
}