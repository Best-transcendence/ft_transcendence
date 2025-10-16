export const rooms = new Map(); // roomId -> { players: [...], state, loopId }

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

  return {
    handleInvite,
    handleInviteAccepted,
    handleInviteDeclined,
  };
}
