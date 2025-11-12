import { thisUser } from "../router";
import type { Player } from "./TournamentEngine";

/**
 * Tournament Utilities and Helper Functions
 * 
 * This module provides utility functions for tournament management including:
 * - User identification and player object creation
 * - Player array manipulation and sorting
 * - Mathematical utilities for randomization
 * - DOM element access helpers
 * - Tournament mode validation
 */

// Public type used across the tournament system
export type Mode = "2" | "4";

// User identification and player management

/**
 * Gets the current user's display name
 * @returns {string} User's name or empty string if not available
 */
export function myName(): string {
  return (thisUser?.name ?? "").trim();
}

/**
 * Creates a stable "me" player object for the current user
 * Always uses "me" as the ID for consistency across the tournament system
 * @returns {Player} Player object representing the current user
 */
export function myPlayer(): Player {
  const name = myName() || "Me";
  return { 
    id: "me", 
    name,
    isAuthenticated: true,
    authUserId: thisUser?.authUserId || thisUser?.id || 0
  };
}

// Player array manipulation utilities
/**
 * - Ensures the current user is always first in the players array
 * - Removes any duplicates of the current user and places them at the beginning
 * @param players - Array of players to process
 * @returns {Player[]} New array with current user first, others following
 */
export function ensureMeFirst(players: Player[]): Player[] {
  const me = myPlayer();
  const rest = players.filter(p => p.name.toLowerCase() !== me.name.toLowerCase());
  return [me, ...rest];
}

/**
 * Sorts players for display with current user first
 * Maintains original order for other players while ensuring user visibility
 * @param players - Array of players to sort
 * @returns {Player[]} New array sorted for optimal display
 */
export function sortForRender(players: Player[]): Player[] {
  const me = myPlayer();
  const rest = players.filter(p => p.name.toLowerCase() !== me.name.toLowerCase());
  return [me, ...rest];
}

// Mathematical and generic utilities

/**
 * Fisher-Yates shuffle algorithm for array randomization
 * - Creates a new shuffled array without modifying the original
 * @param arr - Array to shuffle
 * @returns {T[]} New array with elements in random order
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; // shallow copy 
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // round a random number beetween the rangr
    [a[i], a[j]] = [a[j]!, a[i]!]; // swap without TS warn
  }
  return a;
}

/**
 * Gets the maximum player count for a tournament mode
 * @param mode - Tournament mode ("2" or "4")
 * @returns {2 | 4} Required player count for the mode
 */
export function currentMax(mode: Mode): 2 | 4 {
  return mode === "2" ? 2 : 4;
}

// DOM element access utilities

/**
 * Gets a DOM element by ID with strong typing and error handling
 * Throws an error if the element is not found, ensuring fail-fast behavior
 * @param id - Element ID to find
 * @returns {T} Strongly typed HTML element
 * @throws {Error} If element with the given ID is not found
 */
export function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el as T;
}
