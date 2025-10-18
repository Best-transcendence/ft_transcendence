import { addTheme } from "../components/Theme"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { TimerDisplay, startTimer } from "../components/Timer";

export function GamePongTournament(): string {
  return `
		${ addTheme() }
	
		<div class="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_50%,rgba(0,0,0,1)_100%)] z-0"></div>
	
	<!-- Header with user info -->
		<div class="w-full
			flex justify-between items-center
			mb-10 relative z-3">
	
	<!-- Protected pages components -->
			${ profileDivDisplay() }
			${ sidebarDisplay() }
			${ LogOutBtnDisplay() }
		</div>
	
	${ TimerDisplay() }
	
	
	<!-- Game section -->
		<div class="flex justify-center w-screen overflow-hidden">
			<div class="relative"
			style="position: absolute; top: vh; left: 50%; transform: translateX(-50%); width: 90vw; max-width: 1450px; aspect-ratio: 16/9;">
	
	<!-- Arcade image anchor -->
				<img src="/assets/game_background.png"
				class="absolute inset-0 w-full h-full object-contain "
				alt="Arcade machine" />
	
	<!-- Game window -->
			<div id="gameWindow" class="absolute z-10 backdrop-blur-sm"
				style="top: 6.1%; left: 24.1%; width: 51%; height: 59.2%;
				background: var(--game-area-background);
				border: 9px solid var(--color-frame);
				border-radius: 1rem;">
	
	  <!-- Time Up Overlay (hidden by default) inherits from Game window-->
		<div id="timeUpOverlay"
			class="absolute inset-0 z-20 hidden"
			style="border-radius: inherit; background: inherit;">
	
		<!-- Content column -->
		<div class="relative h-full w-full flex flex-col items-center justify-start pt-6 px-4
					animate-zoomIn">
			<!-- Top title -->
			<h2 class="text-2xl font-bold text-white">Time’s up!</h2>
	
			<!-- Subtitle -->
			<p class="text-lg text-gray-200 mt-2 mb-6">You won 🥇</p>
	
			<!-- Button -->
			<button id="overlayExit"
					class="px-6 py-3 rounded-xl font-semibold text-white transition hover:shadow cursor-pointer bg-[var(--color-button)] hover:bg-[var(--color-button-hover)]">
			Back to Arcade Clash
			</button>
		</div>
		</div>
	
	<!-- Net -->
					<div class="absolute border-r-[0.8vw] border-dotted border-[rgba(255,255,255,0.3)]
					h-[96%] top-[2%] left-[calc(50%-0.4vw)]"></div>
	
	<!-- Scores -->
					<span id="score1"
					class="absolute top-[5%] left-[25%] text-[1.5vw] leading-none select-none">0</span>
	
					<span id="score2"
					class="absolute top-[5%] right-[25%] text-[1.5vw] leading-none select-none">0</span>
	
	<!-- Paddles -->
					<div id="paddle1"
					class="absolute h-[25%] w-[3.3%] bg-[rgba(255,255,255,0.9)]
					top-[37.5%]"></div>
	
					<div id="paddle2"
					class="absolute h-[25%] w-[3.3%] bg-[rgba(255,255,255,0.9)]
					top-[37.5%] right-0"></div>
	
	<!-- Ball -->
					<div id="ball"
					class="absolute h-[5%] w-[3.3%] bg-[rgba(255,255,255,0.9)]
					rounded-[30%] left-[48.3%] top-[47.5%]"></div>
	
	<!-- Start text -->
					<p id="startPress"
					class="absolute bottom-[5%] left-1/2 -translate-x-1/2 text-center
					bg-[#222222]/80 rounded px-4 py-2 text-[clamp(14px,1vw,20px)] select-none">
					Press Space To Start The Game
					</p>
	
	<!-- Audio -->
					<audio id="paddleSound" src="/assets/paddle.wav"></audio>
					<audio id="lossSound" src="/assets/loss.wav"></audio>
					<audio id="wallSound" src="/assets/wall.wav"></audio>
	
				</div>
			</div>
		</div>
		`;
	}
	