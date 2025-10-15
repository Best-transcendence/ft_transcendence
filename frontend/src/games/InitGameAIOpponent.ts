import { thisUser } from "../router";
import { MatchObject, saveMatch } from "../services/matchActions";
import { startTimer } from "../components/Timer";

// Global variables for scores and game state
let globalScoreAI = 0;
let globalScorePlayer = 0;
let globalAnimationFrameId: number | null = null;
let globalGameRunning = false;
let currentInstanceId = 0; // Track which instance is active

// TODO more difficult algorithm 
export function initGameAIOpponent(level: "easy" | "medium" | "hard" = "medium"): { destroy: () => void } {
	// Create unique instance ID - this instance is now the active one
	const myInstanceId = ++currentInstanceId;
	console.log("=== NEW GAME INSTANCE CREATED ===", myInstanceId);
	
	// Reset global state at the start of a new game instance
	globalScoreAI = 0;
	globalScorePlayer = 0;
	globalGameRunning = false;
	globalAnimationFrameId = null;
	
	// --- AI config (left paddle) ---
	// In FSM version, AI parameters are managed through difficulty settings.
	// Each difficulty defines reaction delay, aiming accuracy, movement speed,
	// and prediction aggressiveness (followStrength).

	const aiEnabled = true; // left paddle is AI

	const DIFFICULTY = {
    easy:   { reactionDelay: 400, aimError: 12, maxSpeed: 1.6, followStrength: 0.08, ballSpeed: 1.0, gameTime: 40 },
    medium: { reactionDelay: 250, aimError: 7,  maxSpeed: 2.0, followStrength: 0.12, ballSpeed: 1.5, gameTime: 30 },
    hard:   { reactionDelay: 120, aimError: 3,  maxSpeed: 2.3, followStrength: 0.18, ballSpeed: 2.5, gameTime: 20 },
  };
  

	const aiLevel = DIFFICULTY[level]; // current difficulty
	let aiState: "Idle" | "Track" | "Recover" = "Idle";
	let aiTargetY = 50;
	let aiReactionTimer = 0;

	const $ = (id: string) => document.getElementById(id)!;

	const paddle1 = $("paddle1");
	const paddle2 = $("paddle2");
	const ball = $("ball");
	const score1 = $("score1");
	const score2 = $("score2");
	const startPress = $("startPress");

	const paddleSfx = $("paddleSound") as HTMLAudioElement;
	const wallSfx = $("wallSound") as HTMLAudioElement;
	const lossSfx = $("lossSound") as HTMLAudioElement;

	// NEW: size matches GamePong2D CSS
	const FIELD = 100;
	const BALL_W = 3.3, BALL_H = 5;      // #ball: w-[3.3%], h-[5%]
	const PADDLE_W = 3.3, PADDLE_H = 25; // #paddle: w-[3.3%], h-[25%]

	let running = false;
	let animationFrameId = 0;
	let aiIntervalId: NodeJS.Timeout | null = null;
	let lastTime = 0;
	const targetFPS = 120;
	const frameTime = 1000 / targetFPS;

	let lastScorer: "ai" | "player" | null = null;
	let ballScored = false; // Flag to prevent multiple scoring events

	let p1Y = 37.5, p2Y = 37.5; // matches initial CSS top-[37.5%]
	let ballX = 50, ballY = 50;
	let ballVelX = 0, ballVelY = 0;

	let p1Vel = 0, p2Vel = 0;
	const accel = 0.5, maxSpeed = 2.5, friction = 0.1;

	let p1Up = false, p1Down = false, p2Up = false, p2Down = false;

	// --- AI FSM: periodic view (1Hz) ---
	aiIntervalId = setInterval(() => {
		// Only run if this is still the active instance
		if (myInstanceId !== currentInstanceId) return;
		if (!aiEnabled || !running) return;
		const snapshot = { x: ballX, y: ballY, vx: ballVelX, vy: ballVelY };
		updateAI(snapshot);
	}, 1000);
	// --- END AI FSM ---

	function onTimeUp() {
		stopGame();
		const overlay = document.getElementById("timeUpOverlay");
		const winnerText = document.getElementById("winnerText");
		if (overlay) {
			// Determine winner based on final scores
			if (globalScoreAI > globalScorePlayer) {
				winnerText!.textContent = "AI won 🤖";
			} else if (globalScorePlayer > globalScoreAI) {
				winnerText!.textContent = "You won 🥇";
			} else {
				winnerText!.textContent = "It's a tie! 🤝";
			}
			overlay.classList.remove("hidden");
		}
	}

	window.addEventListener("game:timeup", onTimeUp);

	const overlayExit = document.getElementById("overlayExit");
	overlayExit?.addEventListener("click", () => {
		window.location.hash = "intro";
	});

	document.addEventListener("keydown", (e) => {
		if (e.code === "Space" && !running) {
			// TODO setup to 90
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
	}

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
		}
		
		console.log("Running after stop:", running);
		console.log("=== GAME STOPPED ===");
	}

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
	}

	function updatePaddles() {
		// Check if this is still the active instance
		if (myInstanceId !== currentInstanceId) return;
		
		// Check if game is running
		if (!globalGameRunning) return;
		
		p2Vel = applyInput(p2Up, p2Down, p2Vel);

		// TODO more difficult AI movements
		// target is to center the paddle on the ball
		const paddleCenterY = p1Y + PADDLE_H / 2;

		// --- AI FSM CONTROL ---
		if (aiEnabled) {
			const now = Date.now();

			// simulate human reaction delay
			if (now > aiReactionTimer) {
				p1Up = paddleCenterY > aiTargetY + 3;
				p1Down = paddleCenterY < aiTargetY - 3;
			}

			p1Vel = applyInput(p1Up, p1Down, p1Vel);
		}
		// --- END AI FSM CONTROL ---

		// FIX: clamp to 100 - PADDLE_H (25%)
		const maxY = FIELD - PADDLE_H;
		p1Y = clamp(p1Y + p1Vel, 0, maxY);
		p2Y = clamp(p2Y + p2Vel, 0, maxY);

		paddle1.style.top = p1Y + "%";
		paddle2.style.top = p2Y + "%";
	}

	function applyInput(up: boolean, down: boolean, vel: number): number {
		if (up) vel -= accel;
		if (down) vel += accel;
		if (!up && !down) vel *= (1 - friction);
		return clamp(vel, -maxSpeed, maxSpeed);
	}

	function updateBall() {
		// Check if this is still the active instance
		if (myInstanceId !== currentInstanceId) return;
		
		// Check if game is running
		if (!globalGameRunning) return;
		
		ballX += ballVelX;
		ballY += ballVelY;

		// FIX: walls consider BALL_H
		if (ballY <= 0) {
			ballY = 0;
			ballVelY *= -1;
			//playSound(wallSfx);
		} else if (ballY >= FIELD - BALL_H) {
			ballY = FIELD - BALL_H;
			ballVelY *= -1;
			//playSound(wallSfx);
		}

		// Paddle hitboxes with sizes
		// Left paddle: its right edge is at PADDLE_W, ball's left is ballX, right is ballX + BALL_W
		if (
			ballX <= PADDLE_W && // left side contact
			ballX + BALL_W >= 0 && // still within field
			ballY + BALL_H >= p1Y && ballY <= p1Y + PADDLE_H // vertical overlap
		) {
			ballX = PADDLE_W; // resolve penetration
			ballVelX *= -1;
			//playSound(paddleSfx);
		}

		// Right paddle: its left edge is at FIELD - PADDLE_W
		if (
			ballX + BALL_W >= FIELD - PADDLE_W && // right side contact
			ballX <= FIELD && // still within field
			ballY + BALL_H >= p2Y && ballY <= p2Y + PADDLE_H // vertical overlap
		) {
			ballX = FIELD - PADDLE_W - BALL_W; // resolve penetration
			ballVelX *= -1;
			//playSound(paddleSfx);
		}

	}

	function updateBallPosition() {
		// Update ball visual position every frame for smooth movement
		ball.style.left = ballX + "%";
		ball.style.top = ballY + "%";
	}

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
			console.log("Ball already scored, skipping check");
			return;
		}

	// Scoring: ball goes out of bounds
	// Left side - ball exits left, AI (left paddle) missed, so PLAYER scores
	if (ballX + BALL_W < 0) {
		console.log("=== PLAYER SCORES (AI missed) === Instance:", myInstanceId);
		console.log("ballX:", ballX, "ballX + BALL_W:", ballX + BALL_W);
		console.log("Current scores: AI=", globalScoreAI, "Player=", globalScorePlayer);
		console.log("Game running:", running);
		
		ballScored = true; // Prevent multiple scoring
		globalScorePlayer++; // Player scores because AI missed
		score2.textContent = globalScorePlayer.toString();
		lastScorer = "player";
		console.log("New scores: AI=", globalScoreAI, "Player=", globalScorePlayer);
		console.log("=== END PLAYER SCORES ===");
		//playSound(lossSfx);
		resetBall();
	} 
	// Right side - ball exits right, Player (right paddle) missed, so AI scores
	else if (ballX > FIELD) {
		console.log("=== AI SCORES (Player missed) === Instance:", myInstanceId);
		console.log("ballX:", ballX, "FIELD:", FIELD);
		console.log("Current scores: AI=", globalScoreAI, "Player=", globalScorePlayer);
		console.log("Game running:", running);
		
		ballScored = true; // Prevent multiple scoring
		globalScoreAI++; // AI scores because Player missed
		score1.textContent = globalScoreAI.toString();
		lastScorer = "ai";
		console.log("New scores: AI=", globalScoreAI, "Player=", globalScorePlayer);
		console.log("=== END AI SCORES ===");
		//playSound(lossSfx);
		resetBall();
	}
	}

  function resetBall() {
    ballX = 50 - BALL_W / 2;
    ballY = 50 - BALL_H / 2;
    ballScored = false; // Reset scoring flag for new ball
  
    const baseSpeedX = aiLevel.ballSpeed;       // speed depends on difficulty
    const baseSpeedY = aiLevel.ballSpeed * 0.7; // slightly lower vertical speed
  
    // Fair ball direction: alternate based on who scored last
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
    
    // Random vertical direction
    ballVelY = Math.random() > 0.5 ? baseSpeedY : -baseSpeedY;
  }
  
  

	// --- AI FSM: decision logic ---
	function updateAI(ball: { x: number; y: number; vx: number; vy: number }) {
		// determine AI state
		if (ball.vx < 0) {
			aiState = "Track";    // ball moving toward AI
		} else {
			aiState = "Recover";  // ball moving away
		}

		// reaction delay
		aiReactionTimer = Date.now() + aiLevel.reactionDelay;

		// compute target based on state
		if (aiState === "Track") {
			const t_hit = (0 - ball.x) / ball.vx;
			let y_est = ball.y + ball.vy * t_hit;
			const H = FIELD - BALL_H;
			const period = 2 * H;
			y_est = ((y_est % period) + period) % period;
			if (y_est > H) y_est = period - y_est;
			const jitter = (Math.random() * 2 - 1) * aiLevel.aimError;
			aiTargetY = clamp(y_est + jitter, 0, FIELD - PADDLE_H);
		} else if (aiState === "Recover") {
			aiTargetY = FIELD / 2; // go back to center
		}
	}
	// --- END AI FSM ---

// TODO fix playsound function or delete from everywhere
//   function playSound(audio: HTMLAudioElement) {
//     audio.currentTime = 0;
//     audio.play();
//   }

	function clamp(val: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, val));
	}

	// Return destroy function for singleton pattern
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
		if (animationFrameId) {
			console.log("Cancelling animation frame:", animationFrameId);
			cancelAnimationFrame(animationFrameId);
			animationFrameId = 0;
		}
		if (globalAnimationFrameId) {
			console.log("Cancelling global animation frame:", globalAnimationFrameId);
			cancelAnimationFrame(globalAnimationFrameId);
			globalAnimationFrameId = null;
		}
		
		// Clear AI interval
		if (aiIntervalId) {
			console.log("Clearing AI interval:", aiIntervalId);
			clearInterval(aiIntervalId);
			aiIntervalId = null;
		}
		
		// Clear all event listeners
		window.removeEventListener("game:timeup", onTimeUp);
		
		// Reset all variables
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


