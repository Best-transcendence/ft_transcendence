import { v4 as uuidv4 } from 'uuid';

export const rooms = new Map(); // roomId -> { players: [...], state: {...} }

export function registerRoomHandlers(wss, onlineUsers, app) {
  function handleInvite(ws, data) {
    const { to } = data;
    const target = onlineUsers.get(to);
    if (!target) {
      app.log.error(`User ${to} not found in onlineUsers`);
      return;
    }

    target.send(
      JSON.stringify({
        type: 'invite:received',
        from: { id: ws.user.id, name: ws.user.name },
      })
    );
    app.log.info(` Invite sent from ${ws.user.id} to ${to}`);
  }

  function handleInviteAccepted(ws, data) {
    const { from } = data;
    const inviter = onlineUsers.get(from);
    if (!inviter) return;

    const roomId = uuidv4();
    rooms.set(roomId, {
      players: [inviter, ws],
    });

    [inviter, ws].forEach((client) =>
      client.send(
        JSON.stringify({
          type: 'room:start',
          roomId,
          players: [from, ws.user.id],
        })
      )
    );

    app.log.info(` Room created: ${roomId} (${from} vs ${ws.user.id})`);
  }

  function handleInviteDeclined(ws, data) {
    const { from } = data;
    const inviter = onlineUsers.get(from);
    if (inviter) {
      inviter.send(
        JSON.stringify({
          type: 'invite:declined',
          from: ws.user.id,
        })
      );
    }
  }

  return {
    handleInvite,
    handleInviteAccepted,
    handleInviteDeclined,
  };
}