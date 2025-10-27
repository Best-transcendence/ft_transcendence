import { rooms } from './rooms.js';

export function registerGameHandlers(wss, onlineUsers, app) {
  function handleGameJoin(ws, data) {
    const { roomId } = data;
    const room = rooms.get(roomId);
    if (!room) return;

    // Initialize game state if it's the first time
    if (!room.state) {
      room.state = {
        active: true,
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

    // Start game when 2 players are in the room
    if (room.players.length === 2) {
      room.players.forEach(client => {
        client.send(JSON.stringify({ type: 'game:ready', roomId }));
      });

      resetBall(room.state);

      // Wait 1 second before starting the game loop to allow frontend to load
      if (room.loopId) clearInterval(room.loopId);
      if (room.timerId) clearInterval(room.timerId);
      room.loopId = null;
      room.timerId = null;

    }
  }

  function handleGameMove(ws, data) {
    const { roomId, direction, action } = data;
    const room = rooms.get(roomId);
    if (!room || !room.state || !room.state.active) return;

    const playerIndex = room.players.indexOf(ws);
    if (playerIndex === -1) return;

    const isDown = action === "down";

    // Map input to player movement flags
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

      // Update paddle velocity based on input
      state.p1Vel = applyInput(state.p1Up, state.p1Down, state.p1Vel);
      state.p2Vel = applyInput(state.p2Up, state.p2Down, state.p2Vel);

      const maxY = FIELD - PADDLE_H;
      state.p1Y = clamp(state.p1Y + state.p1Vel, 0, maxY);
      state.p2Y = clamp(state.p2Y + state.p2Vel, 0, maxY);

      // Update ball position
      state.ballX += state.ballVelX;
      state.ballY += state.ballVelY;

      // Bounce off top/bottom walls
      if (state.ballY <= 0 || state.ballY >= FIELD - BALL_H) {
        state.ballVelY *= -1;
      }
      const speedBoost = 1.05; // 5% increase per hit
      // Left paddle collision
      if (
        state.ballX <= PADDLE_W &&
        state.ballY + BALL_H >= state.p1Y &&
        state.ballY <= state.p1Y + PADDLE_H
      ) {
        state.ballX = PADDLE_W;
        state.ballVelX *= -1 * speedBoost;
        state.ballVelY *= speedBoost;
      }

      // Right paddle collision
      if (
        state.ballX + BALL_W >= FIELD - PADDLE_W &&
        state.ballY + BALL_H >= state.p2Y &&
        state.ballY <= state.p2Y + PADDLE_H
      ) {
        state.ballX = FIELD - PADDLE_W - BALL_W;
        state.ballVelX *= -1 * speedBoost;
        state.ballVelY *= speedBoost;
      }

      // Scoring logic
      const ballCenterX = state.ballX + BALL_W / 2;
      if (ballCenterX < 0) {
        state.s2++;
        resetBall(state);
      } else if (ballCenterX > FIELD) {
        state.s1++;
        resetBall(state);
      }
      if (!room.state.active)
        resetBall(state);

      broadcastGameState(room);
    }, 1000 / 60); // Run at ~60 FPS
  }

  function applyInput(up, down, vel) {
    if (up) vel -= 0.3;
    if (down) vel += 0.3;
    if (!up && !down) vel *= 0.9; // Apply friction
    return clamp(vel, -1.5, 1.5);
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function resetBall(state) {
    state.ballX = 50 - 3.3 / 2;
    state.ballY = 50 - 5 / 2;

    // Set slower initial ball velocity
    state.ballVelX = Math.random() > 0.5 ? 0.6 : -0.6;
    state.ballVelY = Math.random() > 0.5 ? 0.4 : -0.4;
  }

  function broadcastGameState(room) {
    const state = room.state;
    const normalized = {
      p1Y: state.p1Y,
      p2Y: state.p2Y,
      s1: state.s1,
      s2: state.s2,
    };
    if (state.active) {
      normalized.ballX = state.ballX;
      normalized.ballY = state.ballY;
    }
    room.players.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: "game:update",
          state: normalized,
        }));
      }
    });
  }

  function startGameTimer(roomId, room, duration) {
    const endTime = Date.now() + duration * 1000;

    room.timerId = setInterval(() => {
      const now = Date.now();
      let remaining = Math.ceil((endTime - now) / 1000);

      if (remaining < 0) remaining = 0;

      // Broadcast authoritative timer
      room.players.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: "game:timer",
            remaining
          }));
        }
      });

      if (remaining <= 0) {
        clearInterval(room.timerId);
        clearInterval(room.loopId);
        room.timerId = null;
        room.loopId = null;

        // Decide winner
        let winner = "draw";
        if (room.state.s1 > room.state.s2) winner = "p1";
        else if (room.state.s2 > room.state.s1) winner = "p2";

        room.players.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: "game:timeup",
              winner,
              scores: { s1: room.state.s1, s2: room.state.s2 }
            }));
          }
        });
        room.state.active = false;
        room.state.p1Vel = 0;
        room.state.p2Vel = 0;
        room.state.p1Up = false;
        room.state.p1Down = false;
        room.state.p2Up = false;
        room.state.p2Down = false;
      }
    }, 1000);
  }

  function handleGameBegin(ws, data) {
    const { roomId } = data;
    const room = rooms.get(roomId);
    if (!room || !room.state || room.loopId || room.timerId) return;

    room.players.forEach(client => {
      client.send(JSON.stringify({ type: 'game:start', roomId, duration: 30 }));
    });

    setTimeout(() => {
      startGameLoop(roomId, room);
      startGameTimer(roomId, room, 30);
    }, 1000);
  }


  return {
    handleGameJoin,
    handleGameMove,
    handleGameBegin,
  };
}