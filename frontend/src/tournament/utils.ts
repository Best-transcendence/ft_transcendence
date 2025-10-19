import { thisUser } from "../router";
import type { Player } from "./engine";

// public type used across your codebase
export type Mode = "2" | "4";

// User helpers

/** Current user's display name, empty string if unknown. */
export function myName(): string {
  return (thisUser?.name ?? "").trim();
}

/** Stable "me" player object (id is always "me"). */
export function myPlayer(): Player {
  const name = myName() || "Me";
  return { id: "me", name };
}

// Players array utilities

/**
 * Return a new players array with "me" first (by name, case-insensitive).
 * If a duplicate of "me" exists in the list, it will be de-duplicated.
 */
export function ensureMeFirst(players: Player[]): Player[] {
  const me = myPlayer();
  const rest = players.filter(p => p.name.toLowerCase() !== me.name.toLowerCase());
  return [me, ...rest];
}

/** Return a new array for rendering with "me" first, others in original order. */
export function sortForRender(players: Player[]): Player[] {
  const me = myPlayer();
  const rest = players.filter(p => p.name.toLowerCase() !== me.name.toLowerCase());
  return [me, ...rest];
}

// Math / generic helpers

/** Fisher–Yates shuffle (pure; returns a new array). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Given the current mode, return the required player count (2 or 4). */
export function currentMax(mode: Mode): 2 | 4 {
  return mode === "2" ? 2 : 4;
}

// DOM helper

/** Get an element by id with a strong type, or throw if missing. */
export function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el as T;
}
