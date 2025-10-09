import { connectSocket } from "../services/ws";
import { addTheme } from "../components/Theme"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { thisUser } from "../router";

// cache + helper to get the user name
const nameById: Record<string, string> = {};

const EMOJIS = ['⚡','🚀','🐉','🦊','🐱','🐼','🐧','🐸','🦄','👾','⭐','🌟','🍀'];
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

  connectSocket(token, async (msg) => {
    if (msg.type !== "user:list") return;

	    // Re-query each time so we don't cache null before the page mounts
    const usersContainer = document.getElementById("online-users");
    if (!usersContainer) return;

    if (!Array.isArray(msg.users) || msg.users.length === 0) {
      usersContainer.innerHTML = `<p class="text-gray-400">Nobody online yet</p>`;
      return;
    }

	const filteredUsers = msg.users.filter(
	(u: any) => String(u.id) !== String(thisUser?.id)
	);

		usersContainer.innerHTML = msg.users.map((u: any) => {
  	  const id = u?.id ?? "";
      const label = `${emojiForId(id)} - ${id}`;
      return `
          <div class="bg-white bg-opacity-90 rounded-lg shadow p-4 flex items-center justify-between">
            <span class="font-semibold text-gray-800">${label} - ${id}</span>
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
}
