import { connectSocket } from "../services/ws";
import { addTheme } from "../components/Theme"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { thisUser } from "../router";

// cache + helper to get the user name
const nameById: Record<string, string> = {};

// TODO display the username if it's needed
const EMOJIS = ['⚡','💗','🌸','🦊','🐱','🐼','🐧','🪼','🐭','👾','⭐','🌟','🍀'];
function emojiForId(id: string | number) {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return EMOJIS[h % EMOJIS.length];
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
    if (msg.type !== "user:list") return;

    if (!Array.isArray(msg.users) || msg.users.length === 0) {
      usersContainer.innerHTML = `<p class="text-gray-400">No other players online</p>`;
      return;
    }

	const others = msg.users.filter((u: any) => String(u?.id ?? "") !== selfId);

	usersContainer.innerHTML = others.map((u: any) => {
  	  const id = u?.id ?? "";
      const label = `${emojiForId(id)} - ${id}`;
      return `
          <div class="bg-[#271d35] backdrop-blur-md rounded-lg shadow-[0_0_30px_10px_#7037d3] p-4 flex items-center justify-between">
            <span class="text-gray-300 font-medium">${label}</span>
            <button class="invite-btn px-3 py-1 text-sm rounded bg-theme-button text-white hover:bg-theme-button-hover"
                    data-user-id="${id}">
              Invite
            </button>
          </div>
        `
		})
        .join("");
	
      // Attach invite listeners
      usersContainer.querySelectorAll(".invite-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const userId = (btn as HTMLElement).getAttribute("data-user-id");
          console.log(` Invite sent to user ${userId}`);
          // socket.send(JSON.stringify({ type: "invite", to: userId }));
        });
      });
  });

 // TODO: it doesn't load the new users just after on reload
  // Proactively request the list NOW (covers first-visit race)
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