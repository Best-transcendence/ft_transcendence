import { initGameAIOpponent } from "./InitGameAIOpponent";

type GameInstance = {
  destroy: () => void;
};

let currentGame: GameInstance | null = null;

export function createAIGame(level: "easy" | "medium" | "hard"): GameInstance | null {
  console.log("=== CREATING AI GAME ===", level);
  
  if (currentGame) {
    console.warn("Game already running, destroying previous instance");
    currentGame.destroy();
  }

  // Reset global destroy flag
  (window as any).aiGameDestroyed = false;
  
  const instance = initGameAIOpponent(level);
  currentGame = instance;
  console.log("=== AI GAME CREATED ===");
  return instance;
}

export function destroyAIGame() {
  console.log("=== DESTROYING AI GAME ===");
  if (currentGame) {
    currentGame.destroy();
    currentGame = null;
    console.log("=== AI GAME DESTROYED ===");
  }
  
  // Also clean up global animation frame if it exists
  if ((window as any).globalAnimationFrameId) {
    console.log("Cleaning up global animation frame:", (window as any).globalAnimationFrameId);
    cancelAnimationFrame((window as any).globalAnimationFrameId);
    (window as any).globalAnimationFrameId = null;
  }
}

export function isGameRunning(): boolean {
  return currentGame !== null;
}
