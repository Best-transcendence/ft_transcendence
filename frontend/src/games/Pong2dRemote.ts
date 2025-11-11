import { getSocket } from "../services/ws";
import { sidebarDisplay } from "../components/SideBar";
import { profileDivDisplay } from "../components/ProfileDiv";
import { LogOutBtnDisplay } from "../components/LogOutBtn";
import { addTheme } from "../components/Theme";
import { TimerDisplay, resetTimer } from "../components/Timer";
import { renderPlayerCard } from "../components/cards/NameCard";
import DOMPurify from "dompurify";
import { onSocketMessage } from "../services/ws";
import { t } from "../services/lang/LangEngine";

let unsubscribeGame: (() => void) | null = null;
let currentPlayers: { id: string; name: string }[] = [];

let modalActive = false; // true while the timeUp overlay is visible

function isVisible(el: HTMLElement | null): boolean {
  return !!el && !el.classList.contains("hidden");
}

export function GamePongRemote(): string {
  if (unsubscribeGame) unsubscribeGame(); // clean old listener
  unsubscribeGame = onSocketMessage((msg) => {
    switch (msg.type) {

	// render real player cards as soon as the server tells us who joined
      case "room:players": {
        const { players, youIndex } = msg; // server will send {id, name}[]
        currentPlayers = players;
        const wrap = document.getElementById("player-cards");
        if (wrap && players[0] && players[1]) {
          wrap.innerHTML = DOMPurify.sanitize(`
            ${renderPlayerCard(players[0].id, players[0].name, "p1", youIndex === 0)}
            ${renderPlayerCard(players[1].id, players[1].name, "p2", youIndex === 1)}
          `);
        }
        break;
      }

      case "game:ready":
		resetTimer(30);
		const { players, playerIndex } = msg;
        currentPlayers = players;
        console.log("game:start payload", msg);

        const playerCardsContainer = document.getElementById("player-cards");
        if (playerCardsContainer && players[0] && players[1]) {
          playerCardsContainer.innerHTML = DOMPurify.sanitize(`
            ${renderPlayerCard(players[0].id, players[0].name, "p1", playerIndex === 0)}
            ${renderPlayerCard(players[1].id, players[1].name, "p2", playerIndex === 1)}
          `);
        }
        break;

      case "room:start":
        initRemoteGame(msg.roomId);
        break;


      case "game:start": {
        document.getElementById("startPress")?.remove();

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

		 //block keyboard while overlay is up
        modalActive = true;

        const textEl = document.getElementById("resultText");
		if (textEl) {
		const p1Name = currentPlayers[0]?.name ?? t("player1") ?? "Player 1";
		const p2Name = currentPlayers[1]?.name ?? t("player2") ?? "Player 2";
		const win = t("win") ?? " wins 🥇";
		const tie = t("itsATie") ?? "It's a draw 🤝";

		textEl.textContent =
			msg.winner === "draw"
			? tie
			: msg.winner === "p1"
			? `${p1Name}${win}`
			: `${p2Name}${win}`;
		}
	}
    break;

      case "game:update":
        updateGameState(msg.state);
        break;

      case "game:end":
        showGameOver(msg.winner);
        break;
    }
  });

	// Directly render cards using currentPlayers if they’re known already
	const playerCardsHTML =
	currentPlayers.length >= 2
		? currentPlayers
			.slice(0, 2)
			.map((p, i) =>
			renderPlayerCard(p.id, p.name, i === 0 ? "p1" : "p2", false)
			)
			.join("")
		: "";

  return `
    ${addTheme()}

    <div class="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_50%,rgba(0,0,0,1)_100%)] z-0"></div>

    <!-- Header with user info -->
    <div class="w-full flex justify-between items-center mb-10 relative z-3">
      ${profileDivDisplay()}
      ${sidebarDisplay()}
       <div id="player-cards" class="absolute left-1/2 -translate-x-1/2 flex gap-4">
            ${playerCardsHTML}
       </div>
    	<!-- Group Logout on the right -->
        <div class="flex gap-2 items-center">
             ${LogOutBtnDisplay()}
		</div>
    </div>

	<!-- Timer -->
	${TimerDisplay()}

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

		<!-- Time Up Overlay -->
			<div id="timeUpOverlay"
				class="absolute inset-0 z-60 hidden"
				style="border-radius: inherit;">
			
			<!-- background layer inside the game area -->
			<div class="absolute inset-0 rounded-[inherit] bg-black/60"></div>

			<!-- foreground content -->
			<div class="relative h-full w-full flex flex-col items-center justify-center px-4 animate-zoomIn">
				<h2 class="text-2xl font-bold text-white">${t("timeUp")}</h2>
				<p id="resultText" class="text-lg text-gray-200 mt-2 mb-6">${t("result")}</p>
              <button id="overlayExit"
                class="px-6 py-3 rounded-xl font-semibold text-white transition hover:shadow cursor-pointer bg-[var(--color-button)] hover:bg-[var(--color-button-hover)]">
                ${t("backToArcade")}
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
            ${t("pressStart")}
          </p>

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

  // remove old handlers if they exist
  if (keydownHandler) document.removeEventListener("keydown", keydownHandler);
  if (keyupHandler) document.removeEventListener("keyup", keyupHandler);

  keydownHandler = (e: KeyboardEvent) => {
	//if overlay is visible, swallow Space + movement
	const timeUp = document.getElementById("timeUpOverlay");
	if (modalActive || isVisible(timeUp)) {
		if (e.code === "Space" || ["ArrowUp","ArrowDown","w","s"].includes(e.key)) {
		e.preventDefault();
		e.stopPropagation();
		}
		return;
	}

    if (e.code === "Space") {
      socket?.send(JSON.stringify({ type: "game:begin", roomId }));
      document.getElementById("startPress")?.remove();
    }
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

  keyupHandler = (e: KeyboardEvent) => {
	 // block movement keyups while overlay is visible
	const timeUp = document.getElementById("timeUpOverlay");
	if (modalActive || isVisible(timeUp)) {
		if (["ArrowUp","ArrowDown","w","s"].includes(e.key)) {
		e.preventDefault();
		e.stopPropagation();
		}
		return;
	}

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
	modalActive = false; // clear block (safe even if you navigate away)
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

function showGameOver(winner: string) {
  alert(`Game Over! Winner: ${winner}`);
  window.location.hash = "intro";
}

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
