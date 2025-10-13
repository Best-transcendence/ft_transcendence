import { rooms } from './rooms.js';

export function registerGameHandlers(wss, onlineUsers, app) {
  function handleGameJoin(ws, data) {
    const { roomId } = data;
    const room = rooms.get(roomId);
    if (!room) return;

    // Inicializar estado si es la primera vez
    if (!room.state) {
      room.state = {
        p1Y: 37.5,
        p2Y: 37.5,
        p1Vel: 0,
        p2Vel: 0,
        ballX: 50,
        ballY: 50,
        ballVelX: 0,
        ballVelY: 0,
        s1: 0,
        s2: 0,
        p1Up: false,
        p1Down: false,
        p2Up: false,
        p2Down: false,
      };
    }

    ws.roomId = roomId;
    if (!room.players.includes(ws)) {
      room.players.push(ws);
    }

    app.log.info(`🎮 Player joined room ${roomId}`);

    // Iniciar juego cuando haya 2 jugadores
    if (room.players.length === 2) {
      room.players.forEach(client => {
        client.send(JSON.stringify({ type: 'game:start', roomId }));
      });

      resetBall(room.state);

      // ⏳ Esperar 1 segundo para que el frontend cargue
      setTimeout(() => {
        startGameLoop(roomId, room);
      }, 1000);
    }
  }

  function handleGameMove(ws, data) {
    const { roomId, direction, action } = data;
    const room = rooms.get(roomId);
    if (!room || !room.state) return;

    const playerIndex = room.players.indexOf(ws);
    if (playerIndex === -1) return;

    const isDown = action === "down";

    if (playerIndex === 0) {
      if (direction === "w") room.state.p1Up = isDown;
      else if (direction === "s") room.state.p1Down = isDown;
    } else if (playerIndex === 1) {
      if (direction === "ArrowUp") room.state.p2Up = isDown;
      else if (direction === "ArrowDown") room.state.p2Down = isDown;
    }

    app.log.info(`${action} ${direction} by player ${ws.user.id} in room ${roomId}`);
  }

  function startGameLoop(roomId, room) {
    const FIELD = 100;
    const BALL_W = 3.3, BALL_H = 5;
    const PADDLE_W = 3.3, PADDLE_H = 25;

    room.loopId = setInterval(() => {
      const state = room.state;

      // Movimiento de paddles
      state.p1Vel = applyInput(state.p1Up, state.p1Down, state.p1Vel);
      state.p2Vel = applyInput(state.p2Up, state.p2Down, state.p2Vel);

      const maxY = FIELD - PADDLE_H;
      state.p1Y = clamp(state.p1Y + state.p1Vel, 0, maxY);
      state.p2Y = clamp(state.p2Y + state.p2Vel, 0, maxY);

      // Movimiento de la pelota
      state.ballX += state.ballVelX;
      state.ballY += state.ballVelY;

      // Rebote arriba/abajo
      if (state.ballY <= 0 || state.ballY >= FIELD - BALL_H) {
        state.ballVelY *= -1;
      }

      // Colisión con paddle izquierdo
      if (
        state.ballX <= PADDLE_W &&
        state.ballY + BALL_H >= state.p1Y &&
        state.ballY <= state.p1Y + PADDLE_H
      ) {
        state.ballX = PADDLE_W;
        state.ballVelX *= -1;
      }

      // Colisión con paddle derecho
      if (
        state.ballX + BALL_W >= FIELD - PADDLE_W &&
        state.ballY + BALL_H >= state.p2Y &&
        state.ballY <= state.p2Y + PADDLE_H
      ) {
        state.ballX = FIELD - PADDLE_W - BALL_W;
        state.ballVelX *= -1;
      }

      // Puntos
      const ballCenterX = state.ballX + BALL_W / 2;
      if (ballCenterX < 0) {
        state.s2++;
        resetBall(state);
      } else if (ballCenterX > FIELD) {
        state.s1++;
        resetBall(state);
      }

      broadcastGameState(room);
    }, 1000 / 60); // 60 FPS
  }

  function applyInput(up, down, vel) {
    if (up) vel -= 0.5;
    if (down) vel += 0.5;
    if (!up && !down) vel *= 0.9; // fricción
    return clamp(vel, -2.5, 2.5);
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function resetBall(state) {
    state.ballX = 50 - 3.3 / 2;
    state.ballY = 50 - 5 / 2;

    // ⚙️ Velocidad reducida para mejor jugabilidad
    state.ballVelX = Math.random() > 0.5 ? 1.2 : -1.2;
    state.ballVelY = Math.random() > 0.5 ? 0.8 : -0.8;
  }

  function broadcastGameState(room) {
    const state = room.state;
    const normalized = {
      p1Y: state.p1Y,
      p2Y: state.p2Y,
      ballX: state.ballX,
      ballY: state.ballY,
      s1: state.s1,
      s2: state.s2,
    };

    room.players.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: "game:update",
          state: normalized,
        }));
      }
    });
  }

  return {
    handleGameJoin,
    handleGameMove,
  };
}