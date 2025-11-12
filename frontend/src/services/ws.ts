let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;
let manualClose = false;
let listeners: ((msg: any) => void)[] = [];
let messageQueue: Array<{type: string, payload: any}> = [];

export function getSocket() {
  return socket;
}

export function connectSocket(token: string) {
  if (socket) {
    if (socket.readyState === WebSocket.OPEN) return socket;
    if (socket.readyState === WebSocket.CONNECTING) return socket;
  }

  manualClose = false;
  let WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:4000";
  // Ensure trailing slash for nginx /ws/ location
  if (WS_URL.endsWith('/ws') && !WS_URL.endsWith('/ws/')) {
    WS_URL = WS_URL + '/';
  }
  socket = new WebSocket(`${WS_URL}?token=${token}`);

  socket.onopen = () => {
    console.log("WS open");
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    // Send queued messages
    while (messageQueue.length > 0) {
      const msg = messageQueue.shift();
      if (msg) {
        socket.send(JSON.stringify({ type: msg.type, ...msg.payload }));
      }
    }
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      console.log("WS message:", msg);
      // notify all subscribers
      listeners.forEach((fn) => fn(msg));
      // still dispatch a DOM event if you like
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

  socket.onerror = (err) => {
    console.error("WS error:", err);
  };

  return socket;
}

// Subscribe to messages
export function onSocketMessage(fn: (msg: any) => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
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

export function autoConnect() {
  const token = localStorage.getItem("jwt");
  if (token) connectSocket(token);
}

export function sendWSMessage(type: string, payload: any = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, ...payload }));
  } else {
    console.warn("Cannot send WS message: socket not open, queuing");
    messageQueue.push({ type, payload });
  }
}
