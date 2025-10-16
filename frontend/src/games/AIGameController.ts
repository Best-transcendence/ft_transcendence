/**
 * AI Game Controller
 * 
 * This module implements a singleton pattern for managing AI game instances.
 * It ensures only one AI game can run at a time and provides clean lifecycle management.
 * 
 * Key responsibilities:
 * - Create and destroy AI game instances
 * - Prevent multiple simultaneous games
 * - Clean up resources properly
 * - Track game state
 */

import { initGameAIOpponent } from "./InitGameAIOpponent";

/**
 * Interface for game instances
 * Each game instance must provide a destroy method for cleanup
 */
type GameInstance = {
  destroy: () => void;
};

// --- SINGLETON STATE ---
/**
 * Current active game instance
 * Only one game can run at a time to prevent conflicts
 */
let currentGame: GameInstance | null = null;

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
  
  // Check if a game is already running
  if (currentGame) {
    console.warn("Game already running, destroying previous instance");
    currentGame.destroy();
  }

  // Reset global destroy flag to allow new game to start
  (window as any).aiGameDestroyed = false;
  
  // Create new game instance
  const instance = initGameAIOpponent(level);
  currentGame = instance;
  console.log("=== AI GAME CREATED ===");
  return instance;
}

/**
 * Destroys the current AI game instance and cleans up all resources
 * 
 * This function:
 * - Destroys the current game instance if one exists
 * - Cleans up global animation frames
 * - Resets the singleton state
 * - Prevents memory leaks and resource conflicts
 */
export function destroyAIGame() {
  console.log("=== DESTROYING AI GAME ===");
  
  // Destroy current game instance if it exists
  if (currentGame) {
    currentGame.destroy();
    currentGame = null;
    console.log("=== AI GAME DESTROYED ===");
  }
  
  // Clean up any remaining global animation frames
  // This prevents orphaned animation loops from continuing to run
  if ((window as any).globalAnimationFrameId) {
    console.log("Cleaning up global animation frame:", (window as any).globalAnimationFrameId);
    cancelAnimationFrame((window as any).globalAnimationFrameId);
    (window as any).globalAnimationFrameId = null;
  }
}

/**
 * Checks if an AI game is currently running
 * 
 * @returns true if a game is active, false otherwise
 */
export function isGameRunning(): boolean {
  return currentGame !== null;
}
