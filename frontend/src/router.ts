import { connectSocket } from "./services/ws";

export function LobbyPage() {
  return `
    <div class="min-h-screen bg-gradient-to-b from-theme-bg1 to-theme-bg2 text-theme-text p-8">
      <h1 class="text-3xl font-bold mb-4">🎮 Lobby</h1>
      <p class="mb-6">See who’s online and ready to play!</p>

      <div id="online-users"
           class="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <p class="text-gray-400">Waiting for online users...</p>
      </div>
    </div>
  `;
}

// Attach after render
export function initLobby() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    window.location.hash = "login";
    return;
  }

  const usersContainer = document.getElementById("online-users");

  connectSocket(token, (msg) => {
    if (msg.type === "user:list") {
      if (!usersContainer) return;

      if (msg.users.length === 0) {
        usersContainer.innerHTML = `<p class="text-gray-400">Nobody online yet 👀</p>`;
        return;
      }

      usersContainer.innerHTML = msg.users
        .map(
          (u: any) => `
          <div class="bg-white bg-opacity-90 rounded-lg shadow p-4 flex items-center justify-between">
            <span class="font-semibold text-gray-800">${u.name}</span>
            <button class="invite-btn px-3 py-1 text-sm rounded bg-theme-button text-white hover:bg-theme-button-hover"
                    data-user-id="${u.id}">
              Invite
            </button>
          </div>
        `
        )
        .join("");

      // Attach invite listeners
      document.querySelectorAll(".invite-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const userId = (btn as HTMLElement).getAttribute("data-user-id");
          console.log(`📨 Invite sent to user ${userId}`);

          // later: send WS message
          // socket.send(JSON.stringify({ type: "invite", to: userId }));
        });
      });
    }
  });
}
