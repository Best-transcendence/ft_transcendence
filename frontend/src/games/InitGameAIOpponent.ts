import { thisUser } from "../router";
import { MatchObject, saveMatch } from "../services/matchActions";
import { startTimer } from "../components/Timer";

// TODO more difficult algorithm 
export function initGameAIOpponent(level: "easy" | "medium" | "hard" = "medium"): void {
	// --- AI config (left paddle) ---
	// In FSM version, AI parameters are managed through difficulty settings.
	// Each difficulty defines reaction delay, aiming accuracy, movement speed,
	// and prediction aggressiveness (followStrength).

	const aiEnabled = true; // left paddle is AI

	const DIFFICULTY = {
    easy:   { reactionDelay: 400, aimError: 12, maxSpeed: 1.6, followStrength: 0.08, ballSpeed: 0.8, gameTime: 90 },
    medium: { reactionDelay: 250, aimError: 7,  maxSpeed: 2.0, followStrength: 0.12, ballSpeed: 1.0, gameTime: 60 },
    hard:   { reactionDelay: 120, aimError: 3,  maxSpeed: 2.3, followStrength: 0.18, ballSpeed: 1.3, gameTime: 45 },
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

	let s1 = 0, s2 = 0;

	let p1Y = 37.5, p2Y = 37.5; // matches initial CSS top-[37.5%]
	let ballX = 50, ballY = 50;
	let ballVelX = 0, ballVelY = 0;

	let p1Vel = 0, p2Vel = 0;
	const accel = 0.5, maxSpeed = 2.5, friction = 0.1;

	let p1Up = false, p1Down = false, p2Up = false, p2Down = false;

	// --- AI FSM: periodic view (1Hz) ---
	setInterval(() => {
		if (!aiEnabled || !running) return;
		const snapshot = { x: ballX, y: ballY, vx: ballVelX, vy: ballVelY };
		updateAI(snapshot);
	}, 1000);
	// --- END AI FSM ---

	window.addEventListener("game:timeup", () => {
		stopGame();
		const overlay = document.getElementById("timeUpOverlay");
		const winnerText = document.getElementById("winnerText");
		if (overlay) {
			// Determine winner based on final scores
			if (s1 > s2) {
				winnerText!.textContent = "AI won 🤖";
			} else if (s2 > s1) {
				winnerText!.textContent = "You won 🥇";
			} else {
				winnerText!.textContent = "It's a tie! 🤝";
			}
			overlay.classList.remove("hidden");
		}
	});

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
		startPress.classList.add("hidden");
		resetBall();
		loop();
	}

  function stopGame(fullReset = false) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    running = false;
  
    if (fullReset) {
      s1 = 0;
      s2 = 0;
      score1.textContent = "0";
      score2.textContent = "0";
  
      p1Y = 37.5;
      p2Y = 37.5;
      p1Vel = 0;
      p2Vel = 0;
      ballX = 50;
      ballY = 50;
      ballVelX = 0;
      ballVelY = 0;
  
      paddle1.style.top = `${p1Y}%`;
      paddle2.style.top = `${p2Y}%`;
      ball.style.left = `${ballX}%`;
      ball.style.top = `${ballY}%`;
  
      startPress.classList.remove("hidden");
    }
  }
  

	function resetGame() {
		stopGame();
		s1 = 0;
		s2 = 0;
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
	}

	function loop() {
		if (!running) return;
		updatePaddles();
		updateBall();
		animationFrameId = requestAnimationFrame(loop); //storeid
	}

	function updatePaddles() {
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

		// FIX: symmetric scoring using the ball center
		const ballCenterX = ballX + BALL_W / 2;
		if (ballCenterX < 0) {
			s2++;
			score2.textContent = s2.toString();
			//playSound(lossSfx);
			resetBall();
		} else if (ballCenterX > FIELD) {
			s1++;
			score1.textContent = s1.toString();
			//playSound(lossSfx);
			resetBall();
		}

		ball.style.left = ballX + "%";
		ball.style.top = ballY + "%";
	}

  function resetBall() {
    ballX = 50 - BALL_W / 2;
    ballY = 50 - BALL_H / 2;
  
    const baseSpeedX = aiLevel.ballSpeed;       // speed depends on difficulty
    const baseSpeedY = aiLevel.ballSpeed * 0.7; // slightly lower vertical speed
  
    ballVelX = Math.random() > 0.5 ? baseSpeedX : -baseSpeedX;
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

	// Expose reset function globally for restart button
	(window as any).resetAIGame = resetGame;
  
}


