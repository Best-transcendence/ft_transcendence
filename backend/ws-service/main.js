import { createServer } from 'http';
import Fastify from 'fastify';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { registerWebsocketHandlers } from './routes/websocket.js';
import fastifyCors from '@fastify/cors';

// Adding Env.
dotenv.config();

// Adding the app.log
const httpServer = createServer();
const app = Fastify({ logger: true });

app.server = httpServer; // Attach fastify to HTTP server

// Enable CORS
await app.register(fastifyCors, {
  origin: '*',
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
const wss = new WebSocketServer({ server: httpServer });

// Register WebSocket logic
registerWebsocketHandlers(wss, app);

const start = async () => {
  const port = process.env.WS_PORT || 4000;
  httpServer.listen(port, () => {
    app.log.info({
      port,
      url: `ws://localhost:${port}`
    },
    'Ws Service Running'
    );
  });
};

start();