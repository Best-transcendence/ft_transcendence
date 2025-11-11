import jwt from 'jsonwebtoken';
import Vault from 'node-vault';
import { registerRoomHandlers } from './rooms.js';
import { registerGameHandlers } from './game.js';

const onlineUsers = new Map();

export async function registerWebsocketHandlers(wss, app) {

  const vault = Vault(
    {
      endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
      token: process.env.VAULT_TOKEN
    });

  let jwtSecret;
  try
  {
    const secret = await vault.read('secret/data/jwt');
    jwtSecret = secret.data.data.JWT_SECRET;
  }
  catch (err)
  {
    console.error('Failed to read JWT secret from Vault:', err);
    process.exit(1);
  }

  const roomHandlers = registerRoomHandlers(wss, onlineUsers, app);
  const gameHandlers = registerGameHandlers(wss, onlineUsers, app);

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    app.log.info({ token: token || 'MISSING' }, 'Incoming WS token');

    try {
	  const payload = jwt.verify(token, jwtSecret);
      ws.user = payload;

      // Guardar el usuario conectado
      onlineUsers.set(String(ws.user.id), ws);
      app.log.info({ userId: ws.user.id }, ' WS Connected');

      ws.send(JSON.stringify({ type: 'welcome', user: payload }));
      broadcastUsers();

      // Escuchar mensajes entrantes
      ws.on('message', (msg) => {
        try {
          const data = JSON.parse(msg);

          switch (data.type) {
          case 'invite':
            roomHandlers.handleInvite(ws, {
              ...data,
              to: String(data.to),
            });
            break;

          case 'invite:accepted':
            roomHandlers.handleInviteAccepted(ws, {
              ...data,
              from: String(data.from),
            });
            break;

          case 'invite:declined':
            roomHandlers.handleInviteDeclined(ws, {
              ...data,
              from: String(data.from),
            });
            break;

            //  Lógica de juego
          case 'game:join':
            gameHandlers.handleGameJoin(ws, {
              ...data,
              roomId: String(data.roomId),
            });
            break;

          case 'game:move':
            gameHandlers.handleGameMove(ws, {
              ...data,
              roomId: String(data.roomId),
              direction: data.direction,
            });
            break;

          default:
            app.log.warn({ type: data.type }, ' Unhandled WS message');
          }
        } catch (e) {
          app.log.error(' Bad WS message', e);
        }
      });

      // Desconexión del cliente
      ws.on('close', () => {
        onlineUsers.delete(String(ws.user.id));
        app.log.info({ userId: ws.user.id }, ' Disconnected');
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
