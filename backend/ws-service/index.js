import { createServer } from 'http';
import Fastify from 'fastify';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const httpServer = createServer();
const app = Fastify();
app.server = httpServer; // Attach fastify to HTTP server

const wss = new WebSocketServer({ server: httpServer });
const onlineUsers = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  console.log('Incoming WS token:', token);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    ws.user = payload;
    onlineUsers.set(ws.user.id, ws);

    console.log(`WS connected: User ID ${ws.user.id}`);
    ws.send(JSON.stringify({ type: 'welcome', user: payload }));

    broadcastUsers();

    ws.on('close', () => {
      onlineUsers.delete(ws.user.id);
      console.log(` User disconnected: ${ws.user.name}`);
      broadcastUsers();
    });
  } catch(err) {
    console.log(' Invalid token, closing WS', err.message);
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
    console.log(` WS Service running on ws://localhost:${port}`);
  });
};

start();
