import { thisUser } from "../router";
import { MatchObject, saveMatch } from "../services/matchActions";
import { startTimer } from "../components/Timer";
import { t } from "../services/lang/LangEngine";

// Global variables for scores and game state
let globalScoreAI = 0;
let globalScorePlayer = 0;
let globalAnimationFrameId: number | null = null;
let globalGameRunning = false;
let currentInstanceId = 0; // Track which instance is active

// Overlay gating
let modalActive = false;          // true when any blocking overlay is visible
let allowKeyboardStart = true;    // only allow starting via Space when true

function isVisible(el: HTMLElement | null): boolean {
  return !!el && !el.classList.contains("hidden");
}

/*
 * AI Opponent Implementation
 * 
 * This AI opponent uses a simple heuristic algorithm based on a finite
 * state machine with two main states: "Track" (when the ball is coming
 * toward the AI) and "Recover" (when the ball is going away). The AI
 * predicts the ball's trajectory, including wall bounces, and adjusts
 * its paddle movement accordingly. Reaction time, aiming error, and
 * paddle speed are adjusted per difficulty level (easy, medium, hard),
 * simulating a human-like opponent.
 * 
 * The AI does not use any pathfinding or optimization algorithms like
 * A*. Such algorithms (e.g., A*, Dijkstra) are forbidden in this project
 * because they simulate perfect future knowledge and would make the AI
 * unfairly strong. Instead, this AI reacts only based on current ball
 * velocity and position, with deliberate limitations in perception and
 * response.
 * 
 * This approach results in a fair, responsive AI that can win or lose
 * based on gameplay, without requiring advanced planning or search.
 */

export function initGameAIOpponent(level: "easy" | "medium" | "hard" = "medium"): { destroy: () => void } {
	// Create unique instance ID - this instance is now the active one
	const myInstanceId = ++currentInstanceId;
	console.log("=== NEW GAME INSTANCE CREATED ===", myInstanceId);
	
	// Reset global state at the start of a new game instance
	globalScoreAI = 0;
	globalScorePlayer = 0;
	globalGameRunning = false;
	globalAnimationFrameId = null;
	(window as any).globalAnimationFrameId = null;
	
	// --- AI CONFIGURATION (Left Paddle) ---
	// The AI uses a finite state machine with difficulty-based parameters
	// Each difficulty level adjusts multiple aspects of AI behavior to create
	// progressively more challenging opponents while maintaining fair gameplay.

	const aiEnabled = true; // Left paddle is controlled by AI

	/*
	 * DIFFICULTY LEVEL PARAMETERS
	 * 
	 * Each difficulty level configures 6 key parameters that control AI behavior:
	 * 
	 * 1. reactionDelay (ms): How long AI waits before reacting to ball movement
	 *    - Simulates human reaction time
	 *    - Higher = slower, more human-like response
	 *    - Lower = faster, more robotic response
	 * 
	 * 2. aimError (pixels): Random error added to AI's target calculation
	 *    - Simulates human aiming imperfection
	 *    - Higher = less accurate, more mistakes
	 *    - Lower = more precise, fewer mistakes
	 * 
	 * 3. maxSpeed (units/frame): Maximum paddle movement speed
	 *    - Controls how fast AI can move to reach target
	 *    - Higher = can reach distant targets faster
	 *    - Lower = more realistic human movement speed
	 * 
	 * 4. followStrength (0-1): How aggressively AI follows the ball
	 *    - Controls paddle movement smoothness and responsiveness
	 *    - Higher = more aggressive, jerky movement
	 *    - Lower = smoother, more human-like movement
	 * 
	 * 5. ballSpeed (multiplier): Base speed of the ball
	 *    - Affects overall game pace and difficulty
	 *    - Higher = faster game, less time to react
	 *    - Lower = slower game, more time to plan
	 * 
	 * 6. gameTime (seconds): Duration of each game round
	 *    - Shorter games = more pressure, faster decisions needed
	 *    - Longer games = more strategic, endurance-based
	 */
	const DIFFICULTY = {
		easy: { 
			reactionDelay: 600, 
			aimError: 15, 
			maxSpeed: 1.6, 
			followStrength: 0.08, 
			ballSpeed: 1.0, 
			gameTime: 40 
		},
		medium: { 
			reactionDelay: 200, 
			aimError: 8, 
			maxSpeed: 2.0, 
			followStrength: 0.15, 
			ballSpeed: 1.5, 
			gameTime: 30 
		},
		hard: { 
			reactionDelay: 120, 
			aimError: 3, 
			maxSpeed: 2.3, 
			followStrength: 0.18, 
			ballSpeed: 2.5, 
			gameTime: 20 
		}
	};
  

	// --- AI STATE VARIABLES ---
	const aiLevel = DIFFICULTY[level]; // Current difficulty configuration
	let aiState: "Idle" | "Track" | "Recover" = "Idle"; // AI finite state machine state
	let aiTargetY = 50; // Y position the AI is trying to reach
	let aiReactionTimer = 0; // Timer for AI reaction delay

	// --- DOM ELEMENT REFERENCES ---
	// Helper function to get DOM elements by ID
	const $ = (id: string) => document.getElementById(id)!;

	// Game elements
	const paddle1 = $("paddle1"); // Left paddle (AI controlled)
	const paddle2 = $("paddle2"); // Right paddle (Player controlled)
	const ball = $("ball"); // Game ball
	const score1 = $("score1"); // AI score display
	const score2 = $("score2"); // Player score display
	const startPress = $("startPress"); // Start game button

	// --- GAME CONSTANTS ---
	// Field dimensions and object sizes (matches CSS percentages)
	const FIELD = 100; // Field width/height in percentage
	const BALL_W = 3.3, BALL_H = 5;      // Ball dimensions: w-[3.3%], h-[5%]
	const PADDLE_W = 3.3, PADDLE_H = 25; // Paddle dimensions: w-[3.3%], h-[25%]

	// --- GAME STATE VARIABLES ---
	let running = false; // Whether the game is currently running
	let animationFrameId = 0; // ID of current animation frame
	let aiIntervalId: number | null = null; // AI update interval timer
	let lastTime = 0; // Last frame time for consistent timing
	const targetFPS = 120; // Target frames per second
	const frameTime = 1000 / targetFPS; // Time per frame in milliseconds

	// --- SCORING VARIABLES ---
	let lastScorer: "ai" | "player" | null = null; // Who scored last (affects ball direction)
	let ballScored = false; // Flag to prevent multiple scoring events per ball

	// --- POSITION AND VELOCITY VARIABLES ---
	// Paddle positions (Y coordinates in percentage)
	let p1Y = 37.5, p2Y = 37.5; // Initial positions match CSS top-[37.5%]
	
	// Ball position and velocity
	let ballX = 50, ballY = 50; // Ball center position (percentage)
	let ballVelX = 0, ballVelY = 0; // Ball velocity (units per frame)

	// Paddle velocities and movement parameters
	let p1Vel = 0, p2Vel = 0; // Current paddle velocities
	const accel = 0.5; // Acceleration when key is pressed
	const maxSpeed = 2.5; // Maximum paddle speed
	const friction = 0.1; // Friction when no key is pressed

	// Input state flags
	let p1Up = false, p1Down = false, p2Up = false, p2Down = false;

	// --- AI FSM: periodic view (1Hz) ---
	aiIntervalId = window.setInterval(() => {
		// Only run if this is still the active instance
		if (myInstanceId !== currentInstanceId) return;
		if (!aiEnabled || !running) return;
		const snapshot = { x: ballX, y: ballY, vx: ballVelX, vy: ballVelY };
		updateAI(snapshot);
	}, 1000);
	// --- END AI FSM ---

	/**
	 * Handles the end of game timer
	 * Stops the game and displays the winner based on final scores
	 */
	function onTimeUp() {
		stopGame();
		const overlay = document.getElementById("timeUpOverlay");
		const winnerText = document.getElementById("winnerText");
		if (overlay) {
			// Determine winner based on final scores
			if (globalScoreAI > globalScorePlayer) {
				winnerText!.textContent = t("aiWon");
			} else if (globalScorePlayer > globalScoreAI) {
				winnerText!.textContent = t("youWon");
			} else {
				winnerText!.textContent = t("itsATie");
			}
			overlay.classList.remove("hidden");
		    // block keyboard while overlay is up
			modalActive = true;
            allowKeyboardStart = false;
		}
	}

	window.addEventListener("game:timeup", onTimeUp);

	const overlayExit = document.getElementById("overlayExit");
	overlayExit?.addEventListener("click", () => {
		  const overlay = document.getElementById("timeUpOverlay");
          overlay?.classList.add("hidden");
          modalActive = false;
          allowKeyboardStart = true;

		 window.location.hash = "intro";
	});

	document.addEventListener("keydown", (e) => {
		// If overlay is visible, swallow Space so it can't restart anything
		const timeUp = document.getElementById("timeUpOverlay");
		if (modalActive || isVisible(timeUp)) {
			if (e.code === "Space") {
			e.preventDefault();
			e.stopPropagation();
			}
		return; // don't process movement keys either while modal is active
		}
		if (e.code === "Space" && !running) {
			startTimer(aiLevel.gameTime);
			startGame();
		}
		if (e.key === "w") p1Up = true;
		if (e.key === "s") p1Down = true;
		if (e.key === "ArrowUp") p2Up = true;
		if (e.key === "ArrowDown") p2Down = true;
	});

	document.addEventListener("keyup", (e) => {
		if (e.key === "w") p1Up = false;
		if (e.key === "s") p1Down = false;
		if (e.key === "ArrowUp") p2Up = false;
		if (e.key === "ArrowDown") p2Down = false;
	});

	/**
	 * Starts the game
	 * Initializes game state, hides UI elements, resets ball position,
	 * and begins the main game loop
	 */
	function startGame() {
		running = true;
		globalGameRunning = true;
		lastTime = performance.now();
		startPress.classList.add("hidden");
		
		// Hide keyboard hint when game starts
		const keyboardHint = document.getElementById("keyboardHintAI");
		if (keyboardHint) {
			keyboardHint.classList.add("hidden");
		}
		
		resetBall();
		animationFrameId = requestAnimationFrame(loop);
		globalAnimationFrameId = animationFrameId;
		(window as any).globalAnimationFrameId = animationFrameId;
	}

	/**
	 * Stops the game
	 * Halts all game loops, cancels animation frames, and resets running state
	 */
	function stopGame() {
		console.log("=== STOPPING GAME ===");
		console.log("Running before stop:", running);
		console.log("Animation frame ID:", animationFrameId);
		
		running = false;
		globalGameRunning = false;
		if (animationFrameId) {
			console.log("Cancelling animation frame:", animationFrameId);
			cancelAnimationFrame(animationFrameId);
			animationFrameId = 0;
		}
		if (globalAnimationFrameId) {
			console.log("Cancelling global animation frame:", globalAnimationFrameId);
			cancelAnimationFrame(globalAnimationFrameId);
			globalAnimationFrameId = null;
			(window as any).globalAnimationFrameId = null;
		}
		
		console.log("Running after stop:", running);
		console.log("=== GAME STOPPED ===");
	}

	/**
	 * Resets the entire game to initial state
	 * Stops the game, resets all scores and positions, and shows start button
	 */
	function resetGame() {
		console.log("=== RESET GAME CALLED ===");
		stopGame();
		lastTime = 0;
		globalScoreAI = 0;
		globalScorePlayer = 0;
		lastScorer = null;
		ballScored = false;
		score1.textContent = "0";
		score2.textContent = "0";
		p1Y = 37.5;
		p2Y = 37.5;
		ballX = 50;
		ballY = 50;
		ballVelX = 0;
		ballVelY = 0;
		p1Vel = 0;
		p2Vel = 0;
		startPress.classList.remove("hidden");
		resetBall();
		console.log("=== RESET GAME COMPLETE ===");
	}

	/**
	 * Main game loop - runs at 120 FPS
	 * Updates game state, handles physics, and renders each frame
	 * Includes safety checks to prevent multiple instances from running
	 * 
	 * @param currentTime - Current timestamp from requestAnimationFrame
	 */
	function loop(currentTime: number) {
		// Check if this instance is still the active one - CRITICAL!
		if (myInstanceId !== currentInstanceId) {
			console.log("Game loop stopped - old instance", myInstanceId, "current:", currentInstanceId);
			return;
		}
		
		// Check if this instance should be destroyed - MUST BE FIRST
		if ((window as any).aiGameDestroyed === true || !running || !globalGameRunning) {
			console.log("Game loop stopped - destroyed:", (window as any).aiGameDestroyed, "running:", running, "globalGameRunning:", globalGameRunning);
			return;
		}
		
		// Use consistent timing to avoid browser differences
		if (currentTime - lastTime >= frameTime) {
			updatePaddles();
			updateBall();
			checkScoring(); // Check scoring after ball position update
			lastTime = currentTime;
		}
		
		// Always update ball position for smooth movement
		updateBallPosition();
		
		// Check again before scheduling next frame
		if (myInstanceId !== currentInstanceId || (window as any).aiGameDestroyed === true || !running || !globalGameRunning) {
			console.log("Game loop stopped before next frame");
			return;
		}
		
		animationFrameId = requestAnimationFrame(loop);
		globalAnimationFrameId = animationFrameId;
		(window as any).globalAnimationFrameId = animationFrameId;
	}

	/**
	 * Updates paddle positions and AI behavior
	 * Handles player input for right paddle and AI logic for left paddle
	 * Applies physics (acceleration, friction) and boundary constraints
	 */
	function updatePaddles() {
		// Check if this is still the active instance
		if (myInstanceId !== currentInstanceId) return;
		
		// Check if game is running
		if (!globalGameRunning) return;
		
		// Update player paddle (right) based on input
		p2Vel = applyInput(p2Up, p2Down, p2Vel);

		// Calculate AI paddle center for targeting
		const paddleCenterY = p1Y + PADDLE_H / 2;

		// --- AI FSM CONTROL ---
		if (aiEnabled) {
			const now = Date.now();

			// Simulate human reaction delay - AI only acts after delay period
			if (now > aiReactionTimer) {
				// AI decides to move up or down based on target position
				// Uses 3-pixel tolerance to avoid jittery movement
				p1Up = paddleCenterY > aiTargetY + 3;
				p1Down = paddleCenterY < aiTargetY - 3;
			}

			// Apply AI input to velocity (same physics as player)
			p1Vel = applyInput(p1Up, p1Down, p1Vel);
		}
		// --- END AI FSM CONTROL ---

		// Apply movement and clamp to field boundaries
		// Maximum Y position is field height minus paddle height
		const maxY = FIELD - PADDLE_H;
		p1Y = clamp(p1Y + p1Vel, 0, maxY);
		p2Y = clamp(p2Y + p2Vel, 0, maxY);

		// Update DOM positions
		paddle1.style.top = p1Y + "%";
		paddle2.style.top = p2Y + "%";
	}

	/**
	 * Applies input to paddle velocity with physics
	 * Handles acceleration, friction, and speed limits
	 * 
	 * @param up - Whether up key is pressed
	 * @param down - Whether down key is pressed  
	 * @param vel - Current velocity
	 * @returns New velocity after applying input
	 */
	function applyInput(up: boolean, down: boolean, vel: number): number {
		if (up) vel -= accel; // Accelerate upward
		if (down) vel += accel; // Accelerate downward
		if (!up && !down) vel *= (1 - friction); // Apply friction when no input
		return clamp(vel, -maxSpeed, maxSpeed); // Clamp to maximum speed
	}

	/**
	 * Updates ball physics and collision detection
	 * Handles ball movement, wall bounces, and paddle collisions
	 * Uses precise collision detection with ball and paddle dimensions
	 */
	function updateBall() {
		// Check if this is still the active instance
		if (myInstanceId !== currentInstanceId) return;
		
		// Check if game is running
		if (!globalGameRunning) return;
		
		// Update ball position based on velocity
		ballX += ballVelX;
		ballY += ballVelY;

		// --- WALL COLLISION DETECTION ---
		// Top wall collision
		if (ballY <= 0) {
			ballY = 0; // Prevent ball from going above field
			ballVelY *= -1; // Reverse vertical velocity
		} 
		// Bottom wall collision (accounting for ball height)
		else if (ballY >= FIELD - BALL_H) {
			ballY = FIELD - BALL_H; // Prevent ball from going below field
			ballVelY *= -1; // Reverse vertical velocity
		}

		// --- PADDLE COLLISION DETECTION ---
		// Left paddle (AI) collision
		// Ball hits when: ball's left edge reaches paddle's right edge
		// AND ball is still within field bounds
		// AND there's vertical overlap between ball and paddle
		if (
			ballX <= PADDLE_W && // Ball's left edge hits paddle's right edge
			ballX + BALL_W >= 0 && // Ball is still within field
			ballY + BALL_H >= p1Y && ballY <= p1Y + PADDLE_H // Vertical overlap
		) {
			ballX = PADDLE_W; // Resolve penetration by placing ball at paddle edge
			ballVelX *= -1; // Reverse horizontal velocity
		}

		// Right paddle (Player) collision
		// Ball hits when: ball's right edge reaches paddle's left edge
		// AND ball is still within field bounds
		// AND there's vertical overlap between ball and paddle
		if (
			ballX + BALL_W >= FIELD - PADDLE_W && // Ball's right edge hits paddle's left edge
			ballX <= FIELD && // Ball is still within field
			ballY + BALL_H >= p2Y && ballY <= p2Y + PADDLE_H // Vertical overlap
		) {
			ballX = FIELD - PADDLE_W - BALL_W; // Resolve penetration
			ballVelX *= -1; // Reverse horizontal velocity
		}
	}

	/**
	 * Updates ball visual position in DOM
	 * Called every frame for smooth 120 FPS movement
	 */
	function updateBallPosition() {
		// Update ball visual position every frame for smooth movement
		ball.style.left = ballX + "%";
		ball.style.top = ballY + "%";
	}

	/**
	 * Checks for scoring conditions and updates scores
	 * Handles ball going out of bounds and determines which player scored
	 * Prevents multiple scoring events per ball
	 */
	function checkScoring() {
		// Check if this is still the active instance - CRITICAL!
		if (myInstanceId !== currentInstanceId) {
			return;
		}
		
		// Check if this instance should be destroyed
		if ((window as any).aiGameDestroyed === true) return;
		
		// Check if game is running
		if (!globalGameRunning) return;
		
		// Only check scoring if ball hasn't already scored this round
		if (ballScored) {
			return;
		}

		// --- SCORING LOGIC ---
		// Left side - ball exits left, AI (left paddle) missed, so PLAYER scores
		if (ballX + BALL_W < 0) {
			ballScored = true; // Prevent multiple scoring
			globalScorePlayer++; // Player scores because AI missed
			score2.textContent = globalScorePlayer.toString();
			lastScorer = "player"; // Track who scored for next serve direction
			resetBall();
		} 
		// Right side - ball exits right, Player (right paddle) missed, so AI scores
		else if (ballX > FIELD) {
			ballScored = true; // Prevent multiple scoring
			globalScoreAI++; // AI scores because Player missed
			score1.textContent = globalScoreAI.toString();
			lastScorer = "ai"; // Track who scored for next serve direction
			resetBall();
		}
	}

	/**
	 * Resets ball to center and sets initial velocity
	 * Implements difficulty-based ball speed and strategic serving
	 * Different difficulty levels have different serving strategies
	 */
	function resetBall() {
		// Reset ball to center of field
		ballX = 50 - BALL_W / 2;
		ballY = 50 - BALL_H / 2;
		ballScored = false; // Reset scoring flag for new ball
	
		// Set base speeds based on difficulty level
		const baseSpeedX = aiLevel.ballSpeed;       // Horizontal speed depends on difficulty
		const baseSpeedY = aiLevel.ballSpeed * 0.7; // Vertical speed is slightly lower for better gameplay
	
		// --- HORIZONTAL DIRECTION (Fair serving) ---
		// Ball direction alternates based on who scored last
		if (lastScorer === "ai") {
			// AI scored (player missed), so ball goes toward AI (left) - AI serves
			ballVelX = -baseSpeedX;
		} else if (lastScorer === "player") {
			// Player scored (AI missed), so ball goes toward player (right) - Player serves
			ballVelX = baseSpeedX;
		} else {
			// First serve - random direction
			ballVelX = Math.random() > 0.5 ? baseSpeedX : -baseSpeedX;
		}
		
		// --- VERTICAL DIRECTION (Strategic serving) ---
		// Different difficulty levels use different serving strategies
		if (level === "hard" && lastScorer !== null) {
			// HARD: AI aims directly at player's paddle center (hardest to reach)
			const paddleCenterY = p2Y + PADDLE_H / 2;
			const targetY = paddleCenterY;
			const deltaY = targetY - ballY;
			const total = Math.abs(deltaY);
			ballVelY = baseSpeedY * (deltaY / total); 
		} else if (level === "medium" && lastScorer !== null) {
			// MEDIUM: AI aims between both paddles (easier to hit, more fair)
			const playerCenter = p2Y + PADDLE_H / 2;
			const aiCenter = p1Y + PADDLE_H / 2;
			const targetY = (playerCenter + aiCenter) / 2;
			const deltaY = targetY - ballY;
			const total = Math.abs(deltaY) || 1; // Prevent division by zero
			ballVelY = baseSpeedY * 0.5 * (deltaY / total); // Reduced slope for easier hits
		} else {
			// EASY: Random vertical direction (completely fair)
			ballVelY = Math.random() > 0.5 ? baseSpeedY : -baseSpeedY;
		}
	}
  
  

	// --- AI FSM: DECISION LOGIC ---
	/**
	 * AI Finite State Machine - determines AI behavior based on ball state
	 * Uses two main states: "Track" (ball coming toward AI) and "Recover" (ball going away)
	 * Implements trajectory prediction with wall bounces and human-like aiming errors
	 * 
	 * @param ball - Current ball state {x, y, vx, vy}
	 */
	function updateAI(ball: { x: number; y: number; vx: number; vy: number }) {
		// --- STATE DETERMINATION ---
		// Determine AI state based on ball direction
		if (ball.vx < 0) {
			aiState = "Track";    // Ball moving toward AI - time to intercept
		} else {
			aiState = "Recover";  // Ball moving away - return to center
		}

		// Set reaction delay timer (simulates human reaction time)
		aiReactionTimer = Date.now() + aiLevel.reactionDelay;

		// --- TARGET CALCULATION ---
		if (aiState === "Track") {
			// TRACK STATE: Predict where ball will be when it reaches AI paddle
			
			// Calculate time until ball reaches AI paddle (x = 0)
			const t_hit = (0 - ball.x) / ball.vx;
			
			// Predict ball's Y position at that time
			let y_est = ball.y + ball.vy * t_hit;
			
			// Handle wall bounces - ball bounces between top and bottom walls
			const H = FIELD - BALL_H; // Field height minus ball height
			const period = 2 * H; // Full bounce cycle distance
			
			// Normalize position to handle multiple bounces
			y_est = ((y_est % period) + period) % period;
			
			// Mirror position if ball would be below field (simulate bottom wall bounce)
			if (y_est > H) y_est = period - y_est;
			
			// Add human-like aiming error (random jitter)
			const jitter = (Math.random() * 2 - 1) * aiLevel.aimError;
			aiTargetY = clamp(y_est + jitter, 0, FIELD - PADDLE_H);
			
		} else if (aiState === "Recover") {
			// RECOVER STATE: Return to center position to prepare for next ball
			aiTargetY = FIELD / 2; // Go back to center
		}
	}
	// --- END AI FSM ---

	/**
	 * Utility function to clamp a value between min and max
	 * 
	 * @param val - Value to clamp
	 * @param min - Minimum allowed value
	 * @param max - Maximum allowed value
	 * @returns Clamped value
	 */
	function clamp(val: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, val));
	}

	// --- CLEANUP AND DESTRUCTION ---
	/**
	 * Destroys the game instance and cleans up all resources
	 * Implements singleton pattern - only one game instance can run at a time
	 * Stops all loops, clears timers, removes event listeners, and resets state
	 */
	function destroy() {
		console.log("=== DESTROYING GAME INSTANCE ===", myInstanceId);
		console.log("Current active instance:", currentInstanceId);
		console.log("Running before destroy:", running);
		console.log("Animation frame ID before destroy:", animationFrameId);
		console.log("AI interval ID before destroy:", aiIntervalId);
		
		// IMMEDIATELY set all stop flags to halt any running loops
		(window as any).aiGameDestroyed = true;
		running = false;
		globalGameRunning = false;
		
		// Cancel animation frames
		if (animationFrameId) {
			console.log("Cancelling animation frame:", animationFrameId);
			cancelAnimationFrame(animationFrameId);
			animationFrameId = 0;
		}
		if (globalAnimationFrameId) {
			console.log("Cancelling global animation frame:", globalAnimationFrameId);
			cancelAnimationFrame(globalAnimationFrameId);
			globalAnimationFrameId = null;
			(window as any).globalAnimationFrameId = null;
		}
		
		// Clear AI update interval
		if (aiIntervalId) {
			console.log("Clearing AI interval:", aiIntervalId);
			clearInterval(aiIntervalId);
			aiIntervalId = null;
		}
		
		// Remove event listeners
		window.removeEventListener("game:timeup", onTimeUp);
		
		// Reset all game state variables
		lastTime = 0;
		globalScoreAI = 0;
		globalScorePlayer = 0;
		lastScorer = null;
		ballScored = false;
		
		// Reset scores in DOM
		score1.textContent = "0";
		score2.textContent = "0";
		
		console.log("Running after destroy:", running);
		console.log("=== GAME INSTANCE DESTROYED ===");
	}

	return { destroy };
}


