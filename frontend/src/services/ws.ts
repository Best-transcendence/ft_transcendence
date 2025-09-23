let socket: WebSocket | null = null;

export function connectWebSocket(token: string, onUserListUpdate: (users: string[]) => void) {
  if (socket) socket.close(); // Cierra conexiones anteriores

  socket = new WebSocket(`ws://localhost:3003/?token=${token}`);

  socket.onopen = () => {
    console.log('🟣 Conectado al WebSocket');
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'user:list') {
      onUserListUpdate(data.users);
    }
  };

  socket.onerror = (err) => {
    console.error('❌ Error en WebSocket:', err);
  };

  socket.onclose = () => {
    console.log('⚪️ WebSocket cerrado');
  };
}
