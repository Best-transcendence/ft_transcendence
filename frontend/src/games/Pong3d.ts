// src/pages/GamePage.ts
import arcadeBg from "../assets/machine1.png";

export function GamePong3D(): string {
  return `
    <div class="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-b from-theme-bg1 to-theme-bg2 text-theme-text font-body overflow-hidden">

      <!-- Title -->
      <h1 class="text-4xl font-heading font-bold mb-2 z-10">Pong</h1>

      <!-- Scoreboard -->
      <span id="score1" class="absolute top-8 left-1/4 text-3xl font-bold z-10">0</span>
      <span id="score2" class="absolute top-8 right-1/4 text-3xl font-bold z-10">0</span>

      <!-- Start message -->
      <h3 id="startPress" class="absolute top-1/2 text-2xl font-bold text-white bg-black bg-opacity-60 px-4 py-2 rounded z-10">
        Press SPACE To Start The Game
      </h3>

      <!-- Game area -->
      <div id="game-container" class="relative w-full max-w-3xl aspect-[16/10] bg-transparent overflow-hidden border-4 border-theme-accent1 z-10">
        <div id="paddle1" class="absolute left-[2%] top-[40%] w-[2%] h-[20%] bg-theme-button"></div>
        <div id="paddle2" class="absolute right-[2%] top-[40%] w-[2%] h-[20%] bg-theme-accent1"></div>
        <div id="ball" class="absolute left-[50%] top-[50%] w-[3%] h-[5%] rounded-full bg-white"></div>
        <div id="net" class="absolute left-1/2 w-[2px] h-full bg-white opacity-50"></div>
      </div>

      <!-- Canvas Background -->
      <canvas id="gameCanvas" width="800" height="600" class="absolute inset-0 w-full h-full -z-10"></canvas>

      <!-- Vignette -->
      <div class="absolute inset-0 bg-black opacity-40 pointer-events-none"></div>

      <!-- Sounds -->
      <audio id="paddleSound" src="/assets/paddle.wav" preload="auto"></audio>
      <audio id="wallSound" src="/assets/wall.wav" preload="auto"></audio>
      <audio id="lossSound" src="/assets/loss.wav" preload="auto"></audio>
    </div>
  `;
}

export function drawCanvasBackground(): void {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

  const bgImage = new Image();
  bgImage.src = arcadeBg;
  bgImage.onload = () => {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  };
}
