//TODO: Adapt according to Websocket integration microservice
let socket: WebSocket | null = null;

export function connectSocket(token: string, onMessage?: (msg: any) => void) {
  if (socket && socket.readyState === WebSocket.OPEN) return socket;

  socket = new WebSocket(`ws://localhost:3003?token=${token}`);

  socket.onopen = () => console.log("✅ Connected to WS server");

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log("📩 WS message:", msg);

    if (onMessage) onMessage(msg);
    window.dispatchEvent(new CustomEvent("ws-message", { detail: msg }));
  };

  socket.onclose = () => console.log("⚪ Disconnected from WS");
  socket.onerror = (err) => console.error("❌ WS error:", err);

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    console.log("👋 Closing WS connection");
    socket.close();
    socket = null;
  }
}
//end:TODO
