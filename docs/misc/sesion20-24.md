# Gateway + WebSocket Integration

## Modification Description

Prev declaration : This module implements a Lobby page that will reflect the users that join into the server with Fastify that routes requests to authentication and user microservices.

---

##  Implemented Features

- JWT validation with `fastify-jwt`
- WebSocket server on the same `httpServer`
- Socket authentication using JWT token
- Real-time transmission of connected users
- Visualization of the users online.
---

## Technical Challenges

________________________________________________________________________________________________________|
Challenge                     |                  Solution                                               |
________________________________________________________________________________________________________|
WebSocket was breaking login.  | ServerFactory was used to share the httpServer between Fastify and WS.
________________________________________________________________________________________________________
app.jwt.verify() was failing.  | The fastify-jwt plugin was successfully registered.
________________________________________________________________________________________________________
The lobby page was Not working | The token now is handled in the routes and not in the lobby page, so the
displaying the users logged.   | lobby page will just listen and verify that the jwt exist.
________________________________________________________________________________________________________
Eventhought without a loggin   | The verification was being handled in the wrong page, for this as soon as
the users appears as connected | the link, localhoost:3000/#lobby was open, the user appears as created.
but undefined.                 | change the handler of the ws.
________________________________________________________________________________________________________
They users where not           | Add a function in the ws.ts file to discconect users, of the websocket
dissconected after pushing     | and add it to the log out button.
the log out btn.
______________________________________________________________________________________________________

## Modificated Files.
1. Create a ws in services/ws.ts
2. Modificate the lobby page src/pages/lobby.ts
3. changes the routes to handle the ws.

## Ideas for Testing and Automation (Not implemented Yet)

### Manual

Using `wscat` to test WebSocket connections:

npm install -g wscat
wscat -c "ws://localhost:3003?token=YOUR_TOKEN"

### Usesful links.
[text](https://ably.com/topic/websockets)
[text](https://www.geeksforgeeks.org/web-tech/what-is-web-socket-and-how-it-is-different-from-the-http/)