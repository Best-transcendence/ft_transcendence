backend env.js everywhere

main.js 
// Register CORS plugin
await app.register(fastifyCors, {
  origin: [
    `http://${process.env.LAN_IP || 'localhost'}:${process.env.FRONTEND_PORT || 3000}`,  // Frontend
    `http://${process.env.LAN_IP || 'localhost'}:${process.env.AUTH_SERVICE_PORT || 3001}`,  // Auth service
    `http://${process.env.LAN_IP || 'localhost'}:${process.env.USER_SERVICE_PORT || 3002}`   // User service
  ],
  credentials: true
});

.env everywhere maybe get it from variabl from PC 


GameIntroPage
ws.ts


ws-service

websocket created here:
const wss = new WebSocketServer({ server: app.server });

// Register WebSocket logic
registerWebsocketHandlers(wss, app);
