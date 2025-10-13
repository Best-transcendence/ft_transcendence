import { connectSocket } from "../services/ws";
import { addTheme } from "../components/Theme"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { thisUser } from "../router";

// TODO display the username if it's needed
const EMOJIS = ['⚡','🚀','🐉','🦊','🐱','🐼','🐧','🐸','🦄','👾','⭐','🌟','🍀'];
function emojiForId(id: number) {
  const index = id % EMOJIS.length;
  return EMOJIS[index];
}


// simple in-page invite popup
function showInvitePopup(fromLabel: string, onAccept: () => void, onDecline: () => void) {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/60";
  overlay.innerHTML = `
    <div class="bg-slate-900 text-gray-200 rounded-2xl p-6 w-[min(90vw,380px)]
                shadow-[0_0_30px_10px_#7037d3] text-center">
      <p class="mb-5 text-lg">🎮 Game invite from <b>${fromLabel}</b></p>
      <div class="flex gap-3 justify-center">
        <button id="iv-accept" class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Accept</button>
        <button id="iv-decline" class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Decline</button>
      </div>
    </div>
  `;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) { onDecline(); overlay.remove(); }
  });
  document.body.appendChild(overlay); // inserts the overlay <div> into the DOM, after this line, it becomes visible in the browser, appears on screen
  (overlay.querySelector("#iv-accept") as HTMLButtonElement).onclick = () => { onAccept(); overlay.remove(); };
  (overlay.querySelector("#iv-decline") as HTMLButtonElement).onclick = () => { onDecline(); overlay.remove(); };
}

export function LobbyPage() {
  return `
	<!-- Theme -->
		${ addTheme() }

	<!-- Header with user info -->
		<div class="w-full
			flex justify-between items-center
			mb-10">

	<!-- Protected pages components -->
			${ profileDivDisplay() }
			${ sidebarDisplay() }
			${ LogOutBtnDisplay() }

	</div>

    <div class="flex flex-col gap-3 mb-10 "
		style="position: relative; display: inline-block; inline-block; width: 50vw; height: 11vw; min-width: 120px; min-height: 120px;">
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

 // TODO: it doesn't get the user id if it's a freshly created account
  const selfId = String(thisUser?.id ?? "");

  usersContainer.innerHTML = `<p class="text-gray-400">Waiting for online users…</p>`;

  const socket = connectSocket(token, (msg) => {
	switch (msg.type) {

      case "user:list": {
        const list = Array.isArray(msg.users) ? msg.users : []; // safer to store in a list
        const others = list.filter((u: any) => String(u?.id ?? "") !== selfId);

        if (others.length === 0) {
          usersContainer.innerHTML = `<p class="text-gray-400">No other players online</p>`;
          return;
        }

        usersContainer.innerHTML = others.map((u: any) => {
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
        }).join("");

        // Sender, invite listeners
        usersContainer.querySelectorAll(".invite-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const userId = (btn as HTMLElement).getAttribute("data-user-id");
            if (!userId) return;
            socket?.send?.(JSON.stringify({ type: "invite:send", to: Number(userId) }));
            console.log(`Invite sent to user ${userId}`);
          });
        });
        break;
      }

      // Invite receiver, in-page popup
      case "invite:incoming": {
        const from = msg.from ?? {};
        const fromText = from.name ? `${from.name} (${from.id})` : `Player ${from.id}`;
        showInvitePopup(
          fromText,
          // onAccept
          () => socket?.send?.(JSON.stringify({ type: "invite:response", to: from.id, accepted: true })),
          // onDecline
          () => socket?.send?.(JSON.stringify({ type: "invite:response", to: from.id, accepted: false }))
        );
        break;
      }

      // Invite accepted event → route both to same room
      case "invite:accepted": {
        const room = msg.roomId;
        window.location.hash = `pong2d?room=${encodeURIComponent(room)}`;
        break;
      }
	 // Invite declined event
      case "invite:declined": {
        const who = msg.from?.name ?? `Player ${msg.from?.id ?? ""}`;
        console.log(`${who} declined your invite.`);
        break;
      }
	  // ignore others:
      default:
        	break;
    }
  });

 	// TODO: it doesn't load the new users just after on reload
  // Proactively request the list
  try {
    // If socket already open, send immediately
    if (socket?.readyState === 1 /* WebSocket.OPEN */) {
      socket.send?.(JSON.stringify({ type: "user:list:request" }));
    }

    // Also request once it opens (covers slower connections)
    socket?.addEventListener?.("open", () => {
      try { socket.send?.(JSON.stringify({ type: "user:list:request" })); } catch {}
    });
  } catch {}
}