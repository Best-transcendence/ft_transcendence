import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { addTheme } from "../components/Theme"
import { QuickGameCard } from '../components/cards/QuickGameCard'
import { ModeCards } from '../components/cards/ModeCards'
import { autoConnect, sendWSMessage } from "../services/ws";

// Adapted function now that data extraction has been centralized
export function GameIntroPage() {
    autoConnect(handleWSMessage);
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

        <!-- Title -->
        <h1 class="text-4xl font-heading font-bold mb-4">Arcade Clash</h1>
        <p class="text-lg text-gray-600 max-w-xl text-center mb-10">
			Challenge a friend and prove your skills.
        </p>
        ${ QuickGameCard() }
        <!-- Mode cards -->
        ${ ModeCards() }
    `;
}


function handleWSMessage(msg: any) {
  switch (msg.type) {
    case "room:start":
      localStorage.setItem("roomId", msg.roomId);
      window.location.hash = `remote?room=${encodeURIComponent(msg.roomId)}`;
      break;
    case "invite:error":
      alert("There are not players in this moment..");
      break;
  }
}
