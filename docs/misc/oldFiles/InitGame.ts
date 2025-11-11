import { thisUser } from "../router";
import { MatchObject, saveMatch } from "../services/matchActions";
import { startTimer } from "../components/Timer";

export function initGame(): void {
  const $ = (id: string) => document.getElementById(id)!;

  const paddle1 = $("paddle1");
  const paddle2 = $("paddle2");
  const ball = $("ball");
  const score1 = $("score1");
  const score2 = $("score2");
  const startPress = $("startPress");

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
  const accemal = 0.5, maxSpeed = 2.5, friction = 0.1;

  let p1Up = false, p1Down = false, p2Up = false, p2Down = false;

  window.addEventListener("game:timeup", () => {
    stopGame();
	  const overlay = document.getElementById("timeUpOverlay");
  	if (overlay) {
    	overlay.classList.remove("hidden");
  	}
  });

	const overlayExit = document.getElementById("overlayExit");
	overlayExit?.addEventListener("click", () => {
		window.location.hash = "intro";
	});

  document.addEventListener("keydown", (e) => {
	if (e.code === "Space" && !running) {
		startTimer(5);
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

    function stopGame() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  }

  function loop() {
    if (!running) return;
    updatePaddles();
    updateBall();
    animationFrameId = requestAnimationFrame(loop); //storeid
  }

  function updatePaddles() {
    p1Vel = applyInput(p1Up, p1Down, p1Vel);
    p2Vel = applyInput(p2Up, p2Down, p2Vel);

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
    // keep your faster settings or tweak here
    const baseSpeedX = 1.2;
    const baseSpeedY = 0.8;
    ballVelX = Math.random() > 0.5 ? baseSpeedX : -baseSpeedX;
    ballVelY = Math.random() > 0.5 ? baseSpeedY : -baseSpeedY;
  }

  function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  }
}
