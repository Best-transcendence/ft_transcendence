import { connectSocket } from "../services/ws";
import { addTheme } from "../components/Theme";
import { sidebarDisplay } from "../components/SideBar";
import { profileDivDisplay } from "../components/ProfileDiv";
import { LogOutBtnDisplay } from "../components/LogOutBtn";
import { thisUser } from "../router";
import { triggerInvitePopup } from "../components/remote-popup";

const EMOJIS = [
  "⚡",
  "🚀",
  "🐉",
  "🦊",
  "🐱",
  "🐼",
  "🐧",
  "🐸",
  "🦄",
  "👾",
  "⭐",
  "🌟",
  "🍀",
];
function emojiForId(id: number) {
  const index = id % EMOJIS.length;
  return EMOJIS[index];
}

export function LobbyPage() {
  return `
    ${addTheme()}
    <div class="w-full flex justify-between items-center mb-10">
      ${profileDivDisplay()}
      ${sidebarDisplay()}
      ${LogOutBtnDisplay()}
    </div>
    <div class="flex flex-col gap-3 mb-10"
         style="position: relative; display: inline-block; width: 50vw; height: 11vw; min-width: 120px; min-height: 120px;">
      <h1 class="text-4xl font-bold mb-4">🎮 Lobby</h1>
      <p class="from-theme-bg1 mb-6">See who’s online and ready to play!</p>
      <div id="online-users" class="grid gap-3"></div>
    </div>
  `;
}

export async function initLobby() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    window.location.hash = "login";
    return;
  }

  const usersContainer = document.getElementById("online-users");
  if (!usersContainer) return;

  const selfId = String(thisUser?.id ?? "");
  usersContainer.innerHTML = `<p class="text-gray-400">Waiting for online users…</p>`;

  const socket = connectSocket(token, (msg) => {
    switch (msg.type) {
      case "user:list": {
        const list = Array.isArray(msg.users) ? msg.users : [];
        const others = list.filter((u: any) => String(u?.id ?? "") !== selfId);

        if (others.length === 0) {
          usersContainer.innerHTML = `<p class="text-gray-400">No other players online</p>`;
          return;
        }

        usersContainer.innerHTML = others
          .map((u: any) => {
            const id = String(u?.id ?? "");
            const idNum = Number(id) || 0;
            const label = `${emojiForId(idNum)} - ${id}`;
            return `
            <div class="bg-slate-900 backdrop-blur-md rounded-lg shadow-[0_0_30px_10px_#7037d3] p-4 flex items-center justify-between">
              <span class="text-gray-300 font-medium">${label}</span>
              <button class="invite-btn px-3 py-1 text-sm rounded bg-purple-600 text-white hover:bg-purple-700"
                      data-user-id="${id}">
                Invite
              </button>
            </div>`;
          })
          .join("");

        usersContainer.querySelectorAll(".invite-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const userId = (btn as HTMLElement).getAttribute("data-user-id");
            if (!userId) return;
            socket?.send?.(JSON.stringify({ type: "invite:send", to: userId }));
            console.log(`Invite sent to user ${userId}`);
          });
        });
        break;
      }

      // Invite receiver
      case "invite:received": {
        console.log(" Received invite:", msg);
        triggerInvitePopup(msg);
        break;
      }

      case "room:start": {
        const room = msg.roomId;
        window.location.hash = `pong2d?room=${encodeURIComponent(room)}`;
        break;
      }

      case "invite:declined": {
        const who = msg.from?.name ?? `Player ${msg.from?.id ?? ""}`;
        console.log(`${who} declined your invite.`);
        break;
      }

      default:
        break;
    }
  });

  // proactively request list
  try {
    if (socket?.readyState === 1) {
      socket.send?.(JSON.stringify({ type: "user:list:request" }));
    }
    socket?.addEventListener?.("open", () => {
      try {
        socket.send?.(JSON.stringify({ type: "user:list:request" }));
      } catch {}
    });
  } catch {}
}
