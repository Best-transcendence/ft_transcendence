import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { addTheme } from "../components/Theme"

// Adapted function now that data extraction has been centralized
export function GameIntroPage() {
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

        <!-- Feature cards -->
        <div class="flex gap-6 flex-wrap justify-center">
          <div class="rounded-xl shadow-[0_0_30px_10px_#7037d3] p-6 w-64 text-center cursor-pointer hover:bg-purple-700"
     			onclick="window.location.hash='lobby'">
 			<h2 class="font-bold text-cyan-400 mb-2">👾 Player vs Player</h2>
  			<p class="text-white text-sm">Classic 1v1 arcade action. Challenge a friend and see who's the best.</p>
		</div>
          <div class="rounded-xl shadow-[0_0_30px_10px_#7037d3] p-6 w-64 text-center cursor-pointer hover:bg-purple-700"
		       	onclick="window.location.hash='tournament'">
            <h2 class="font-bold text-cyan-400 mb-2">🏆 Tournament Mode</h2>
            <p class="text-white text-sm">A series of matches leading to a champion. Add your friends or guests to compete in an arcade battle.</p>
          </div>
          <div class="rounded-xl shadow-[0_0_30px_10px_#7037d3] p-6 w-64 text-center cursor-pointer hover:bg-purple-700"
		  		 onclick="window.location.hash='AIopponent'">
            <h2 class="font-bold text-cyan-400 mb-2">🤖 AI Opponent Mode</h2>
            <p class="text-white text-sm">This mode is for practicing or battling solo against the computer.</p>
          </div>
        </div>
      </div>
    `;
}
