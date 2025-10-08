import { getSocket } from "../services/ws";
import { startTimer } from "../components/Timer";

export function GamePongRemote(): string {
  return `
    <div class="min-h-screen bg-black text-white p-8">
      <h1 class="text-3xl font-bold mb-4">🎮 Sala remota</h1>
      <p class="mb-6">Esperando a que ambos jugadores estén listos...</p>

      <div id="game-area" class="relative w-full max-w-[1450px] aspect-[16/9] mx-auto">
        <!-- Aquí puedes reutilizar el layout de GamePong2D -->
        <div id="paddle1" class="absolute h-[25%] w-[3.3%] bg-white top-[37.5%]"></div>
        <div id="paddle2" class="absolute h-[25%] w-[3.3%] bg-white top-[37.5%] right-0"></div>
        <div id="ball" class="absolute h-[5%] w-[3.3%] bg-white rounded-full left-[48.3%] top-[47.5%]"></div>
        <span id="score1" class="absolute top-[5%] left-[25%] text-xl">0</span>
        <span id="score2" class="absolute top-[5%] right-[25%] text-xl">0</span>
        <p id="startPress" class="absolute bottom-[5%] left-1/2 -translate-x-1/2 text-center bg-gray-800 px-4 py-2 rounded">
          Press Space To Start The Game
        </p>
      </div>
    </div>
  `;
}

export function initRemoteGame(roomId: string) {
  const socket = getSocket();

  // Enviar solicitud para unirse a la sala
  socket?.send(JSON.stringify({
    type: "game:join",
    roomId,
  }));

  // Escuchar eventos del servidor
  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
      case "game:start":
        console.log("🎮 Game started in room:", roomId);
        startTimer(5); // iniciar temporizador
        break;

      case "game:update":
        updateGameState(msg.state); // actualizar posiciones
        break;

      case "game:end":
        showGameOver(msg.winner); // mostrar resultado
        break;
    }
  };

  // Capturar teclas y enviar movimientos
  document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) {
      socket?.send(JSON.stringify({
        type: "game:move",
        direction: e.key,
        roomId,
      }));
    }
  });
}

// Función auxiliar para actualizar el estado del juego
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
  alert(`🏆 Game Over! Winner: ${winner}`);
  window.location.hash = "intro";
}