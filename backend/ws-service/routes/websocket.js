// ws-service/routes/websocket.js
import jwt from 'jsonwebtoken';

const onlineUsers = new Map();

export function registerWebsocketHandlers(wss, app) {
	  // unique room ID string for the players playing a match together
  const makeRoomId = (a, b) => {
    const [x, y] = [Number(a) || 0, Number(b) || 0].sort((m, n) => m - n);
    return `room-${x}-${y}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; // timestamp encoded in base-36 and six random number 
  };

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    app.log.info(
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
     
      ws.on('message', (raw) => {
        
		// handle client messages
		let msg;
        try { msg = JSON.parse(raw); } catch { return; }

        // Simple router for WS messages
        switch (msg.type) {

        
			// SENDER -> SERVER: invite someone to play
			// payload: { type: 'invite:send', to: <userId> }
          case 'invite:send': {
            const toId = Number(msg.to);

            const target = onlineUsers.get(toId);
            if (target && target.readyState === 1) {
              // Forward to the target player
              target.send(JSON.stringify({
                type: 'invite:incoming',
                from: { id: ws.user.id, name: ws.user.name },
              }));
            } else {
              // Optionally tell sender that user is offline/unavailable
              ws.send(JSON.stringify({ type: 'invite:error', reason: 'offline' }));
            }
            break;
          }

        
			// TARGET -> SERVER: reply to an invite
			// payload: { type: 'invite:response', to: <inviterId>, accepted: true|false
          case 'invite:response': {
            const inviterId = Number(msg.to);
            const inviter = onlineUsers.get(inviterId);
            const accepted = !!msg.accepted;

            if (inviter && inviter.readyState === 1) {
              if (accepted) {
                // Create a room and notify BOTH sides to join
                const roomId = makeRoomId(inviterId, ws.user.id);

                // Notify inviter (the original sender)
                inviter.send(JSON.stringify({
                  type: 'invite:accepted',
                  roomId,
                  with: { id: ws.user.id, name: ws.user.name }
                }));

                // Notify invitee (the responder)
                ws.send(JSON.stringify({
                  type: 'invite:accepted',
                  roomId,
                  with: { id: inviterId, name: inviter?.user?.name }
                }));
              } else {
                // Let the inviter know the invite was declined
                inviter.send(JSON.stringify({
                  type: 'invite:declined',
                  from: { id: ws.user.id, name: ws.user.name }
                }));
              }
            }
            break;
          }

          default:
            // ignore unknown message types
            break;
        }
      });

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