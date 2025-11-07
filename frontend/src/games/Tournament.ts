import { addTheme } from "../components/Theme"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { TimerDisplay, startTimer } from "../components/Timer";
import { t } from "../services/lang/LangEngine"
import { LanguageSwitcher } from "../services/lang/LanguageSwitcher"

/**
 * Tournament Game HTML Template Generator
 * 
 * This module generates the HTML template for the tournament Pong game interface.
 * It creates a complete game layout with arcade-style background, game controls,
 * user interface elements, and audio components for the tournament system.
 */

/**
 * Generates the complete HTML template for the tournament Pong game
 * 
 * Creates a full-screen game interface with:
 * - Arcade machine background image
 * - Game area with paddles, ball, and scoring
 * - User interface components (profile, sidebar, logout)
 * - Audio elements for game sound effects
 * - Responsive design with proper aspect ratios
 * 
 * @returns {string} Complete HTML template for the tournament game
 */
export function GamePongTournament(): string {
  return `
		${ addTheme() }
	
		<!-- Background gradient overlay for visual depth -->
		<div class="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_50%,rgba(0,0,0,1)_100%)] z-0"></div>
	
	<!-- Header section with user interface components -->
		<div class="w-full
			flex justify-between items-center
			mb-10 relative z-3">
	
		<!-- Protected pages components -->
		${ profileDivDisplay() }
		${ sidebarDisplay() }
        <!-- Group Language and Logout on the right -->
        <div class="flex gap-2 items-center">
            ${LanguageSwitcher()}
             ${LogOutBtnDisplay()}
        </div>
     </div>
	
	<!-- Tournament timer display -->
	${ TimerDisplay() }
	
	
	<!-- Main game container with responsive sizing -->
		<div class="flex justify-center w-screen overflow-hidden">
			<!-- Game area container with 16:9 aspect ratio and responsive width -->
			<div class="relative"
			style="position: absolute; top: vh; left: 50%; transform: translateX(-50%); width: 90vw; max-width: 1450px; aspect-ratio: 16/9;">
	
	<!-- Arcade machine background image -->
				<img src="/assets/game_background.png"
				class="absolute inset-0 w-full h-full object-contain "
				alt="Arcade machine" />
	
	<!-- Game play area - positioned over the arcade screen -->
		<div id="gameWindow" class="absolute z-10 backdrop-blur-sm"
			style="top: 6.1%; left: 24.1%; width: 51%; height: 59.2%;
			background: var(--game-area-background);
			border: 9px solid var(--color-frame);
			border-radius: 1rem;">

	<!-- Center net divider line -->
					<div class="absolute border-r-[0.8vw] border-dotted border-[rgba(255,255,255,0.3)]
					h-[96%] top-[2%] left-[calc(50%-0.4vw)]"></div>
	
	<!-- Player score displays -->
					<span id="score1"
					class="absolute top-[5%] left-[25%] text-[1.5vw] leading-none select-none">0</span>
	
					<span id="score2"
					class="absolute top-[5%] right-[25%] text-[1.5vw] leading-none select-none">0</span>
	
	<!-- Player paddles (left and right) -->
					<div id="paddle1"
					class="absolute h-[25%] w-[3.3%] bg-[rgba(255,255,255,0.9)]
					top-[37.5%]"></div>
	
					<div id="paddle2"
					class="absolute h-[25%] w-[3.3%] bg-[rgba(255,255,255,0.9)]
					top-[37.5%] right-0"></div>
	
	<!-- Game ball -->
					<div id="ball"
					class="absolute h-[5%] w-[3.3%] bg-[rgba(255,255,255,0.9)]
					rounded-[30%] left-[48.3%] top-[47.5%]"></div>
	
	<!-- Start instruction text -->
					<p id="startPress"
					class="absolute bottom-[5%] left-1/2 -translate-x-1/2 text-center
					bg-[#222222]/80 rounded px-4 py-2 text-[clamp(14px,1vw,20px)] select-none">
					${t("pressReady")}
					</p>

	<!-- Game sound effects -->
					<audio id="paddleSound" src="/assets/paddle.wav"></audio>
					<audio id="lossSound" src="/assets/loss.wav"></audio>
					<audio id="wallSound" src="/assets/wall.wav"></audio>

				</div>
			</div>
		</div>

		<!-- Game Over Overlay (shown when time runs out) -->
		<div id="timeUpOverlay" class="hidden fixed inset-0 bg-black/80 flex items-center justify-center z-50">
			<div class="bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-400/30 rounded-2xl p-8 max-w-md text-center">
				<h2 class="text-3xl font-bold text-white mb-4">${t("timeUp")}</h2>
				<div id="winnerText" class="text-2xl font-semibold text-emerald-300 mb-6"></div>
				<button id="continueToResults" class="px-6 py-3 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 transition cursor-pointer">
					${t("continue")}
				</button>
			</div>
		</div>
		`;
	}
	