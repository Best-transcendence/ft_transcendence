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
        <h1 class="text-4xl font-heading font-bold mb-4">Retro Pong</h1>
        <p class="text-lg text-gray-600 max-w-xl text-center mb-10">
          Experience the classic game of Pong with a modern twist.
        </p>

        <!-- Feature cards -->
        <div class="flex gap-6 flex-wrap justify-center">
          <div class="bg-white bg-opacity-90 rounded-xl shadow-[0_0_30px_10px_#7037d3] p-6 w-64 text-center cursor-pointer hover:bg-gray-100"
     			onclick="window.location.hash='pong2d'">
 			<h2 class="font-bold text-theme-button mb-2">Classic Gameplay</h2>
  			<p class="text-gray-600 text-sm">Pure Pong mechanics</p>
		</div>
          <div class="bg-white bg-opacity-90 rounded-xl shadow-[0_0_30px_10px_#7037d3] p-6 w-64 text-center">
            <h2 class="font-bold text-theme-button mb-2">Smooth Controls</h2>
            <p class="text-gray-600 text-sm">Responsive keyboard controls for both players</p>
          </div>
          <div class="bg-white bg-opacity-90 rounded-xl shadow-[0_0_30px_10px_#7037d3] p-6 w-64 text-center">
            <h2 class="font-bold text-theme-button mb-2">Our amaizing modern Design</h2>
            <p class="text-gray-600 text-sm">more text.......</p>
          </div>
        </div>
      </div>
    `;
}
