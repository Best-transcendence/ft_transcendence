import { getSocket } from "../services/ws";
import { sidebarDisplay } from "../components/SideBar";
import { profileDivDisplay } from "../components/ProfileDiv";
import { LogOutBtnDisplay } from "../components/LogOutBtn";
import { addTheme } from "../components/Theme";
import { TimerDisplay, resetTimer } from "../components/Timer";
import { renderPlayerCard } from "../components/cards/RemotePlayerCard";

import { onSocketMessage } from "../services/ws";

let unsubscribeGame: (() => void) | null = null;
let currentPlayers: { id: string; name: string }[] = [];

export function GamePongRemote(): string {
  if (unsubscribeGame) unsubscribeGame(); // clean old listener
  unsubscribeGame = onSocketMessage((msg) => {
    switch (msg.type) {
      case "game:ready":
        document.getElementById("startPress")?.classList.remove("hidden");
        break;
      case "session:kickIntro":
        window.location.hash = "intro";
        break;

      case "session:state":
        if (
          !msg.inRoom &&
          (window.location.hash === "#game" ||
            window.location.hash === "#remote")
        ) {
          window.location.hash = "intro";
        }
        break;
      case "room:start":
        currentPlayers = msg.players;
        window.location.hash = "game";
        initRemoteGame(msg.roomId);
        break;

       case "game:start": {
         resetTimer(msg.duration || 90);
         document.getElementById("startPress")?.remove();

         const { players, playerIndex } = msg;
         currentPlayers = players;
         console.log("game:start payload", msg);

        setTimeout(() => {
          const playerCardsContainer = document.getElementById("player-cards");
          if (playerCardsContainer && players[0] && players[1]) {
            playerCardsContainer.innerHTML = `
  ${renderPlayerCard(players[0].id, players[0].name, "p1", playerIndex === 0)}
  ${renderPlayerCard(players[1].id, players[1].name, "p2", playerIndex === 1)}
`;
          }
        }, 0);
        break;
      }

      case "game:timer":
        // authoritative countdown from server
        const timerEl = document.getElementById("timer");
        if (timerEl) {
          const minutes = Math.floor(msg.remaining / 60);
          const seconds = msg.remaining % 60;
          timerEl.textContent = `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`;
        }
        break;

      case "game:timeup":
        const overlay = document.getElementById("timeUpOverlay");
        if (overlay) {
          overlay.classList.remove("hidden");
          const textEl = overlay.querySelector("p");
          if (textEl) {
             textEl.textContent =
               msg.winner === "draw"
                 ? "It's a draw 🤝"
                 : msg.winner === "p1"
                 ? `${currentPlayers[0]?.name ?? "Player 1"} wins 🥇`
                 : `${currentPlayers[1]?.name ?? "Player 2"} wins 🥇`;
           }
         }
         // Hide game elements to prevent overlap with overlay
         const paddle1 = document.getElementById("paddle1");
         if (paddle1) (paddle1 as HTMLElement).style.display = "none";
         const paddle2 = document.getElementById("paddle2");
         if (paddle2) (paddle2 as HTMLElement).style.display = "none";
         const ball = document.getElementById("ball");
         if (ball) (ball as HTMLElement).style.display = "none";
         const score1 = document.getElementById("score1");
         if (score1) (score1 as HTMLElement).style.display = "none";
         const score2 = document.getElementById("score2");
         if (score2) (score2 as HTMLElement).style.display = "none";
         break;
         const net = document.getElementById("net");
         if (net) (net as HTMLElement).style.display = "none";
         break;

      case "game:update":
        updateGameState(msg.state);
        break;

      case "game:end": {
        console.log("game:end", msg);
        const overlay = document.getElementById("timeUpOverlay");
        if (overlay) {
          overlay.classList.remove("hidden");
          const titleEl = overlay.querySelector("h2");
          if (titleEl) {
            titleEl.textContent =
              msg.type === "game:timeup" ? "Time’s up!" : "Game Over!";
          }
          const textEl = overlay.querySelector("p");
          if (textEl) {
             textEl.textContent =
               msg.winner === "you"
                 ? "Opponent disconnected. You win 🥇"
                 : "Game ended";
           }
         }
         // Hide game elements to prevent overlap with overlay
         const paddle1 = document.getElementById("paddle1");
         if (paddle1) (paddle1 as HTMLElement).style.display = "none";
         const paddle2 = document.getElementById("paddle2");
         if (paddle2) (paddle2 as HTMLElement).style.display = "none";
         const ball = document.getElementById("ball");
         if (ball) (ball as HTMLElement).style.display = "none";
         const score1 = document.getElementById("score1");
         if (score1) (score1 as HTMLElement).style.display = "none";
         const score2 = document.getElementById("score2");
         if (score2) (score2 as HTMLElement).style.display = "none";
         const net = document.getElementById("net");
         if (net) (net as HTMLElement).style.display = "none";
         setTimeout(() => {
           window.location.hash = "intro";
         }, 3000);
        currentRoomId = null;
        break;
      }
    }
  });

  return `
    ${addTheme()}

    <div class="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_50%,rgba(0,0,0,1)_100%)] z-0"></div>

    <!-- Header with user info -->
    <div class="w-full flex justify-between items-center mb-10 relative z-3">
      ${profileDivDisplay()}
      ${sidebarDisplay()}
      ${LogOutBtnDisplay()}
    </div>

          <!-- Timer -->
          ${TimerDisplay()}

    <!-- Player Cards -->
    <div id="player-cards" class="flex justify-center gap-4 mb-4"></div>

    <!-- Game section -->
    <div class="flex justify-center w-screen overflow-hidden">
      <div class="relative"
        style="position: absolute; top: vh; left: 50%; transform: translateX(-50%); width: 90vw; max-width: 1450px; aspect-ratio: 16/9;">

        <!-- Arcade image anchor -->
        <img src="/assets/game_background.png"
          class="absolute inset-0 w-full h-full object-contain"
          alt="Arcade machine" />

         <!-- Game window -->
         <div class="absolute z-10 backdrop-blur-sm relative"
           style="top: 6.1%; left: 24.1%; width: 51%; height: 59.2%;
           background: var(--game-area-background);
           border: 9px solid var(--color-frame);
           border-radius: 1rem;">
<!-- Player Cards Overlay -->
     <div id="playerCardsOverlay"
     class="absolute inset-0 bg-black/80 flex items-center justify-center z-30 hidden">
       <div class="bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-400/30 rounded-2xl p-8 max-w-md text-center">
         <h2 id="round-label" class="text-2xl font-bold text-white mb-4"></h2>
         <div class="relative mt-6 w-full h-full flex items-center justify-between px-6">
           <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/20"></div>
           <div class="w-1/2 pr-8 flex flex-col items-start">
             <div class="text-xl font-bold text-violet-400 break-words" id="name-left"></div>
             <div class="mt-2 text-xs text-gray-300">Controls: W • S</div>
           </div>
           <div class="w-1/2 pl-8 flex flex-col items-end">
             <div class="text-xl font-bold text-violet-400 text-right break-words" id="name-right"></div>
             <div class="mt-2 text-xs text-gray-300 text-right">Controls: ↑ • ↓</div>
           </div>
         </div>
         <div class="mt-4 flex justify-center">
           <div class="text-gray-300 text-lg text-center">Press <kbd class="px-2 py-1 bg-slate-700 rounded text-sm">SPACE</kbd> to Start the Game</div>
         </div>
       </div>
     </div>
          <!-- Time Up Overlay -->
     <div id="timeUpOverlay" class="hidden absolute inset-0 bg-black/80 flex items-center justify-center z-50">
       <div class="bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-400/30 rounded-2xl p-8 max-w-md text-center">
         <h2 class="text-2xl font-bold text-white mb-4">Time’s up!</h2>
         <p class="text-lg text-gray-200 mt-2 mb-6">Result</p>
         <button id="overlayExit"
           class="px-6 py-3 rounded-xl font-semibold text-white transition hover:shadow cursor-pointer bg-[var(--color-button)] hover:bg-[var(--color-button-hover)]">
           Back to Arcade Clash
         </button>
       </div>
     </div>
          <!-- Net -->
          <div id="net" class="absolute z-19 border-r-[0.8vw] border-dotted border-[rgba(255,255,255,0.3)]
            h-[96%] top-[2%] left-[calc(50%-0.4vw)]"></div>

          <!-- Scores -->
          <span id="score1"
            class="absolute z-20 top-[5%] left-[25%] text-[1.5vw] leading-none select-none">0</span>
          <span id="score2"
            class="absolute z-20 top-[5%] right-[25%] text-[1.5vw] leading-none select-none">0</span>

          <!-- Paddles -->
          <div id="paddle1"
            class="absolute z-20 h-[25%] w-[3.3%] bg-[rgba(255,255,255,0.9)] top-[37.5%] left-0"></div>
          <div id="paddle2"
            class="absolute z-20 h-[25%] w-[3.3%] bg-[rgba(255,255,255,0.9)] top-[37.5%] right-0"></div>

          <!-- Ball -->
          <div id="ball"
            class="absolute z-20 h-[5%] w-[3.3%] bg-[rgba(255,255,255,0.9)] rounded-[30%] left-[48.3%] top-[47.5%]"></div>

           <!-- Start text -->
           <p id="startPress"
             class="absolute z-20 bottom-[5%] left-1/2 -translate-x-1/2 text-center
             bg-[#222222]/80 rounded px-4 py-2 text-[clamp(14px,1vw,20px)] select-none">
             Press Space When You Are Ready
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
let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
let keyupHandler: ((e: KeyboardEvent) => void) | null = null;
let currentRoomId: string | null = null;

export function initRemoteGame(roomId: string) {
  const socket = getSocket();
  currentRoomId = roomId;

  socket?.send(JSON.stringify({ type: "game:join", roomId }));

  if (keydownHandler) document.removeEventListener("keydown", keydownHandler);
  if (keyupHandler) document.removeEventListener("keyup", keyupHandler);

  // handle keys
  keydownHandler = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      const startPress = document.getElementById("startPress");
      if (startPress && !startPress.classList.contains("hidden")) {
        socket?.send(JSON.stringify({ type: "game:begin", roomId }));
        startPress.remove();

        // 🎉 Mostrar overlay de nombres de jugadores
        const overlay = document.getElementById("playerCardsOverlay");
        if (overlay && currentPlayers[0] && currentPlayers[1]) {
          const nameLeftEl = overlay.querySelector("#name-left");
          const nameRightEl = overlay.querySelector("#name-right");
          const roundLabelEl = overlay.querySelector("#round-label");

          if (nameLeftEl && nameRightEl && roundLabelEl) {
            nameLeftEl.textContent = currentPlayers[0].name;
            nameRightEl.textContent = currentPlayers[1].name;
            roundLabelEl.textContent = "Players Ready";
          }

          overlay.classList.remove("hidden");

          // hide after 3 sec
          setTimeout(() => {
            overlay.classList.add("hidden");
          }, 3000);
        }
      }
    }

    // movement of the player
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "game:move",
            direction: e.key,
            action: "down",
            roomId,
          })
        );
      }
    }
  };

  // 🕹️ Handler de teclas soltadas
  keyupHandler = (e: KeyboardEvent) => {
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
  };

  document.addEventListener("keydown", keydownHandler);
  document.addEventListener("keyup", keyupHandler);

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
  if ("ballX" in state && "ballY" in state) {
    ball.style.left = state.ballX + "%";
    ball.style.top = state.ballY + "%";
    ball.style.opacity = "1";
  } else {
    ball.style.opacity = "0";
  }

  score1.textContent = state.s1.toString();
  score2.textContent = state.s2.toString();
}

// function showGameOver(winner: string) {
//   alert(`Game Over! Winner: ${winner}`);
//   window.location.hash = "intro";
// }

export function leaveRemoteGame() {
  const socket = getSocket();
  if (currentRoomId) {
    socket?.send(JSON.stringify({ type: "game:leave", roomId: currentRoomId }));
    currentRoomId = null;
  }
  if (keydownHandler) document.removeEventListener("keydown", keydownHandler);
  if (keyupHandler) document.removeEventListener("keyup", keyupHandler);
  keydownHandler = null;
  keyupHandler = null;
}
