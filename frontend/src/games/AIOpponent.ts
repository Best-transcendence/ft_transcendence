/**
 * AI Opponent Game Module
 * 
 * This module handles the UI and user interaction for the AI opponent Pong game.
 * It provides the HTML template, difficulty selection, and game lifecycle management.
 * 
 * Key features:
 * - Difficulty selection overlay (Easy, Medium, Hard)
 * - Game timer integration
 * - Winner display overlay
 * - Game state management
 * - Event handling for user interactions
 */

import { addTheme } from "../components/Theme"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { TimerDisplay, startTimer, resetTimer } from "../components/Timer";
import { createAIGame, destroyAIGame, isGameRunning } from "./AIGameController";

/**
 * Generates the HTML template for the AI opponent game page
 * 
 * Creates a complete game interface with:
 * - Arcade machine background
 * - Game window with paddles, ball, and scores
 * - Difficulty selection overlay
 * - Time up overlay for game end
 * - Audio elements for sound effects
 * 
 * @returns HTML string for the game page
 */
export function GamePongAIOpponent(): string {
  return `
	${ addTheme() }

	<!-- Background gradient overlay -->
	<div class="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_50%,rgba(0,0,0,1)_100%)] z-0"></div>

	<!-- Header with user info and navigation -->
	<div class="w-full
		flex justify-between items-center
		mb-10 relative z-3">

		<!-- Protected pages components -->
		${ profileDivDisplay() }
		${ sidebarDisplay() }
		${ LogOutBtnDisplay() }
	</div>

	<!-- Game timer display -->
	${ TimerDisplay() }

	<!-- Main game section -->
	<div class="flex justify-center w-screen overflow-hidden">
		<!-- Game container with arcade machine styling -->
		<div class="relative"
		style="position: absolute; top: vh; left: 50%; transform: translateX(-50%); width: 90vw; max-width: 1450px; aspect-ratio: 16/9;">

		<!-- Arcade machine background image -->
		<img src="/assets/game_background.png"
		class="absolute inset-0 w-full h-full object-contain "
		alt="Arcade machine" />

		<!-- Game window (the actual playable area) -->
		<div class="absolute z-10 backdrop-blur-sm"
		style="top: 6.1%; left: 24.1%; width: 51%; height: 59.2%;
		background: rgba(7,26,29);
		border: 9px solid #919bebc7;
		border-radius: 1rem;">

		<!-- DIFFICULTY SELECTION OVERLAY (shown by default) -->
		<div id="difficultySelectionOverlay"
			class="absolute inset-0 z-20"
			style="border-radius: inherit; background: inherit;">

		<!-- Content column with centered layout -->
		<div class="relative h-full w-full flex flex-col items-center justify-center px-4
					animate-zoomIn">
			<!-- Main title -->
			<h2 class="text-3xl font-bold text-white mb-2">Choose Difficulty</h2>

			<!-- Subtitle explaining the selection -->
			<p class="text-lg text-gray-200 mb-8">Select your AI opponent level</p>

			<!-- Difficulty selection buttons -->
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

			<!-- Navigation back to main menu -->
			<button id="backToIntro"
					class="px-6 py-3 rounded-xl font-semibold text-white transition hover:shadow cursor-pointer bg-gray-600 hover:bg-gray-700">
			Back to Arcade Clash
			</button>
		</div>
		</div>

		<!-- TIME UP OVERLAY (hidden by default, shown when game ends) -->
		<div id="timeUpOverlay"
			class="absolute inset-0 z-20 hidden"
			style="border-radius: inherit; background: inherit;">

		<!-- Content column with top-aligned layout -->
		<div class="relative h-full w-full flex flex-col items-center justify-start pt-6 px-4
					animate-zoomIn">
			<!-- Game over title -->
			<h2 class="text-2xl font-bold text-white">Time's up!</h2>

			<!-- Winner announcement (dynamically updated) -->
			<p id="winnerText" class="text-lg text-gray-200 mt-2 mb-6">You won 🥇</p>

			<!-- Action buttons -->
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

		<!-- GAME ELEMENTS -->
		
		<!-- Center net dividing the field -->
		<div class="absolute border-r-[0.8vw] border-dotted border-[rgba(255,255,255,0.3)]
		h-[96%] top-[2%] left-[calc(50%-0.4vw)]"></div>

		<!-- Score displays -->
		<span id="score1"
		class="absolute top-[5%] left-[25%] text-[1.5vw] leading-none select-none">0</span>

		<span id="score2"
		class="absolute top-[5%] right-[25%] text-[1.5vw] leading-none select-none">0</span>

		<!-- Game paddles -->
		<div id="paddle1"
		class="absolute h-[25%] w-[3.3%] bg-[rgba(255,255,255,0.9)]
		top-[37.5%]"></div>

		<div id="paddle2"
		class="absolute h-[25%] w-[3.3%] bg-[rgba(255,255,255,0.9)]
		top-[37.5%] right-0"></div>

		<!-- Game ball -->
		<div id="ball"
		class="absolute h-[5%] w-[3.3%] bg-[rgba(255,255,255,0.9)]
		rounded-[30%] left-[48.3%] top-[47.5%] transition-none"></div>

		<!-- Game start instruction -->
		<p id="startPress"
		class="absolute bottom-[5%] left-1/2 -translate-x-1/2 text-center
		bg-[#222222]/80 rounded px-4 py-2 text-[clamp(14px,1vw,20px)] select-none">
		Press Space To Start The Game
		</p>

		<!-- Keyboard controls hint -->
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

		<!-- Audio elements for sound effects -->
		<audio id="paddleSound" src="/assets/paddle.wav"></audio>
		<audio id="lossSound" src="/assets/loss.wav"></audio>
		<audio id="wallSound" src="/assets/wall.wav"></audio>

			</div>
		</div>
	</div>
	`;
}

// --- GLOBAL STATE VARIABLES ---
/**
 * Currently selected difficulty level
 * Used to track which difficulty was chosen for the current game session
 */
let currentDifficulty: "easy" | "medium" | "hard" = "medium";

/**
 * Flag indicating whether a game has been initialized
 * Used to prevent multiple game initializations and manage state transitions
 */
let gameInitialized = false;

/**
 * Sets up the AI opponent game interface and event handlers
 * 
 * This function is called when the AI opponent page is loaded and handles:
 * - DOM element references
 * - Event listener setup for difficulty selection
 * - Game state management
 * - UI overlay visibility control
 * - Game lifecycle coordination
 */
export function setupAIOpponent() {
	console.log("Setting up AI opponent game");
	
	// --- DOM ELEMENT REFERENCES ---
	// Get references to all interactive elements
	const difficultyOverlay = document.getElementById("difficultySelectionOverlay");
	const timeUpOverlay = document.getElementById("timeUpOverlay");
	const startPress = document.getElementById("startPress");
	const keyboardHint = document.getElementById("keyboardHintAI");
	
	// Difficulty selection buttons
	const btnEasy = document.getElementById("btnEasy");
	const btnMedium = document.getElementById("btnMedium");
	const btnHard = document.getElementById("btnHard");
	const backToIntro = document.getElementById("backToIntro");
	const playAgain = document.getElementById("playAgain");
	const overlayExit = document.getElementById("overlayExit");

	// --- INITIAL UI STATE ---
	// Show difficulty selection overlay on page load
	if (difficultyOverlay) {
		difficultyOverlay.classList.remove("hidden");
	}
	// Ensure time up overlay is hidden initially
	if (timeUpOverlay) {
		timeUpOverlay.classList.add("hidden");
	}

	// --- DIFFICULTY SELECTION HANDLER ---
	/**
	 * Handles difficulty selection and game initialization
	 * 
	 * @param level - Selected difficulty level ("easy", "medium", or "hard")
	 */
	function selectDifficulty(level: "easy" | "medium" | "hard") {
		console.log("=== DIFFICULTY SELECTED ===", level);
		currentDifficulty = level;
		
		// --- GAME CLEANUP ---
		// Destroy any existing game to prevent conflicts
		destroyAIGame();
		
		// --- UI STATE TRANSITION ---
		// Hide difficulty selection overlay
		if (difficultyOverlay) {
			difficultyOverlay.classList.add("hidden");
		}
		
		// Show game interface elements
		if (startPress) {
			startPress.classList.remove("hidden");
		}
		if (keyboardHint) {
			keyboardHint.classList.remove("hidden");
		}
		
		// --- TIMER SETUP ---
		// Set timer duration based on difficulty level
		const difficultyTimes = { easy: 40, medium: 30, hard: 20 };
		const duration = difficultyTimes[level];
		resetTimer(duration);
		
		// --- GAME INITIALIZATION ---
		// Create new game instance using singleton pattern
		createAIGame(level);
		gameInitialized = true;
		console.log("=== NEW GAME STARTED ===");
	}

	// --- EVENT LISTENERS ---
	// Difficulty selection button handlers
	btnEasy?.addEventListener("click", () => selectDifficulty("easy"));
	btnMedium?.addEventListener("click", () => selectDifficulty("medium"));
	btnHard?.addEventListener("click", () => selectDifficulty("hard"));

	// Navigation back to main menu
	backToIntro?.addEventListener("click", () => {
		window.location.hash = "intro";
	});

	// --- PLAY AGAIN HANDLER ---
	/**
	 * Handles the "Play Again" button click
	 * Resets the game state and returns to difficulty selection
	 */
	playAgain?.addEventListener("click", () => {
		console.log("=== PLAY AGAIN CLICKED ===");
		
		// --- GAME CLEANUP ---
		// Destroy any existing game instance
		destroyAIGame();
		
		// Hide time up overlay
		if (timeUpOverlay) {
			timeUpOverlay.classList.add("hidden");
		}
		
		// --- STATE RESET ---
		// Reset game initialization flag
		gameInitialized = false;
		console.log("Game state reset, gameInitialized:", gameInitialized);
		
		// --- VISUAL ELEMENT RESET ---
		// Reset all game elements to initial positions and scores
		const score1 = document.getElementById("score1");
		const score2 = document.getElementById("score2");
		const ball = document.getElementById("ball");
		const paddle1 = document.getElementById("paddle1");
		const paddle2 = document.getElementById("paddle2");
		
		console.log("Resetting visual elements");
		if (score1) {
			console.log("Resetting score1 from", score1.textContent, "to 0");
			score1.textContent = "0";
		}
		if (score2) {
			console.log("Resetting score2 from", score2.textContent, "to 0");
			score2.textContent = "0";
		}
		if (ball) {
			ball.style.left = "48.3%";
			ball.style.top = "47.5%";
		}
		if (paddle1) paddle1.style.top = "37.5%";
		if (paddle2) paddle2.style.top = "37.5%";
		
		// --- UI STATE RESTORATION ---
		// Return to difficulty selection screen
		if (difficultyOverlay) {
			difficultyOverlay.classList.remove("hidden");
		}
		if (startPress) {
			startPress.classList.add("hidden");
		}
		if (keyboardHint) {
			keyboardHint.classList.add("hidden");
		}
		
		console.log("=== PLAY AGAIN COMPLETE ===");
	});

	// --- EXIT HANDLER ---
	// Return to main menu from time up overlay
	overlayExit?.addEventListener("click", () => {
		window.location.hash = "intro";
	});

	// --- GAME END EVENT LISTENER ---
	/**
	 * Listens for the game timer end event
	 * Shows the winner overlay when the game time expires
	 */
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

// --- GLOBAL FUNCTION EXPOSURE ---
// Make setup function globally accessible for external calls
(window as any).setupAIOpponent = setupAIOpponent;

// --- TYPESCRIPT GLOBAL DECLARATIONS ---
// Declare global function for TypeScript type checking
declare global {
	interface Window {
		setupAIOpponent: () => void;
	}
}
