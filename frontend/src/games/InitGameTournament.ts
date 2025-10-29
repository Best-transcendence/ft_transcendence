import { thisUser } from "../router";
import { MatchObject, saveMatch } from "../services/matchActions";
import { startTimer } from "../components/Timer";
import { registerTournamentGame } from "./GameController";

/**
 * Tournament Game Controller
 * 
 * This module handles the initialization and control of tournament-style Pong games.
 * It provides a complete game loop with paddle physics, ball collision detection,
 * scoring system, and tournament-specific features like timed rounds.
 */

// Difficulty configuration (from AI system)
const DIFFICULTY = {
  easy: { 
    ballSpeed: 1.0, 
    gameTime: 8 // TODO: Change back to 40 seconds
  },
  medium: { 
    ballSpeed: 1.5, 
    gameTime: 30 
  },
  hard: { 
    ballSpeed: 2.5, 
    gameTime: 20 
  }
};

// Global handler for game timeout events - prevents duplicate listeners across tournaments
let _timeupHandler: ((e: Event) => void) | null = null;

// Singleton guard - prevent multiple initializations
let _initialized = false;

/**
 * Initializes the tournament game system
 * 
 * Sets up the game canvas, event listeners, physics constants, and game state.
 * This function is called when entering a tournament game session.
 */
export function initGameTournament(): void {
  // Prevent multiple initializations
  if (_initialized) {
    console.log("=== TOURNAMENT GAME ALREADY INITIALIZED - SKIPPING ===");
    return;
  }
  
  console.log("=== INITIALIZING TOURNAMENT GAME ===");
  _initialized = true;
  
  // Utility function to get DOM elements by ID with non-null assertion
  const $ = (id: string) => document.getElementById(id)!;

  // Game UI elements
  const paddle1 = $("paddle1");        // Left player paddle
  const paddle2 = $("paddle2");        // Right player paddle
  const ball = $("ball");              // Game ball
  const score1 = $("score1");          // Left player score display
  const score2 = $("score2");          // Right player score display
  const startPress = $("startPress");  // "Press Space" instruction text

  // Audio elements for game sound effects
  const paddleSfx = $("paddleSound") as HTMLAudioElement;  // Paddle hit sound
  const wallSfx = $("wallSound") as HTMLAudioElement;      // Wall bounce sound
  const lossSfx = $("lossSound") as HTMLAudioElement;       // Score point sound

  // Game field dimensions (percentage-based to match CSS)
  const FIELD = 100;                   // Total field width (100%)
  const BALL_W = 3.3, BALL_H = 5;      // Ball dimensions: w-[3.3%], h-[5%]
  const PADDLE_W = 3.3, PADDLE_H = 25; // Paddle dimensions: w-[3.3%], h-[25%]

  // Game state variables
  let running = false;                 // Whether the game loop is active
  let animationFrameId = 0;            // RequestAnimationFrame ID for cleanup

  // Score tracking
  let s1 = 0, s2 = 0;                  // Player 1 and Player 2 scores
  let lastServe: "left" | "right" | null = null; // Which side served last (for alternating serves)

  // Position and velocity state
  let p1Y = 37.5, p2Y = 37.5;          // Paddle Y positions (matches CSS top-[37.5%])
  let ballX = 50, ballY = 50;           // Ball center position
  let ballVelX = 0, ballVelY = 0;      // Ball velocity components

  // Paddle physics
  let p1Vel = 0, p2Vel = 0;            // Paddle velocities
  const accel = 0.5;                    // Acceleration when key is pressed
  const maxSpeed = 2.5;                 // Maximum paddle speed
  const friction = 0.1;                 // Friction coefficient for smooth deceleration

  // Input state tracking
  let p1Up = false, p1Down = false, p2Up = false, p2Down = false;

// Flag to prevent multiple keyboard event listeners from being bound
let __keysBound = false;
let __keydownHandler: ((e: KeyboardEvent) => void) | null = null;
let __keyupHandler: ((e: KeyboardEvent) => void) | null = null;

/**
 * Destroys the tournament game completely
 * Removes all event listeners and resets state
 */
function destroyGame() {
  console.log("=== DESTROYING TOURNAMENT GAME (FULL CLEANUP) ===");
  running = false;
  if (animationFrameId) {
    console.log("Cancelling animation frame:", animationFrameId);
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }
  
  // Remove keyboard event listeners
  console.log("Removing keyboard listeners");
  if (__keydownHandler) {
    document.removeEventListener("keydown", __keydownHandler);
    __keydownHandler = null;
  }
  if (__keyupHandler) {
    document.removeEventListener("keyup", __keyupHandler);
    __keyupHandler = null;
  }
  __keysBound = false;
  
  // Reset initialization flag
  _initialized = false;
  
  console.log("=== TOURNAMENT GAME DESTROYED ===");
}

/**
 * Stops the game loop (for pausing between rounds)
 * Does NOT remove event listeners - only stops the animation frame
 */
function stopGame() {
  console.log("=== PAUSING TOURNAMENT GAME ===");
  running = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }
}
// Expose stopGame globally for external tournament control
(window as any).stopTournamentGame = stopGame;

/**
 * Tournament round layout handler
 * Resets the field, scores, and shows the "Press Space" instruction
 * Called when a new tournament round begins
 */
(window as any).layoutTournamentRound = () => {
  // Reset field & scores, show the "Press Space" text
  prepareNewRound();        // Combines: stopGame + resetScores + resetObjects + show startPress
};

/**
 * Tournament round start handler
 * Begins the actual game round with timer and ball serving
 * Includes protection against starting multiple rounds simultaneously
 */
(window as any).beginTournamentRound = () => {
  // Do nothing if a round is already running (space key protection)
  if (running) return;
  
  // Get game time from difficulty settings
  const difficulty = (window as any).tournamentDifficulty || "medium";
  const gameTime = DIFFICULTY[difficulty as keyof typeof DIFFICULTY].gameTime;
  
  startTimer(gameTime);     // Start timer based on difficulty
  serveBall();              // Serve the ball with random direction
  startGame();              // Begin the game loop
};

/**
 * Resets game objects to their initial positions and velocities
 * Does NOT reset scores - used for ball resets during gameplay
 */
function resetObjects() {
  // Reset paddle positions to center
  p1Y = 37.5; p2Y = 37.5;
  p1Vel = 0;  p2Vel = 0;
  paddle1.style.top = p1Y + "%";
  paddle2.style.top = p2Y + "%";

  // Place ball in center with no motion (waiting for serve)
  ballX = 50 - BALL_W / 2;
  ballY = 50 - BALL_H / 2;
  ballVelX = 0; ballVelY = 0;
  ball.style.left = ballX + "%";
  ball.style.top  = ballY + "%";
}

/**
 * Resets both player scores to zero
 * Updates the score display elements
 */
function resetScores() {
  s1 = 0; s2 = 0;
  lastServe = null; // Reset serve alternation for new round
  score1.textContent = "0";
  score2.textContent = "0";
}

/**
 * Prepares a new tournament round
 * Stops current game, resets scores and objects, shows start instruction
 */
function prepareNewRound() {
  stopGame();           // Stop any running game
  resetScores();        // Reset scores to 0-0
  resetObjects();       // Reset paddles and ball positions
  startPress.classList.remove("hidden");  // Show "Press Space" instruction
}

/**
 * Serves the ball with a random direction
 * Sets initial velocity with consistent speed regardless of angle
 * Alternates serve direction each time for fairness
 * Speed is based on tournament difficulty
 */
function serveBall() {
  // Get difficulty from tournament settings
  const difficulty = (window as any).tournamentDifficulty || "medium";
  const speed = DIFFICULTY[difficulty as keyof typeof DIFFICULTY].ballSpeed;
  
  // Random angle between -45 and 45 degrees (in radians)
  const angleVariation = (Math.random() - 0.5) * Math.PI / 2;  // ±45°
  
  // Alternate serve direction for fairness
  const direction = lastServe === "left" ? 1 : lastServe === "right" ? -1 : (Math.random() > 0.5 ? 1 : -1);
  lastServe = direction === 1 ? "right" : "left";
  
  // Calculate velocity components for consistent speed
  ballVelX = direction * speed * Math.cos(angleVariation);
  ballVelY = speed * Math.sin(angleVariation);
}

/**
 * Starts the game loop
 * Includes protection against multiple starts and cleanup of previous frames
 */
function startGame() {
  if (running) return;                 // Prevent starting multiple games
  console.log("=== STARTING TOURNAMENT GAME ===");
  running = true;
  startPress.classList.add("hidden");  // Hide start instruction

  // Clean up any existing animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }
  
  // Serve ball if it's not already moving
  if (ballVelX === 0 && ballVelY === 0) serveBall();

  // Start the game loop
  animationFrameId = requestAnimationFrame(loop);
  console.log("Tournament game loop started, animationFrameId:", animationFrameId);
}

// Remove any previous timeout handler to prevent duplicates across tournaments
if (_timeupHandler) {
  window.removeEventListener("game:timeup", _timeupHandler);
  _timeupHandler = null;
}

/**
 * Game timeout event handler
 * Called when the tournament round timer expires
 * Reads current scores from DOM and notifies tournament system
 */
_timeupHandler = () => {
  console.log("=== TOURNAMENT TIME UP ===");
  stopGame();  // Stop the game loop

  // Read current scores from DOM elements
  const l = Number(score1?.textContent ?? 0);  // Left player score
  const r = Number(score2?.textContent ?? 0);  // Right player score
  console.log("Final scores: Left =", l, "Right =", r);

  // Get player names and data from tournament system
  const players = (window as any).tournamentCurrentPlayers;
  const leftName = players?.left || "Player 1";
  const rightName = players?.right || "Player 2";
  const leftPlayer = players?.leftPlayer;
  const rightPlayer = players?.rightPlayer;

  console.log("=== TOURNAMENT MATCH SAVING DEBUG ===");
  console.log("=== TOURNAMENT MATCH SAVE DEBUG ===");
  console.log("Left player:", leftPlayer);
  console.log("Right player:", rightPlayer);
  console.log("Left authenticated:", leftPlayer?.isAuthenticated);
  console.log("Right authenticated:", rightPlayer?.isAuthenticated);
  console.log("Tournament current players:", (window as any).tournamentCurrentPlayers);
  
  // Save match if both players are authenticated (regardless of who the logged-in user is)
  if (leftPlayer?.isAuthenticated && rightPlayer?.isAuthenticated) {
    // Determine if this is a final match by checking the current match round
    const currentMatch = (window as any).tournamentCurrentMatch;
    const isFinal = currentMatch?.round === 2;
    
    console.log("Current match:", currentMatch);
    console.log("Is final:", isFinal);
    
    const matchData: MatchObject = {
      type: isFinal ? "TOURNAMENT_FINAL" : "TOURNAMENT_INTERMEDIATE",
      date: new Date().toISOString(),
      player1Id: leftPlayer.authUserId!,
      player2Id: rightPlayer.authUserId!,
      player1Score: l,
      player2Score: r,
    };
    
    console.log("Saving match data:", matchData);
    
    saveMatch(matchData).then(result => {
      console.log("Match saved successfully:", result);
    }).catch(err => 
      console.error("Failed to save tournament match:", err)
    );
  } else {
    console.log("Skipping match save - not both players authenticated");
  }

  // Show time up overlay with winner
  const timeUpOverlay = document.getElementById("timeUpOverlay");
  const winnerText = document.getElementById("winnerText");
  
  if (timeUpOverlay && winnerText) {
    // Determine winner
    if (l > r) {
      winnerText.textContent = `${leftName} won 🏆`;
      console.log("Winner:", leftName);
    } else if (r > l) {
      winnerText.textContent = `${rightName} won 🏆`;
      console.log("Winner:", rightName);
    } else {
      winnerText.textContent = "It's a tie! 🤝";
      console.log("Result: Tie");
    }
    timeUpOverlay.classList.remove("hidden");
  }

  // Set up continue button to hide overlay and notify tournament system
  const continueBtn = document.getElementById("continueToResults");
  if (continueBtn) {
    // Remove old listeners
    const newBtn = continueBtn.cloneNode(true) as HTMLButtonElement;
    continueBtn.parentNode?.replaceChild(newBtn, continueBtn);
    
    newBtn.addEventListener("click", () => {
      console.log("Continue button clicked, hiding overlay");
      timeUpOverlay?.classList.add("hidden");
      
      // Notify tournament system of round completion with final scores
      const timeUp = (window as any).tournamentTimeUp;
      if (typeof timeUp === "function") {
        console.log("Calling tournamentTimeUp with scores:", l, r);
        timeUp(l, r);
      }
    });
  }
};

// Register the timeout handler
window.addEventListener("game:timeup", _timeupHandler);

  // Bind keyboard controls only once to prevent duplicate listeners
  if (!__keysBound) {
    __keysBound = true;
    
    // Keyboard input handler for game controls
    __keydownHandler = (e: KeyboardEvent) => {
      // Space bar: Start game round (with overlay protection)
      if (e.code === "Space" && !running) {
        const ov = document.getElementById("tournament-overlay");
        if (ov && !ov.classList.contains("hidden")) return; // Space handled by overlay

        // Start the tournament round
        (window as any).beginTournamentRound?.();
      }
      
      // Player 1 controls (WASD)
      if (e.key === "w") p1Up = true;
      if (e.key === "s") p1Down = true;
      
      // Player 2 controls (Arrow keys)
      if (e.key === "ArrowUp") p2Up = true;
      if (e.key === "ArrowDown") p2Down = true;
    };
    document.addEventListener("keydown", __keydownHandler);

    // Keyboard release handler for smooth paddle movement
    __keyupHandler = (e: KeyboardEvent) => {
      // Player 1 controls (WASD)
      if (e.key === "w") p1Up = false;
      if (e.key === "s") p1Down = false;
      
      // Player 2 controls (Arrow keys)
      if (e.key === "ArrowUp") p2Up = false;
      if (e.key === "ArrowDown") p2Down = false;
    };
    document.addEventListener("keyup", __keyupHandler);
  }

  /**
   * Main game loop - called every animation frame
   * Updates game state and renders objects
   */
  function loop() {
    if (!running) return;  // Exit if game is stopped
    updatePaddles();       // Update paddle positions
    updateBall();          // Update ball physics and collisions
    animationFrameId = requestAnimationFrame(loop);  // Schedule next frame
  }

  /**
   * Updates paddle positions based on input and physics
   * Applies acceleration, friction, and boundary constraints
   */
  function updatePaddles() {
    // Apply input to paddle velocities
    p1Vel = applyInput(p1Up, p1Down, p1Vel);
    p2Vel = applyInput(p2Up, p2Down, p2Vel);

    // Clamp paddle positions to field boundaries
    const maxY = FIELD - PADDLE_H;  // Maximum Y position (100% - 25% = 75%)
    p1Y = clamp(p1Y + p1Vel, 0, maxY);
    p2Y = clamp(p2Y + p2Vel, 0, maxY);

    // Update DOM element positions
    paddle1.style.top = p1Y + "%";
    paddle2.style.top = p2Y + "%";
  }

  /**
   * Applies input to paddle velocity with acceleration and friction
   * @param up - Up input pressed
   * @param down - Down input pressed  
   * @param vel - Current velocity
   * @returns New velocity after applying input
   */
  function applyInput(up: boolean, down: boolean, vel: number): number {
    if (up) vel -= accel;                    // Accelerate up
    if (down) vel += accel;                  // Accelerate down
    if (!up && !down) vel *= (1 - friction); // Apply friction when no input
    return clamp(vel, -maxSpeed, maxSpeed);  // Clamp to max speed
  }

  /**
   * Updates ball position and handles all collisions
   * Manages wall bounces, paddle hits, and scoring
   */
  function updateBall() {
    // Update ball position
    ballX += ballVelX;
    ballY += ballVelY;

    // Wall collision detection (top and bottom walls)
    if (ballY <= 0) {
      ballY = 0;                    // Prevent ball from going above field
      ballVelY *= -1;               // Reverse vertical velocity
      //playSound(wallSfx);         // TODO: Implement sound effects
    } else if (ballY >= FIELD - BALL_H) {
      ballY = FIELD - BALL_H;       // Prevent ball from going below field
      ballVelY *= -1;               // Reverse vertical velocity
      //playSound(wallSfx);         // TODO: Implement sound effects
    }

    // Left paddle collision detection
    // Ball hits left paddle when: ball left edge <= paddle right edge AND
    // ball right edge >= paddle left edge AND vertical overlap exists
    if (
      ballX <= PADDLE_W &&                    // Ball left edge hits paddle right edge
      ballX + BALL_W >= 0 &&                  // Ball is still within field
      ballY + BALL_H >= p1Y && ballY <= p1Y + PADDLE_H  // Vertical overlap with paddle
    ) {
      ballX = PADDLE_W;                       // Resolve penetration
      ballVelX *= -1;                         // Reverse horizontal velocity
      //playSound(paddleSfx);                 // TODO: Implement sound effects
    }

    // Right paddle collision detection
    // Ball hits right paddle when: ball right edge >= paddle left edge AND
    // ball left edge <= paddle right edge AND vertical overlap exists
    if (
      ballX + BALL_W >= FIELD - PADDLE_W &&   // Ball right edge hits paddle left edge
      ballX <= FIELD &&                        // Ball is still within field
      ballY + BALL_H >= p2Y && ballY <= p2Y + PADDLE_H  // Vertical overlap with paddle
    ) {
      ballX = FIELD - PADDLE_W - BALL_W;       // Resolve penetration
      ballVelX *= -1;                          // Reverse horizontal velocity
      //playSound(paddleSfx);                  // TODO: Implement sound effects
    }

    // Scoring detection using ball center for symmetric scoring
    const ballCenterX = ballX + BALL_W / 2;
    if (ballCenterX < 0) {
      // Ball went past left side - Player 2 (right) scores
      s2++;
      score2.textContent = s2.toString();
      //playSound(lossSfx);                    // TODO: Implement sound effects
      resetBall();
    } else if (ballCenterX > FIELD) {
      // Ball went past right side - Player 1 (left) scores
      s1++;
      score1.textContent = s1.toString();
      //playSound(lossSfx);                    // TODO: Implement sound effects
      resetBall();
    }

    // Update ball position in DOM
    ball.style.left = ballX + "%";
    ball.style.top = ballY + "%";
  }

  /**
   * Resets ball to center and serves with alternating direction
   * Called after a point is scored
   * Alternates serve side each time for maximum fairness
   * Speed is based on tournament difficulty
   */
  function resetBall() {
    // Center the ball in the field
    ballX = 50 - BALL_W / 2;
    ballY = 50 - BALL_H / 2;
    
    // Serve with consistent speed and alternating direction
    const difficulty = (window as any).tournamentDifficulty || "medium";
    const speed = DIFFICULTY[difficulty as keyof typeof DIFFICULTY].ballSpeed;
    
    // Random angle between -45 and 45 degrees (in radians)
    const angleVariation = (Math.random() - 0.5) * Math.PI / 2;  // ±45°
    
    // Alternate serve direction for fairness
    const direction = lastServe === "left" ? 1 : lastServe === "right" ? -1 : (Math.random() > 0.5 ? 1 : -1);
    lastServe = direction === 1 ? "right" : "left";
    
    // Calculate velocity components for consistent speed
    ballVelX = direction * speed * Math.cos(angleVariation);
    ballVelY = speed * Math.sin(angleVariation);
  }

  // TODO: Fix playSound function or remove from everywhere
  //   function playSound(audio: HTMLAudioElement) {
  //     audio.currentTime = 0;
  //     audio.play();
  //   }

  /**
   * Utility function to clamp a value between min and max
   * @param val - Value to clamp
   * @param min - Minimum allowed value
   * @param max - Maximum allowed value
   * @returns Clamped value
   */
  function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  }

  // Initialize the game in a clean state (scores 0-0, objects centered)
  prepareNewRound();

  // Register with unified game controller (use destroyGame for full cleanup)
  registerTournamentGame(destroyGame);
}
