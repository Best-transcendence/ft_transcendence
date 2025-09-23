import { connectWebSocket } from "../services/ws";

let onlineUsers: string[] = [];

function renderOnlineUsers() {
  const app = document.getElementById("app")!;
  app.innerHTML = `
    <h1 class="text-2xl font-bold mb-4">Usuarios Online</h1>
    <div id="online-users-list"></div>
    <button id="back-btn" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded">Volver</button>
  `;

  const list = document.getElementById("online-users-list")!;
  list.innerHTML = onlineUsers.length
    ? onlineUsers.map((id) => `<div>🟢 Usuario ID: ${id}</div>`).join("")
    : "<div>No hay usuarios online.</div>";

  document.getElementById("back-btn")?.addEventListener("click", () => {
    window.location.hash = "lobby";
  });
}

export function OnlineUsersPage(token: string) {
  connectWebSocket(token, (usersOnline) => {
    onlineUsers = usersOnline;
    renderOnlineUsers();
  });

  renderOnlineUsers();
}
