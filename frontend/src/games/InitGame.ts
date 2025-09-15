export function initGame(): void {
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

  let s1 = 0, s2 = 0;
  let running = false;

  let p1Y = 40, p2Y = 40;
  let ballX = 50, ballY = 50;
  let ballVelX = 0, ballVelY = 0;

  let p1Vel = 0, p2Vel = 0;
  const accel = 0.5, maxSpeed = 2.5, friction = 0.1;

  let p1Up = false, p1Down = false, p2Up = false, p2Down = false;

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !running) startGame();
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

  function loop() {
    if (!running) return;
    updatePaddles();
    updateBall();
    requestAnimationFrame(loop);
  }

  function updatePaddles() {
    p1Vel = applyInput(p1Up, p1Down, p1Vel);
    p2Vel = applyInput(p2Up, p2Down, p2Vel);

    p1Y = clamp(p1Y + p1Vel, 0, 80);
    p2Y = clamp(p2Y + p2Vel, 0, 80);

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

    if (ballY <= 0 || ballY >= 95) {
      ballVelY *= -1;
      playSound(wallSfx);
    }

    if (ballX <= 4 && ballY >= p1Y && ballY <= p1Y + 20) {
      ballVelX *= -1;
      playSound(paddleSfx);
    }

    if (ballX >= 94 && ballY >= p2Y && ballY <= p2Y + 20) {
      ballVelX *= -1;
      playSound(paddleSfx);
    }

    if (ballX < 0) {
      s2++;
      score2.textContent = s2.toString();
      playSound(lossSfx);
      resetBall();
    }

    if (ballX > 100) {
      s1++;
      score1.textContent = s1.toString();
      playSound(lossSfx);
      resetBall();
    }

    ball.style.left = ballX + "%";
    ball.style.top = ballY + "%";
  }

  function resetBall() {
    ballX = 50;
    ballY = 50;
    ballVelX = Math.random() > 0.5 ? 0.6 : -0.6;
    ballVelY = Math.random() > 0.5 ? 0.4 : -0.4;
  }

  function playSound(audio: HTMLAudioElement) {
    audio.currentTime = 0;
    audio.play();
  }

  function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  }
}
