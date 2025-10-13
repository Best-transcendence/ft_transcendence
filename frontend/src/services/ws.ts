// services/ws.ts
let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;
let manualClose = false;

export function getSocket() {
  return socket;
}

export function connectSocket(token: string, onMessage?: (msg: any) => void) {
  if (socket) {
    if (socket.readyState === WebSocket.OPEN) return socket;
    if (socket.readyState === WebSocket.CONNECTING) return socket;
    // closed or closing -> create a new one
  }

  manualClose = false;
  const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:4000";
  socket = new WebSocket(`${WS_URL}?token=${token}`);

  socket.onopen = () => {
    console.log("WS open");
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      console.log("WS message:", msg);
      if (onMessage) onMessage(msg);
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
        if (saved) connectSocket(saved, onMessage);
      }, 1000 + Math.random() * 2000);
    }
  };

  socket.onerror = (err) => {
    console.error("WS error:", err);
  };

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  manualClose = true;
  console.log("Closing WS (manual)");
  socket.close();
  socket = null;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

export function autoConnect(onMessage?: (msg: any) => void) {
  const token = localStorage.getItem("jwt");
  console.log("autoConnect token:", token);
  if (token) connectSocket(token, onMessage);
}

export function sendWSMessage(type: string, payload: any = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, ...payload }));
  } else {
    console.warn(" Cannot send WS message: socket not open");
  }
}