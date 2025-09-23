# Gateway + WebSocket Integration

## Modification Description

Prev declaration : This module implements an API Gateway with Fastify that routes requests to authentication and user microservices.
Additionally: A WebSocket server has been integrated to manage real-time connections authenticated via JWT.

After that we change the lobbypage in the frontEnd. and the router in order to generate the token and connect with the ws.
---

## 🚀 Implemented Features

- JWT validation with `fastify-jwt`
- WebSocket server on the same `httpServer`
- Socket authentication using JWT token
- Real-time transmission of connected users

---

## Technical Challenges

______________________________________________________________________________________________________
Challenge                     |                  Solution
______________________________________________________________________________________________________
WebSocket was breaking login. | ServerFactory was used to share the httpServer between Fastify and WS.
app.jwt.verify() was failing. | The fastify-jwt plugin was successfully registered.
______________________________________________________________________________________________________

## Modificated Files.

// Create Fastify server instance with logging
const app = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  },
  ## //______________________ Part added _____________________
  serverFactory: (handler) => {
    // Create an HTTP server and let Fastify handle requests
    const server = createServer((req, res) => {
      handler(req, res);
    });

    // Attach WebSocket server to the same HTTP server
    const wss = new WebSocketServer({ server });
    setupWebSockets(wss);
  ## //______________________ Part added _____________________

    return server;
  },

});

### Part 252 // Websocket Logic....


## Ideas for Testing and Automation (Not implemented Yet)

### Usesful links.
[text](https://ably.com/topic/websockets)
[text](https://www.geeksforgeeks.org/web-tech/what-is-web-socket-and-how-it-is-different-from-the-http/)
### Manual

Using `wscat` to test WebSocket connections:

npm install -g wscat
wscat -c "ws://localhost:3003?token=YOUR_TOKEN"