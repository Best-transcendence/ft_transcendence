import { getSocket } from "../services/ws";
import { startTimer } from "../components/Timer";
import { sidebarDisplay } from "../components/SideBar";
import { profileDivDisplay } from "../components/ProfileDiv";
import { LogOutBtnDisplay } from "../components/LogOutBtn";
import { addTheme } from "../components/Theme";

export function GamePongRemote(): string {
  const socket = getSocket();

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
      case "room:start":
        initRemoteGame(msg.roomId);
        break;

      case "game:start":
        startTimer(5);
        document.getElementById("startPress")?.remove();
        break;

      case "game:update":
        updateGameState(msg.state);
        break;

      case "game:end":
        showGameOver(msg.winner);
        break;
    }
  };

  return `
    ${addTheme()}

    <div class="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_50%,rgba(0,0,0,1)_100%)] z-0"></div>

    <!-- Header with user info -->
    <div class="w-full flex justify-between items-center mb-10 relative z-3">
      ${profileDivDisplay()}
      ${sidebarDisplay()}
      ${LogOutBtnDisplay()}
    </div>

    <!-- Game section -->
    <div class="flex justify-center w-screen overflow-hidden">
      <div class="relative"
        style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 90vw; max-width: 1450px; aspect-ratio: 16/9;">

        <!-- Arcade image anchor -->
        <img src="/assets/game_background.png"
          class="absolute inset-0 w-full h-full object-contain"
          alt="Arcade machine" />

        <!-- Game window (make positioning context explicit + ensure z-index above bg) -->
        <div class="absolute z-10 backdrop-blur-sm relative"
          style="top: 6.1%; left: 24.1%; width: 51%; height: 59.2%;
          background: var(--game-area-background);
          border: 9px solid var(--color-frame);
          border-radius: 1rem;">

          <!-- Time Up Overlay -->
          <div id="timeUpOverlay"
            class="absolute inset-0 z-20 hidden"
            style="border-radius: inherit; background: inherit;">
            <div class="relative h-full w-full flex flex-col items-center justify-start pt-6 px-4 animate-zoomIn">
              <h2 class="text-2xl font-bold text-white">Time’s up!</h2>
              <p class="text-lg text-gray-200 mt-2 mb-6">You won 🥇</p>
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
            class="absolute z-20 top-[5%] left-[25%] text-[1.5vw] leading-none select-none">0</span>
          <span id="score2"
            class="absolute z-20 top-[5%] right-[25%] text-[1.5vw] leading-none select-none">0</span>

          <!-- Paddles (explicit z-index + anchors) -->
          <div id="paddle1"
            class="absolute z-20 h-[25%] w-[3.3%] bg-[rgba(255,255,255,0.9)] top-[37.5%] left-0"></div>
          <div id="paddle2"
            class="absolute z-20 h-[25%] w-[3.3%] bg-[rgba(255,255,255,0.9)] top-[37.5%] right-0"></div>

          <!-- Ball (explicit z-index) -->
          <div id="ball"
            class="absolute z-20 h-[5%] w-[3.3%] bg-[rgba(255,255,255,0.9)] rounded-[30%] left-[48.3%] top-[47.5%]"></div>

          <!-- Start text -->
          <p id="startPress"
            class="absolute z-20 bottom-[5%] left-1/2 -translate-x-1/2 text-center
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

export function initRemoteGame(roomId: string) {
  const socket = getSocket();

  socket?.send(
    JSON.stringify({
      type: "game:join",
      roomId,
    })
  );

  document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) {
      socket?.send(
        JSON.stringify({
          type: "game:move",
          direction: e.key,
          action: "down",
          roomId,
        })
      );
    }
  });

  document.addEventListener("keyup", (e) => {
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) {
      socket?.send(
        JSON.stringify({
          type: "game:move",
          direction: e.key,
          action: "up",
          roomId,
        })
      );
    }
  });

  const overlayExit = document.getElementById("overlayExit");
  overlayExit?.addEventListener("click", () => {
    window.location.hash = "intro";
  });
}

function updateGameState(state: any) {
  const paddle1 = document.getElementById("paddle1")!;
  const paddle2 = document.getElementById("paddle2")!;
  const ball = document.getElementById("ball")!;
  const score1 = document.getElementById("score1")!;
  const score2 = document.getElementById("score2")!;

  paddle1.style.top = state.p1Y + "%";
  paddle2.style.top = state.p2Y + "%";
  ball.style.left = state.ballX + "%";
  ball.style.top = state.ballY + "%";
  score1.textContent = state.s1.toString();
  score2.textContent = state.s2.toString();
}

function showGameOver(winner: string) {
  alert(` Game Over! Winner: ${winner}`);
  window.location.hash = "intro";
}
