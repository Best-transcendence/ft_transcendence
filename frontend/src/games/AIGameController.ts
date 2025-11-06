/**
 * AI Game Controller (Legacy)
 *
 * @deprecated This module is now a wrapper around the unified GameController.
 * Use GameController.ts for all game management.
 *
 * This module is kept for backward compatibility but delegates to GameController.
 */

export { createAIGame, destroyAIGame, isGameRunning } from "./GameController";
