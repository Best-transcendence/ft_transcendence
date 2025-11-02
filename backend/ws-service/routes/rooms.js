import { onlineUsers, lobbyUsers } from '../state/user.js';
import { WebSocket } from 'ws';

export const rooms = new Map(); // roomId -> { players: [...], state, loopId }
const queue = []; // Queue created to wait players for Quick Game

export function makeRoomId(a, b) {
  const [x, y] = [Number(a), Number(b)].sort((m, n) => m - n);
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `room-${x}-${y}-${timestamp}-${random}`;
}
export const userRoom = new Map();           // userId -> roomId|null
export const pendingKickIntro = new Set();   // userIds que deben volver al intro

export function registerRoomHandlers(wss, app) {
  function handleInvite(ws, data) {
    const toUserId = Number(data.to ?? data.toUserId);
    const fromUserId = ws.user.id;
    app.log.debug({ data }, 'Received invite:accepted payload');

    // --- Guard: invalid target ---
    if (!toUserId || Number.isNaN(toUserId)) {
      ws.send(JSON.stringify({
        type: 'error',
        code: 'BAD_INVITE',
        message: 'Invalid target user.',
      }));
      return;
    }

    // --- Guard: self-invite ---
    if (toUserId === fromUserId) {
      ws.send(JSON.stringify({
        type: 'error',
        code: 'SELF_INVITE',
        message: 'You cannot invite yourself.',
      }));
      return;
    }

    // --- Guard: must be in the lobby ---
    const target = lobbyUsers.get(String(toUserId));
    if (!target || target.readyState !== WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        code: 'USER_NOT_IN_LOBBY',
        message: 'User is not in the lobby.',
      }));
      return;
    }

    // --- Forward invite ---
    try {
      target.send(JSON.stringify({
        type: 'invite:received',
        from: { id: ws.user.id, name: ws.user.name },
      }));
      app.log.info(`Invite sent from ${fromUserId} to ${toUserId}`);
    } catch (err) {
      app.log.error({ err }, `Failed to send invite to ${toUserId}`);
    }
  }

  function handleInviteAccepted(ws, data) {
    app.log.debug({ data }, 'Received invite:accepted payload');

    const fromUserId = Number(data.from);
    if (!fromUserId || Number.isNaN(fromUserId)) return;

    const inviter = onlineUsers.get(String(fromUserId));
    if (!inviter || inviter.readyState !== WebSocket.OPEN) return;

    // Prevent duplicate rooms
    for (const [roomId, room] of rooms.entries()) {
      const ids = room.players.map(p => p.user.id);
      if (ids.includes(fromUserId) && ids.includes(ws.user.id)) {
        app.log.warn(`Duplicate invite acceptance ignored for ${fromUserId} vs ${ws.user.id}`);
        return;
      }
    }

    const roomId = makeRoomId(fromUserId, ws.user.id);
    rooms.set(roomId, { players: [inviter, ws], state: null, loopId: null });

    // asignar roomId a cada socket
    inviter.roomId = roomId;
    ws.roomId = roomId;

    // update userRoom
    userRoom.set(inviter.user.id, roomId);
    userRoom.set(ws.user.id, roomId);

    [inviter, ws].forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'room:start',
          roomId,
          players: [
            { id: inviter.user.id, name: inviter.user.name },
            { id: ws.user.id, name: ws.user.name }
          ]
        }));
      }
    });

    app.log.info(`Room created: ${roomId} (${fromUserId} vs ${ws.user.id})`);
  }



  function handleInviteDeclined(ws, data) {
    app.log.debug({ data }, 'Received invite:accepted payload');

    const fromUserId = Number(data.from);
    const inviter = onlineUsers.get(String(fromUserId));
    if (inviter && inviter.readyState === WebSocket.OPEN) {
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
    ws.send(JSON.stringify({ type: "matchmaking:searching" }));
    app.log.info(`User ${ws.user.id} joined matchmaking queue`);

    if (queue.length >= 2) {
      const p1 = queue.shift();
      const p2 = queue.shift();

      const roomId = makeRoomId(p1.user.id, p2.user.id);
      rooms.set(roomId, { players: [p1, p2], state: null, loopId: null });

      // assign room id per socket.
      p1.roomId = roomId;
      p2.roomId = roomId;

      [p1, p2].forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "room:start",
            roomId,
            players: [
              { id: p1.user.id, name: p1.user.name },
              { id: p2.user.id, name: p2.user.name }
            ]
          }));
          app.log.info(`Sent room:start to user ${client.user.id}`);
        }
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
  function handleDisconnect(ws) {
    const roomId = ws.roomId;
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;

    // copy the original player before the change.
    const originalPlayers = room.players.slice();

    // Remove the disconnected player
    room.players = room.players.filter(p => p !== ws);

    // Si queda uno, mandamos game:end
    if (room.players.length > 0) {
      const remaining = room.players[0];
      room.players.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "game:end",
            winner: client === remaining ? "you" : "opponent",
            scores: { s1: room.state?.s1 ?? 0, s2: room.state?.s2 ?? 0 }
          }));
        }
      });
    }

    // 🔥 limpiar userRoom para todos los jugadores originales
    for (const player of originalPlayers) {
      userRoom.set(player.user.id, null);
    }

    pendingKickIntro.add(ws.user.id);

    // Cleanup
    if (room.timerId) clearInterval(room.timerId);
    if (room.loopId) clearInterval(room.loopId);
    rooms.delete(roomId);
    app.log.info(`Room ${roomId} ended early, cleaned up after disconnect`);
  }




  return {
    handleInvite,
    handleInviteAccepted,
    handleInviteDeclined,
    handleMatchmakingJoin,
    handleMatchmakingLeave,
    handleDisconnect,

  };
}
