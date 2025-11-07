// ws-service/state/user.js
import { WebSocket } from 'ws';

// Shared state
const namesCache = new Map();   // userId -> name
const onlineUsers = new Map();  // userId -> ws
const lobbyUsers = new Map();   // userId -> ws

// ---------------- Online user helpers ----------------
export function addOnlineUser(userId, ws) {
  const existing = onlineUsers.get(String(userId));
  if (existing && existing !== ws) {
    try { existing.close(); } catch { }
  }
  onlineUsers.set(String(userId), ws);
}


export function removeOnlineUser(userId, ws) {
  const current = onlineUsers.get(String(userId));
  if (current === ws) onlineUsers.delete(String(userId));
}

export function isUserOnline(userId) {
  return onlineUsers.has(String(userId));
}

export function getAllUsers() {
  return [...onlineUsers.values()].map(ws => {
    const id = ws.user.id;
    const name = ws.user.name ?? namesCache.get(String(id)) ?? null;
    return { id, name };
  });
}

// ---------------- Lobby helpers ----------------
export function addLobbyUser(userId, ws) {
  lobbyUsers.set(String(userId), ws);
}

export function removeLobbyUser(userId) {
  lobbyUsers.delete(String(userId));
}

export function getLobbyUsers() {
  return [...lobbyUsers.values()].map(ws => {
    const id = ws.user.id;
    const name = ws.user.name ?? namesCache.get(String(id)) ?? null;
    return { id, name };
  });
}

// ---------------- Name cache helpers ----------------
export function cacheUserName(userId, name) {
  namesCache.set(String(userId), name);
}

export function getUserName(userId) {
  return namesCache.get(String(userId)) ?? null;
}

// ---------------- External fetch ----------------
export async function fetchUserName(app, userId, token = null) {
  const base = process.env.USER_SERVICE_URL || 'http://localhost:3002';
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${base}/users/public/${userId}`, { headers });
    if (!res.ok) throw new Error(`status ${res.status}`);

    const user = await res.json();
    const name = user?.name ?? null;

    if (name) namesCache.set(String(userId), name);
    return name;
  } catch (err) {
    app.log.warn({ userId, err: err.message }, 'Failed to fetch username');
    return null;
  }
}


// ---------------- Exports ----------------
export { onlineUsers, lobbyUsers, namesCache };