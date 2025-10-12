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
  }

  manualClose = false;
  const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:4000";
  socket = new WebSocket(`${WS_URL}?token=${token}`);

  socket.onopen = () => console.log(" WS connected");

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      console.log("WS message:", msg);

      if (onMessage) onMessage(msg);
      window.dispatchEvent(new CustomEvent("ws-message", { detail: msg }));
    } catch (err) {
      console.error("Failed to parse WS message:", err);
    }
  };

  socket.onclose = () => {
    console.log("WS disconnected");
    socket = null;
  };

  socket.onerror = (err) => console.error("❌ WS error:", err);

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  manualClose = true;
  console.log("Closing WS connection");
  socket.close();
  socket = null;
}

export function sendWSMessage(type: string, payload: any = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, ...payload }));
  } else {
    console.warn(" Cannot send WS message: socket not open");
  }
}
