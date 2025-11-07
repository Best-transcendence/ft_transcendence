// ./state/session.js
import { userRoom, pendingKickIntro } from '../routes/rooms.js';

export function onWsConnected(ws) {
  const uid = ws.user.id;
  console.log("onWsConnected for", uid, {
    pendingKick: pendingKickIntro.has(uid),
    roomId: userRoom.get(uid)
  });
  
  if (pendingKickIntro.has(uid)) {
    pendingKickIntro.delete(uid);
    ws.send(JSON.stringify({ type: 'session:kickIntro' }));
    return;
  }

  const roomId = userRoom.get(uid) || null;
  ws.send(JSON.stringify({
    type: 'session:state',
    inRoom: !!roomId,
    roomId,
  }));
}
