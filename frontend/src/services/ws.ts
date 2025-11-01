// services/ws.ts
let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;
let manualClose = false;
let listeners = new Set<(msg: any) => void>();

export function getSocket() { return socket; }

export function connectSocket(token: string) {
  if (socket) {
    if (socket.readyState === WebSocket.OPEN) return socket;
    if (socket.readyState === WebSocket.CONNECTING) return socket;
  }

  manualClose = false;
  const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:4000";
  socket = new WebSocket(`${WS_URL}?token=${token}`);

  socket.onopen = () => {
    console.log("WS open");
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    // Request server snapshot(s) so pages that mount later can sync
    sendWSMessage("presence:list:request", {});
    sendWSMessage("user:list:request", {}); // optional: for lobby user list
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      console.log("WS message:", msg);
      listeners.forEach((fn) => {
        try { fn(msg); } catch (err) { console.error("ws listener error", err); }
      });
      window.dispatchEvent(new CustomEvent("ws-message", { detail: msg }));
    } catch (err) {
      console.error("WS: failed to parse message", err);
    }
  };

  socket.onclose = (ev) => {
    console.log("WS closed", ev.code, ev.reason);
    socket = null;
    if (!manualClose) {
      reconnectTimer = window.setTimeout(() => {
        const saved = localStorage.getItem("jwt");
        if (saved) connectSocket(saved);
      }, 1000 + Math.random() * 2000);
    }
  };

  socket.onerror = (err) => { console.error("WS error:", err); };
  return socket;
}

// Subscribe to messages
export function onSocketMessage(fn: (msg: any) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function disconnectSocket() {
  if (!socket) return;
  manualClose = true;
  console.log("Closing WS (manual)");
  socket.close();
  socket = null;
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
}

// autoConnect optionally attaches a handler and returns an unsubscribe (if provided)
export function autoConnect(optHandler?: (msg: any) => void) {
  const token = localStorage.getItem("jwt");
  if (token) connectSocket(token);
  if (optHandler) return onSocketMessage(optHandler);
  return () => {};
}

export function sendWSMessage(type: string, payload: any = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, ...payload }));
  } else {
    console.warn("Cannot send WS message: socket not open", type);
  }
}
