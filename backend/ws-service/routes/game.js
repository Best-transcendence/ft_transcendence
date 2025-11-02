import { rooms } from './rooms.js';

export function registerGameHandlers(wss, onlineUsers, app) {
  /**
   * Saves a remote 1v1 match to the user-service database
   * 
   * This function implements race condition prevention by ensuring only the player
   * with the higher user ID saves the match. Since both players' browsers might
   * trigger save attempts simultaneously, this deterministic approach guarantees
   * only one match record is created.
   * 
   * The match is saved with type "ONE_VS_ONE" and includes both players' scores.
   * The winner is automatically calculated by the backend based on score comparison.
   * 
   * @param {Object} player1 - WebSocket connection object for first player (must have higher ID)
   * @param {Object} player1.user - User object containing id and token
   * @param {Object} player2 - WebSocket connection object for second player
   * @param {Object} player2.user - User object containing id
   * @param {number} score1 - Score achieved by player1
   * @param {number} score2 - Score achieved by player2
   * 
   * @returns {Promise<void>} Resolves when save completes (or is skipped)
   * 
   * @example
   * // Player 10 vs Player 5: Player 10 saves
   * await saveRemoteMatch(player10, player5, 5, 3);
   * // Player 5 vs Player 10: Skipped (will be saved by higher ID player)
   */
  async function saveRemoteMatch(player1, player2, score1, score2) {
    try {
      // Prevent race condition: only player with higher ID saves
      // This ensures deterministic saving and prevents duplicate match records
      if (player1.user.id <= player2.user.id) {
        return; // Let the other player save (they will be passed as player1)
      }

      const matchData = {
        type: "ONE_VS_ONE",
        date: new Date().toISOString(),
        player1Id: player1.user.id,
        player2Id: player2.user.id,
        player1Score: score1,
        player2Score: score2
      };

      // Get user-service URL from environment or use default
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3002';

      // Call user-service to save the match
      const response = await fetch(`${userServiceUrl}/users/me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${player1.user.token}` // Use token from higher ID player
        },
        body: JSON.stringify({
          action: 'create_match',
          matchData
        })
      });

      if (response.ok) {
        app.log.info(`Match saved: Player ${player1.user.id} vs ${player2.user.id} (${score1}-${score2})`);
      } else {
        const errorText = await response.text();
        app.log.error(`Failed to save match (HTTP ${response.status}): ${errorText}`);
      }
    } catch (error) {
      app.log.error(`Error saving match: ${error.message}`);
    }
  }
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

      // Update paddle velocity
      state.p1Vel = applyInput(state.p1Up, state.p1Down, state.p1Vel);
      state.p2Vel = applyInput(state.p2Up, state.p2Down, state.p2Vel);

      const maxY = FIELD - PADDLE_H;
      state.p1Y = clamp(state.p1Y + state.p1Vel, 0, maxY);
      state.p2Y = clamp(state.p2Y + state.p2Vel, 0, maxY);

      // Update ball
      state.ballX += state.ballVelX;
      state.ballY += state.ballVelY;

      // Bounce top/bottom
      if (state.ballY <= 0 || state.ballY >= FIELD - BALL_H) {
        state.ballVelY *= -1;
      }

      const speedBoost = 1.05;
      // Left paddle
      if (
        state.ballX <= PADDLE_W &&
        state.ballY + BALL_H >= state.p1Y &&
        state.ballY <= state.p1Y + PADDLE_H
      ) {
        state.ballX = PADDLE_W;
        state.ballVelX *= -1 * speedBoost;
        state.ballVelY *= speedBoost;
      }

      // Right paddle
      if (
        state.ballX + BALL_W >= FIELD - PADDLE_W &&
        state.ballY + BALL_H >= state.p2Y &&
        state.ballY <= state.p2Y + PADDLE_H
      ) {
        state.ballX = FIELD - PADDLE_W - BALL_W;
        state.ballVelX *= -1 * speedBoost;
        state.ballVelY *= speedBoost;
      }

      // Scoring
      const ballCenterX = state.ballX + BALL_W / 2;
      if (ballCenterX < 0) {
        state.s2++;
        resetBall(state);
      } else if (ballCenterX > FIELD) {
        state.s1++;
        resetBall(state);
      }

      broadcastGameState(room);
    }, 1000 / 60);
  }

  function applyInput(up, down, vel) {
    if (up) vel -= 0.3;
    if (down) vel += 0.3;
    if (!up && !down) vel *= 0.9;
    return clamp(vel, -1.5, 1.5);
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function resetBall(state) {
    state.ballX = 50 - 3.3 / 2;
    state.ballY = 50 - 5 / 2;
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

    room.timerId = setInterval(async () => {
      const now = Date.now();
      let remaining = Math.ceil((endTime - now) / 1000);
      if (remaining < 0) remaining = 0;

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

        let winner = "draw";
        if (room.state.s1 > room.state.s2) winner = "p1";
        else if (room.state.s2 > room.state.s1) winner = "p2";
        
        app.log.info(`Game ended in room ${roomId}: ${winner} (${room.state.s1}-${room.state.s2})`);

        room.players.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: "game:timeup",
              winner,
              scores: { s1: room.state.s1, s2: room.state.s2 }
            }));
          }
        });

        // Cleanup
        room.state.active = false;
        room.state.p1Vel = 0;
        room.state.p2Vel = 0;
        room.state.p1Up = false;
        room.state.p1Down = false;
        room.state.p2Up = false;
        room.state.p2Down = false;

        /**
         * Save match to history when game ends
         * 
         * This saves the match result to the database for both players' match history.
         * Race condition prevention is implemented by:
         * 1. Sorting players by ID (higher ID first)
         * 2. Only the higher ID player's code path actually saves (checked in saveRemoteMatch)
         * 
         * Score mapping ensures that scores are correctly associated with the sorted
         * player order, regardless of which player was p1 or p2 during gameplay.
         * 
         * Match type: "ONE_VS_ONE"
         * - Only saves matches between authenticated users (no guests in 1v1 remote)
         * - Winner is calculated automatically by backend based on scores
         * - Draws (equal scores) are saved with winnerId = null
         */
        if (room.players.length === 2) {
          const [p1, p2] = room.players;
          
          // Sort players so higher ID is first (required for race condition prevention)
          const sortedPlayers = [p1, p2].sort((a, b) => b.user.id - a.user.id);
          const [higherIdPlayer, lowerIdPlayer] = sortedPlayers;
          
          // Map scores to sorted players
          // Note: p1 is always player1, p2 is always player2 in game state (room.state.s1/s2)
          // We need to map these to match the sorted player order
          const score1 = higherIdPlayer === p1 ? room.state.s1 : room.state.s2;
          const score2 = higherIdPlayer === p1 ? room.state.s2 : room.state.s1;
          
          await saveRemoteMatch(higherIdPlayer, lowerIdPlayer, score1, score2);
        }
      }
    }, 1000);
  }

  function handleGameBegin(ws, data) {
    const { roomId } = data;
    const room = rooms.get(roomId);
    if (!room || !room.state || room.loopId || room.timerId) return;

    room.players.forEach(client => {
      client.send(JSON.stringify({
        type: 'game:start',
        roomId,
        duration: 30,
        playerIndex: room.players.indexOf(client),
        players: room.players.map(p => ({
          id: p.user.id,
          name: p.user.name ?? `Player ${p.user.id}`
        }))
      }));
    });

    setTimeout(() => {
      startGameLoop(roomId, room);
      startGameTimer(roomId, room, 30);
    }, 1000);
  }

  function handleGameLeave(ws, data) {
    const { roomId } = data;
    const room = rooms.get(roomId);
    if (!room) return;

    // kick the player.
    room.players = room.players.filter(p => p !== ws);

    // If there is less than 2 cleans all
    if (room.players.length < 2) {
      if (room.timerId) clearInterval(room.timerId);
      if (room.loopId) clearInterval(room.loopId);
      rooms.delete(roomId);
      app.log.info(`Room ${roomId} cleaned up after leave`);
    }
  }

  return {
    handleGameJoin,
    handleGameMove,
    handleGameBegin,
    handleGameLeave,
  };
}
