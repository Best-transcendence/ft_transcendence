import { onlineUsers } from '../state/user.js';

export function registerFriendsHandlers(wss, app) {
  function handleFriendSubscribe(ws, data) {
    const friendIds = data.friendIds || [];
    const statuses = {};

    friendIds.forEach(id => {
      const userId = Number(id);
      if (userId && !Number.isNaN(userId)) {
        statuses[userId] = onlineUsers.has(String(userId));
      }
    });

    ws.send(JSON.stringify({ type: 'friends:status', statuses }));
    app.log.info({ userId: ws.user.id, friendIds }, 'Sent friends status');
  }

  return {
    handleFriendSubscribe,
  };
}