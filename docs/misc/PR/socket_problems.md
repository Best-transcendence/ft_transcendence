- socket doesn't connect, just if I reload the page (do we need to fix?)
- set the timer and game flow 
- set back the overlay page in the correct way
- fix the size of the design how it is on the other pages
- it's supposed to only show whoever online AND in the lobby page ✅
- if I'm a new user it'll show my on profile beetween the online users (it should exclude my own profile) ✅
- it doesn't show the usernames ✅

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

// users.js
fastify.get('/public/:authUserId', {
