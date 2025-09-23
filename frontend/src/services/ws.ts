// src/services/ws.ts
let socket: WebSocket | null = null;

export function connectSocket(token: string) {
  if (socket && socket.readyState === WebSocket.OPEN) return socket; // avoid duplicate

  const WS_URL = "ws://localhost:3001"; // backend gateway URL
  socket = new WebSocket(`${WS_URL}?token=${token}`);

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  socket.onclose = () => {
    console.log("⚪️ WebSocket closed");
    socket = null;
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };

  return socket;
}

export function sendMessage(msg: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
}

export function onMessage(callback: (msg: any) => void) {
  if (!socket) return;
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      callback(data);
    } catch (err) {
      console.error("❌ Error parsing WS message:", err);
    }
  };
}
