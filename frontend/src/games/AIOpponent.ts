import { addTheme } from "../components/Theme"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { TimerDisplay, startTimer, resetTimer } from "../components/Timer";
import { initGameAIOpponent } from "./InitGameAIOpponent";

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

<!-- Game section -->
	<div class="flex justify-center w-screen overflow-hidden">
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

<!-- Difficulty Selection Overlay (shown by default) -->
	<div id="difficultySelectionOverlay"
		class="absolute inset-0 z-20"
		style="border-radius: inherit; background: inherit;">

	<!-- Content column -->
	<div class="relative h-full w-full flex flex-col items-center justify-center px-4
				animate-zoomIn">
		<!-- Top title -->
		<h2 class="text-3xl font-bold text-white mb-2">Choose Difficulty</h2>

		<!-- Subtitle -->
		<p class="text-lg text-gray-200 mb-8">Select your AI opponent level</p>

		<!-- Difficulty buttons -->
		<div class="flex gap-4 mb-8">
			<button id="btnEasy"
				class="px-6 py-3 rounded-xl font-semibold text-white transition hover:shadow cursor-pointer bg-purple-600 hover:bg-purple-700">
				Easy
			</button>
			<button id="btnMedium"
				class="px-6 py-3 rounded-xl font-semibold text-white transition hover:shadow cursor-pointer bg-purple-600 hover:bg-purple-700">
				Medium
			</button>
			<button id="btnHard"
				class="px-6 py-3 rounded-xl font-semibold text-white transition hover:shadow cursor-pointer bg-purple-600 hover:bg-purple-700">
				Hard
			</button>
		</div>

		<!-- Back button -->
		<button id="backToIntro"
				class="px-6 py-3 rounded-xl font-semibold text-white transition hover:shadow cursor-pointer bg-gray-600 hover:bg-gray-700">
		Back to Arcade Clash
		</button>
	</div>
	</div>

<!-- Time Up Overlay (hidden by default) inherits from Game window-->
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

		<!-- Buttons -->
		<div class="flex gap-4">
			<button id="playAgain"
					class="px-6 py-3 rounded-xl font-semibold text-white transition hover:shadow cursor-pointer bg-purple-600 hover:bg-purple-700">
			Play Again
			</button>
			<button id="overlayExit"
					class="px-6 py-3 rounded-xl font-semibold text-white transition hover:shadow cursor-pointer bg-gray-600 hover:bg-gray-700">
			Back to Arcade Clash
			</button>
		</div>
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
				rounded-[30%] left-[48.3%] top-[47.5%] transition-none"></div>

<!-- Start text -->
				<p id="startPress"
				class="absolute bottom-[5%] left-1/2 -translate-x-1/2 text-center
				bg-[#222222]/80 rounded px-4 py-2 text-[clamp(14px,1vw,20px)] select-none">
				Press Space To Start The Game
				</p>

				<p id="keyboardHintAI"
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

// Global variables for game state
let currentDifficulty: "easy" | "medium" | "hard" = "medium";
let gameInitialized = false;

// Setup function for AI opponent game
export function setupAIOpponent() {
	console.log("Setting up AI opponent game");
	
	// Get elements
	const difficultyOverlay = document.getElementById("difficultySelectionOverlay");
	const timeUpOverlay = document.getElementById("timeUpOverlay");
	const startPress = document.getElementById("startPress");
	const keyboardHint = document.getElementById("keyboardHintAI");
	
	const btnEasy = document.getElementById("btnEasy");
	const btnMedium = document.getElementById("btnMedium");
	const btnHard = document.getElementById("btnHard");
	const backToIntro = document.getElementById("backToIntro");
	const playAgain = document.getElementById("playAgain");
	const overlayExit = document.getElementById("overlayExit");

	// Show difficulty selection on page load
	if (difficultyOverlay) {
		difficultyOverlay.classList.remove("hidden");
	}
	if (timeUpOverlay) {
		timeUpOverlay.classList.add("hidden");
	}

	// Difficulty selection handlers
	function selectDifficulty(level: "easy" | "medium" | "hard") {
		console.log("Difficulty selected:", level);
		currentDifficulty = level;
		
		// Hide difficulty overlay
		if (difficultyOverlay) {
			difficultyOverlay.classList.add("hidden");
		}
		
		// Show game elements
		if (startPress) {
			startPress.classList.remove("hidden");
		}
		if (keyboardHint) {
			keyboardHint.classList.remove("hidden");
		}
		
		// Reset timer with correct time for selected difficulty
		const difficultyTimes = { easy: 40, medium: 30, hard: 20 };
		const duration = difficultyTimes[level];
		resetTimer(duration);
		
		// Initialize game with selected difficulty
		initGameAIOpponent(level);
		gameInitialized = true;
	}

	// Event listeners for difficulty buttons
	btnEasy?.addEventListener("click", () => selectDifficulty("easy"));
	btnMedium?.addEventListener("click", () => selectDifficulty("medium"));
	btnHard?.addEventListener("click", () => selectDifficulty("hard"));

	// Back to intro handler
	backToIntro?.addEventListener("click", () => {
		window.location.hash = "intro";
	});

	// Play again handler
	playAgain?.addEventListener("click", () => {
		console.log("Play again clicked");
		
		// Hide time up overlay
		if (timeUpOverlay) {
			timeUpOverlay.classList.add("hidden");
		}
		
		// Reset game state
		gameInitialized = false;
		
		// Reset scores and positions
		const score1 = document.getElementById("score1");
		const score2 = document.getElementById("score2");
		const ball = document.getElementById("ball");
		const paddle1 = document.getElementById("paddle1");
		const paddle2 = document.getElementById("paddle2");
		
		if (score1) score1.textContent = "0";
		if (score2) score2.textContent = "0";
		if (ball) {
			ball.style.left = "48.3%";
			ball.style.top = "47.5%";
		}
		if (paddle1) paddle1.style.top = "37.5%";
		if (paddle2) paddle2.style.top = "37.5%";
		
		// Show difficulty selection again
		if (difficultyOverlay) {
			difficultyOverlay.classList.remove("hidden");
		}
		if (startPress) {
			startPress.classList.add("hidden");
		}
		if (keyboardHint) {
			keyboardHint.classList.add("hidden");
		}
	});

	// Exit handler
	overlayExit?.addEventListener("click", () => {
		window.location.hash = "intro";
	});

	// Listen for game end event to show winner
	window.addEventListener("game:timeup", () => {
		console.log("Game ended, showing winner");
		if (timeUpOverlay) {
			timeUpOverlay.classList.remove("hidden");
		}
		if (startPress) {
			startPress.classList.add("hidden");
		}
		if (keyboardHint) {
			keyboardHint.classList.add("hidden");
		}
	});
}

// Make setup function globally accessible
(window as any).setupAIOpponent = setupAIOpponent;

// Declare global function for TypeScript
declare global {
	interface Window {
		setupAIOpponent: () => void;
	}
}
