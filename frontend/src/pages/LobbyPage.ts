import { connectSocket, onSocketMessage, sendWSMessage, getSocket } from "../services/ws";
import { addTheme } from "../components/Theme";
import { sidebarDisplay } from "../components/SideBar";
import { profileDivDisplay } from "../components/ProfileDiv";
import { LogOutBtnDisplay } from "../components/LogOutBtn";
import { t } from "../services/lang/LangEngine";
import { LanguageSwitcher } from "../services/lang/LanguageSwitcher";

import { thisUser } from "../router";
import {
  triggerInvitePopup,
  closeInvitePopup,
} from "../components/RemotePopup";

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
export function emojiForId(id: number) {
  const index = id % EMOJIS.length;
  return EMOJIS[index];
}

function escapeHTML(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function LobbyPage() {
  return `
    ${addTheme()}
    <div class="w-full flex justify-between items-center mb-10">
		<!-- Protected pages components -->
		${ profileDivDisplay() }
		${ sidebarDisplay() }
		<!-- Group Language and Logout on the right -->
		<div class="flex gap-2 items-center">
			${LanguageSwitcher()}
			 ${LogOutBtnDisplay()}
		</div>
	 </div>
    <div class="flex flex-col gap-3 mb-10"
         style="position: relative; display: inline-block; width: 50vw; height: 11vw; min-width: 120px; min-height: 120px;">
      <h1 class="text-4xl font-bold mb-4">🎮 ${t("lobbyTitle")}</h1>
      <p class="from-theme-bg1 mb-6">${t("lobbySubtitle")}</p>
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
  usersContainer.innerHTML = `<p class="text-gray-400">${t("waitingForUsers")}</p>`;

  const socket = connectSocket(token);
  const unsuscribe = onSocketMessage((msg) => {
    switch (msg.type) {
      case "user:list": {
        const list = Array.isArray(msg.users) ? msg.users : [];
        const others = list.filter((u: any) => String(u?.id ?? "") !== selfId);

        if (others.length === 0) {
          usersContainer.innerHTML = `<p class="text-gray-400">${t("noOtherPlayers")}</p>`;
          return;
        }

        usersContainer.innerHTML = others
          .map((u: any) => {
            const id = String(u?.id ?? "");
            const idNum = Number(id) || 0;

            // prefer username; fallback to "Player {id}"
            const rawName = (u?.name ?? "").trim();
            const displayName = rawName ? escapeHTML(rawName) : `${t("playerLabel")} ${id}`;

            // small avatar circle with emoji
            const avatar = emojiForId(idNum);

            return `
			<div class="bg-slate-900 backdrop-blur-md rounded-lg shadow-[0_0_30px_10px_#7037d3] p-4 flex items-center justify-between">
				<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 text-lg">
					${avatar}
				</div>
				<div class="flex flex-col">
					<span class="text-gray-200 font-medium">${displayName}</span>
					<span class="text-gray-500 text-xs">${t("idLabel")}: ${id}</span>
				</div>
				</div>
				<button class="invite-btn px-3 py-1 text-sm rounded bg-purple-600 text-white hover:bg-purple-700"
						data-user-id="${id}">
					${t("inviteBtn")}
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
        localStorage.setItem("roomId", msg.roomId); // Keep the room ID.
        window.location.hash = `remote?room=${encodeURIComponent(room)}`;
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

  // tell server: joined lobby
  const sendLobbyJoin = () => {
    const currentSocket = getSocket();
    if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
      currentSocket.send(JSON.stringify({ type: "lobby:join" }));
      currentSocket.send(JSON.stringify({ type: "user:list:request" }));
    } else if (currentSocket) {
      currentSocket.addEventListener(
        "open",
        () => {
          const s = getSocket();
          if (s && s.readyState === WebSocket.OPEN) {
            s.send(JSON.stringify({ type: "lobby:join" }));
            s.send(JSON.stringify({ type: "user:list:request" }));
          }
        },
        { once: true }
      );
    }
  };

  // Try to send immediately, or wait for connection
  sendLobbyJoin();
  
  // Also try when socket opens (in case it's still connecting)
  if (socket) {
    socket.addEventListener("open", sendLobbyJoin, { once: true });
  }

  // LEAVE lobby when navigating away from lobby route
  const leaveIfNotLobby = () => {
    const hash = window.location.hash.replace(/^#/, "");
    const route = hash.split("?")[0];
    if (route !== "lobby") {
      try {
        const currentSocket = getSocket();
        if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
          currentSocket.send(JSON.stringify({ type: "lobby:leave" }));
        }
      } catch {}
      closeInvitePopup(); //  hide any open invite popup
      window.removeEventListener("hashchange", leaveIfNotLobby);
      window.removeEventListener("beforeunload", onUnload);
    }
  };
  window.addEventListener("hashchange", leaveIfNotLobby);

  // LEAVE on tab close/refresh
  const onUnload = () => {
    try {
      socket.send(JSON.stringify({ type: "lobby:leave" }));
    } catch {}
    closeInvitePopup(); // close on refresh
  };
  window.addEventListener("beforeunload", onUnload);

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
