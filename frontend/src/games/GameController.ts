/**
 * Unified Game Controller (Singleton)
 * 
 * This module implements a singleton pattern for managing ALL game instances.
 * It ensures only ONE game can run at a time, regardless of game type.
 * 
 * Key responsibilities:
 * - Manage lifecycle of all game types (AI, Tournament, 2-player, Remote)
 * - Prevent multiple simultaneous games
 * - Clean up resources properly
 * - Track current game state and type
 */

import { initGameAIOpponent } from "./InitGameAIOpponent";

/**
 * Interface for game instances
 * Each game instance must provide a destroy method for cleanup
 */
type GameInstance = {
  destroy: () => void;
};

/**
 * Supported game types
 */
export type GameType = "ai" | "tournament" | "local" | "remote";

// --- SINGLETON STATE ---
/**
 * Current active game instance
 * Only one game can run at a time to prevent conflicts
 */
let currentGame: GameInstance | null = null;

/**
 * Type of the currently running game
 */
let currentGameType: GameType | null = null;

/**
 * Creates a new AI game instance with the specified difficulty level
 * 
 * Implements singleton pattern - if a game is already running, it will be destroyed
 * before creating a new one to prevent multiple games running simultaneously.
 * 
 * @param level - Difficulty level: "easy", "medium", or "hard"
 * @returns The new game instance or null if creation failed
 */
export function createAIGame(level: "easy" | "medium" | "hard"): GameInstance | null {
  console.log("=== CREATING AI GAME ===", level);
  
  // Only destroy if there's a DIFFERENT type of game running
  // If it's already an AI game, destroy it to recreate with new difficulty
  if (currentGame !== null && currentGameType !== "ai") {
    console.log("Destroying existing", currentGameType, "game before creating AI game");
    destroyCurrentGame();
  } else if (currentGame !== null && currentGameType === "ai") {
    console.log("Destroying existing AI game to recreate with new difficulty");
    destroyCurrentGame();
  }

  // Reset global destroy flag to allow new game to start
  (window as any).aiGameDestroyed = false;
  
  // Create new game instance
  const instance = initGameAIOpponent(level);
  currentGame = instance;
  currentGameType = "ai";
  console.log("=== AI GAME CREATED ===");
  return instance;
}

/**
 * Registers a tournament game instance
 * Called when tournament game is initialized
 * 
 * @param destroyFn - Function to call when destroying the tournament game
 */
export function registerTournamentGame(destroyFn: () => void) {
  console.log("=== REGISTERING TOURNAMENT GAME ===");
  
  // Only destroy if there's a DIFFERENT type of game running
  // If it's already a tournament, just update the destroy function
  if (currentGame !== null && currentGameType !== "tournament") {
    console.log("Destroying existing", currentGameType, "game before registering tournament");
    destroyCurrentGame();
  }
  
  currentGame = { destroy: destroyFn };
  currentGameType = "tournament";
  console.log("=== TOURNAMENT GAME REGISTERED ===");
}

/**
 * Registers a local 2-player game instance
 * Called when local game is initialized
 * 
 * @param destroyFn - Function to call when destroying the game
 */
export function registerLocalGame(destroyFn: () => void) {
  console.log("=== REGISTERING LOCAL GAME ===");
  
  // Destroy any existing game first
  destroyCurrentGame();
  
  currentGame = { destroy: destroyFn };
  currentGameType = "local";
  console.log("=== LOCAL GAME REGISTERED ===");
}

/**
 * Registers a remote game instance
 * Called when remote game is initialized
 * 
 * @param destroyFn - Function to call when destroying the game
 */
export function registerRemoteGame(destroyFn: () => void) {
  console.log("=== REGISTERING REMOTE GAME ===");
  
  // Destroy any existing game first
  destroyCurrentGame();
  
  currentGame = { destroy: destroyFn };
  currentGameType = "remote";
  console.log("=== REMOTE GAME REGISTERED ===");
}

/**
 * Destroys the current game instance and cleans up all resources
 * 
 * This function:
 * - Destroys the current game instance if one exists
 * - Cleans up global animation frames
 * - Resets the singleton state
 * - Prevents memory leaks and resource conflicts
 */
export function destroyCurrentGame() {
  if (!currentGame) {
    console.log("No game to destroy");
    return;
  }

  console.log(`=== DESTROYING ${currentGameType?.toUpperCase()} GAME ===`);
  
  // Destroy current game instance
  currentGame.destroy();
  currentGame = null;
  
  const wasType = currentGameType;
  currentGameType = null;
  
  console.log(`=== ${wasType?.toUpperCase()} GAME DESTROYED ===`);
  
  // Clean up any remaining global animation frames
  // This prevents orphaned animation loops from continuing to run, no waste on CPU
  if ((window as any).globalAnimationFrameId) {
    console.log("Cleaning up global animation frame:", (window as any).globalAnimationFrameId);
    cancelAnimationFrame((window as any).globalAnimationFrameId);
    (window as any).globalAnimationFrameId = null;
  }
}

/**
 * Checks if a game is currently running
 * 
 * @returns true if a game is active, false otherwise
 */
export function isGameRunning(): boolean {
  return currentGame !== null;
}

/**
 * Gets the type of the currently running game
 * 
 * @returns The current game type or null if no game is running
 */
export function getCurrentGameType(): GameType | null {
  return currentGameType;
}

/**
 * Legacy function for AI game compatibility
 * @deprecated Use destroyCurrentGame() instead
 */
export function destroyAIGame() {
  if (currentGameType === "ai" || currentGameType === null) {
    destroyCurrentGame();
  }
}

