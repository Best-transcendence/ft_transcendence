import { addTheme } from "../components/Theme"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { TimerDisplay, startTimer, resetTimer } from "../components/Timer";
import { initGameAIOpponent } from "./InitGameAIOpponent";

// Global variables for game controls
let currentDifficulty = "medium";
let pendingLevel: string | null = null;

// Setup function for AI game controls
function setupAIGameControls() {
	console.log("Setting up AI game controls");
	
	const buttons = {
		easy: document.getElementById("btnEasy"),
		medium: document.getElementById("btnMedium"),
		hard: document.getElementById("btnHard"),
	};

	const popup = document.getElementById("restartPopup");
	const popupText = document.getElementById("popupText");
	const confirmRestart = document.getElementById("confirmRestart");
	const cancelRestart = document.getElementById("cancelRestart");
	const restartBtn = document.getElementById("btnRestart");

	// --- Popup confirmation handler ---
	function showPopup(level: string, isRestart = false) {
		pendingLevel = level;
		popupText!.textContent = isRestart
			? "Restart the game from scratch?"
			: "Restart the game with \"" + level.toUpperCase() + "\" difficulty?";

		popup!.classList.remove("hidden");
		document.body.classList.add("overflow-hidden");
	}

	confirmRestart!.onclick = () => {
		console.log("Confirm restart clicked, pendingLevel:", pendingLevel);
		popup!.classList.add("hidden");
		document.body.classList.remove("overflow-hidden");

		if (pendingLevel === "restart") {
			// Direct restart without changing difficulty
			console.log("Performing full restart");
			restartGame(currentDifficulty, true);
		} else {
			console.log("Changing difficulty to:", pendingLevel);
			currentDifficulty = pendingLevel!;
			restartGame(currentDifficulty, true); // Set fullReset to true for difficulty changes
		}
	};

	cancelRestart!.onclick = () => {
		popup!.classList.add("hidden");
		document.body.classList.remove("overflow-hidden");
	};

	// --- Full reset (for restart or difficulty switch) ---
	function restartGame(level: string, fullReset = false) {
		console.log("Restarting game with level:", level, "fullReset:", fullReset);
		
		// Stop any running game first
		if (typeof (window as any).resetAIGame === 'function') {
			console.log("Calling global resetAIGame function to stop current game");
			(window as any).resetAIGame();
		}
		
		// visually highlight active difficulty button
		Object.values(buttons).forEach(b => b?.classList.remove("bg-purple-500/20"));
		buttons[level as keyof typeof buttons]?.classList.add("bg-purple-500/20");

		// reset texts
		document.querySelector("#startPress")?.classList.remove("hidden");
		document.querySelector("#controlsHint")?.classList.remove("hidden");

		// reset scores to 0-0
		document.getElementById("score1")!.textContent = "0";
		document.getElementById("score2")!.textContent = "0";

		// reset ball and paddle positions
		const ball = document.getElementById("ball");
		const paddle1 = document.getElementById("paddle1");
		const paddle2 = document.getElementById("paddle2");
		if (ball) {
			ball.style.left = "48.3%";
			ball.style.top = "47.5%";
		}
		if (paddle1) paddle1.style.top = "37.5%";
		if (paddle2) paddle2.style.top = "37.5%";

		// if fullRestart, reset timer display with correct duration for difficulty
		if (fullReset) {
			const difficultyTimes = { easy: 90, medium: 60, hard: 45 };
			const duration = difficultyTimes[level as keyof typeof difficultyTimes] || 60;
			resetTimer(duration);
		}
		
		// Re-initialize the game with new difficulty to update speed and other settings
		console.log("Re-initializing game with new difficulty:", level);
		initGameAIOpponent(level as "easy" | "medium" | "hard");
	}

	// --- Event bindings ---
	Object.entries(buttons).forEach(([level, btn]) => {
		btn?.addEventListener("click", () => {
			console.log("Difficulty button clicked:", level);
			showPopup(level);
		});
	});

	restartBtn?.addEventListener("click", () => {
		console.log("Restart button clicked");
		showPopup("restart", true);
	});

	// Initial setup
	buttons[currentDifficulty as keyof typeof buttons]?.classList.add("bg-purple-500/20");
}

// Make setup function globally accessible
(window as any).setupAIGameControls = setupAIGameControls;

// Export a function to set up controls for the router
export function setupAIControls() {
	console.log("Setting up AI controls from router");
	setupAIGameControls();
}

// Declare global function for TypeScript
declare global {
	interface Window {
		setupAIGameControls: () => void;
	}
}

export function GamePongAIOpponent(): string {
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

<!-- Popup confirmation -->
<div id="restartPopup"
	class="hidden fixed inset-0 flex items-center justify-center bg-black/60 z-50">
	<div class="bg-[#222]/90 border border-purple-400 rounded-xl p-6 text-center text-white w-[300px]">
		<p id="popupText" class="mb-4 text-[clamp(14px,1vw,18px)]"></p>
		<div class="flex justify-center gap-4">
			<button id="confirmRestart"
				class="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition">
				Yes
			</button>
			<button id="cancelRestart"
				class="px-3 py-1 bg-gray-500 rounded hover:bg-gray-600 transition">
				Cancel
			</button>
		</div>
	</div>
</div>

<!-- Difficulty Buttons -->
<div class="flex justify-center gap-4 mt-4 relative z-10">
	<button id="btnEasy"
		class="difficulty-btn border border-purple-400 text-white px-4 py-2 rounded-lg 
		hover:bg-purple-500/20 active:scale-95 active:shadow-inner transition">
		Easy
	</button>

	<button id="btnMedium"
		class="difficulty-btn border border-purple-400 text-white px-4 py-2 rounded-lg 
		hover:bg-purple-500/20 active:scale-95 active:shadow-inner transition">
		Medium
	</button>

	<button id="btnHard"
		class="difficulty-btn border border-purple-400 text-white px-4 py-2 rounded-lg 
		hover:bg-purple-500/20 active:scale-95 active:shadow-inner transition">
		Hard
	</button>
</div>

<!-- Restart button -->
<div class="flex justify-center mt-4">
  <button id="btnRestart"
    class="border border-red-500 text-red-300 px-5 py-2 rounded-lg hover:bg-red-700/20 active:scale-95 transition">
    Restart Game
  </button>
</div>


<!-- Game section -->
	<div class="flex justify-center w-screen overflow-hidden mt-4">
		<div class="relative"
		style="position: absolute; top: vh; left: 50%; transform: translateX(-50%); width: 90vw; max-width: 1450px; aspect-ratio: 16/9;">

<!-- Arcade image anchor -->
			<img src="/assets/game_background.png"
			class="absolute inset-0 w-full h-full object-contain "
			alt="Arcade machine" />

<!-- Game window -->
			<div class="absolute z-10 backdrop-blur-sm"
			style="top: 6.1%; left: 24.1%; width: 51%; height: 59.2%;
			background: rgba(7,26,29);
			border: 9px solid #919bebc7;
			border-radius: 1rem;">

  <!-- Time Up Overlay (hidden by default) -->
	<div id="timeUpOverlay"
		class="absolute inset-0 z-20 hidden"
		style="border-radius: inherit; background: inherit;">

	<!-- Content column -->
	<div class="relative h-full w-full flex flex-col items-center justify-start pt-6 px-4
				animate-zoomIn">
		<!-- Top title -->
		<h2 class="text-2xl font-bold text-white">Time's up!</h2>

		<!-- Subtitle -->
		<p id="winnerText" class="text-lg text-gray-200 mt-2 mb-6">You won 🥇</p>

		<!-- Button -->
		<button id="overlayExit"
				class="px-6 py-3 rounded-xl font-semibold text-white transition hover:shadow cursor-pointer bg-purple-600 hover:bg-purple-700">
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

				<p id="controlsHint"
					class="absolute bottom-[15%] left-1/2 -translate-x-1/2 text-center
					bg-[#222222]/80 rounded px-4 py-2 text-[clamp(14px,1vw,20px)] select-none">
					You are the <span class="font-semibold text-white">RIGHT</span> paddle
					<span class="font-semibold"><br>
					Use the 
					<span class="text-purple-600">↑</span>
					<span class="text-purple-600">↓</span>
					<span class="text-purple-600">←</span>
					<span class="text-purple-600">→</span>
					arrows!
				</p></span>
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
