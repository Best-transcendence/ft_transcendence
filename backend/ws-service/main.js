import { createServer } from 'http';
import Fastify from 'fastify';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


// Adding Env.
dotenv.config();

// Adding the app.log
const httpServer = createServer();
const app = Fastify({ logger: true });

app.server = httpServer; // Attach fastify to HTTP server

const wss = new WebSocketServer({ server: httpServer });
const onlineUsers = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  app.log(
    {
      token: token ? token : 'MISSING'
    },
    'Incoming WS token'
  )
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    ws.user = payload;
    onlineUsers.set(ws.user.id, ws);

    app.log.info({
      userId: ws.user?.id || "MISSING"
    },
      'Ws Connected'
    )
    ws.send(JSON.stringify({ type: 'welcome', user: payload }));

    broadcastUsers();

    ws.on('close', () => {
      onlineUsers.delete(ws.user.id);
      app.log.info({
        userId: ws.user?.id || "MISSING",
        userName: ws.user?.name || "Unknown"
      },
        'User Disconnected'
      )
      broadcastUsers();
    });
  } catch (err) {
    app.log.error({
      error: err.message,
      token: token ? 'Present' : 'Missing',
      ip: req.socket.remoteAddress // we can log the remote IP for failed connection.
    },
      'Invalid Websocket Token, Closing Connection'
    )
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

const start = async () => {
  const port = process.env.WS_PORT || 4000;
  httpServer.listen(port, () => {
    app.log.info({
      port,
      url: `ws://localhost:${port}`
    },
      'Ws Service Running'
    )
  });
};


