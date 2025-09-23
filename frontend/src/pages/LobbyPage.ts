import { connectSocket } from "../services/ws";

export function LobbyPage() {
  return `
    <div class="min-h-screen bg-gradient-to-b from-theme-bg1 to-theme-bg2 text-theme-text p-8">
      <h1 class="text-3xl font-bold mb-4">🎮 Lobby</h1>
      <p class="from-theme-bg1 mb-6">See who’s online and ready to play!</p>

      <div id="online-users" class="grid gap-3"></div>
    </div>
  `;
}

// attach after render
export function initLobby() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    window.location.hash = "login";
    return;
  }

  const usersContainer = document.getElementById("online-users");

  connectSocket(token, (msg) => {
    if (msg.type === "user:list") {
      usersContainer!.innerHTML = msg.users
        .map(
          (u: any) => `
          <div class="theme-text bg-opacity-90 rounded-lg shadow p-4 flex items-center justify-between">
            <span class="font-semibold" from-theme-text>${u.id}</span>
            <button class="px-3 py-1 text-sm rounded bg-theme-button text-white hover:bg-theme-button-hover">
              Invite
            </button>
          </div>
        `
        )
        .join("");
    }
  });
}
