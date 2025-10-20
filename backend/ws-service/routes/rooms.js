export const rooms = new Map(); // roomId -> { players: [...], state, loopId }
const queue = []; //Queu created to wait players for Quick Game

export function makeRoomId(a, b) {
  const [x, y] = [Number(a), Number(b)].sort((m, n) => m - n);
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `room-${x}-${y}-${timestamp}-${random}`;
}

export function registerRoomHandlers(wss, onlineUsers, app) {
  function handleInvite(ws, data) {
    const { to } = data;
    const target = onlineUsers.get(String(to));

    if (!target || target.readyState !== target.OPEN) {
      ws.send(JSON.stringify({ type: 'invite:error', reason: 'offline' }));
      app.log.warn(`Invite failed: user ${to} not available`);
      return;
    }

    try {
      target.send(JSON.stringify({
        type: 'invite:received',
        from: { id: ws.user.id, name: ws.user.name },
      }));
      app.log.info(`Invite sent from ${ws.user.id} to ${to}`);
    } catch (err) {
      app.log.error({ err }, `Failed to send invite to ${to}`);
    }
  }

  function handleInviteAccepted(ws, data) {
    const { from } = data;
    const inviter = onlineUsers.get(from);
    if (!inviter) return;

    // Check if a room already exists with these two players
    for (const [roomId, room] of rooms.entries()) {
      const ids = room.players.map(p => p.user.id);
      if (ids.includes(from) && ids.includes(ws.user.id)) {
        app.log.warn(`Duplicate invite acceptance ignored for ${from} vs ${ws.user.id}`);
        return;
      }
    }

    const roomId = makeRoomId(from, ws.user.id);
    rooms.set(roomId, {
      players: [inviter, ws],
      state: null,
      loopId: null,
    });

    [inviter, ws].forEach(client =>
      client.send(JSON.stringify({
        type: 'room:start',
        roomId,
        players: [from, ws.user.id],
      }))
    );

    app.log.info(`Room created: ${roomId} (${from} vs ${ws.user.id})`);
  }


  function handleInviteDeclined(ws, data) {
    const { from } = data;
    const inviter = onlineUsers.get(String(from));
    if (inviter && inviter.readyState === inviter.OPEN) {
      try {
        inviter.send(JSON.stringify({
          type: 'invite:declined',
          from: ws.user.id,
        }));
      } catch (err) {
        app.log.error({ err }, 'Failed to notify invite declined');
      }
    }
  }

  function handleMatchmakingJoin(ws) {
    if (queue.find(p => p.user.id === ws.user.id)) return;

    queue.push(ws);
    ws.send(JSON.stringify({ type: "matchmaking:searching" })); // fixed
    app.log.info(`User ${ws.user.id} joined matchmaking queue`);

    if (queue.length >= 2) { // fixed
      const p1 = queue.shift();
      const p2 = queue.shift();

      const roomId = makeRoomId(p1.user.id, p2.user.id);
      rooms.set(roomId, { players: [p1, p2], state: null, loopId: null });

      [p1, p2].forEach(client => {
        client.send(JSON.stringify({
          type: "room:start",
          roomId,
          players: [p1.user.id, p2.user.id],
        }));
        app.log.info(`Sent room:start to user ${client.user.id}`);
      });

      app.log.info(`Quick Game room created: ${roomId} (${p1.user.id} vs ${p2.user.id})`);
    }
  }

  function handleMatchmakingLeave(ws) {
    const idx = queue.findIndex(p => p.user.id === ws.user.id);
    if (idx !== -1) {
      queue.splice(idx, 1);
      ws.send(JSON.stringify({ type: "matchmaking:cancelled" }));
      app.log.info(`User ${ws.user.id} left matchmaking queue`);
    }
  }


  return {
    handleInvite,
    handleInviteAccepted,
    handleInviteDeclined,
    handleMatchmakingJoin, // New handler.
    handleMatchmakingLeave, // leave the queue
  };
}
