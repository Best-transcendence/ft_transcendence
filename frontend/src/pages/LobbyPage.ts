import { connectSocket, sendWSMessage } from "../services/ws";
import { triggerInvitePopup } from "../components/Ups";

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

export function initLobby() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    window.location.hash = "login";
    return;
  }

  const usersContainer = document.getElementById("online-users");
  const myUserId = JSON.parse(atob(token.split(".")[1])).id;

  connectSocket(token, (msg) => {
    switch (msg.type) {
      case "user:list":
        if (!usersContainer) return;
        usersContainer.innerHTML = msg.users
          .filter((u: any) => u.id !== myUserId)
          .map(
            (u: any) => `
            <div class="bg-white bg-opacity-90 rounded-lg shadow p-4 flex items-center justify-between">
              <span class="font-semibold text-gray-800">${u.name || u.id}</span>
              <button class="invite-btn px-3 py-1 text-sm rounded bg-theme-button text-white hover:bg-theme-button-hover"
                      data-user-id="${u.id}">
                Invite
              </button>
            </div>
          `
          )
          .join("");

        document.querySelectorAll(".invite-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const userId = (btn as HTMLElement).getAttribute("data-user-id");
            console.log("📨 Sending invite to user", userId);
            sendWSMessage("invite", { to: userId });

            console.log("🧪 Invite message sent:", {
              type: "invite",
              to: userId,
            });
          });
        });
        break;

      case "invite:received":
        console.log("🎮 Received invite:", msg);
        triggerInvitePopup(msg);
        break;

      case "room:start":
        console.log("🚀 Starting room", msg.roomId);
        window.location.hash = `remote?room=${msg.roomId}`;
        break;

      case "invite:declined":
        alert(`❌ ${msg.from.name} declined your invite`);
        break;

      default:
        console.log("⚠️ Unhandled WS message:", msg);
    }
  });
}
