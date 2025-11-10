import {
  Bracket,
  Player,
  Match,
  createTwoPlayerTournament,
  createFourPlayerTournament,
  reportMatchResult,
} from "../tournament/TournamentEngine";
import { myName, ensureMeFirst } from "../tournament/utils"; // reuse shared helpers
import { resetTimer } from "../components/Timer";
import { difficulty, resetDifficulty, getDisplayName } from "../tournament/InitTournamentLobby";
import { t } from "../services/lang/LangEngine";
import DOMPurify from "dompurify";

/**
 * Tournament Flow Controller
 *
 * This module manages the complete tournament flow including:
 * - Tournament bracket creation and management
 * - Match progression and result handling
 * - Overlay UI for match setup and results
 * - Space key handling for game transitions
 * - Tie-breaker logic for tied matches
 * - Champion declaration and tournament completion
 */

// Space-key overlay control (two-space flow: Space #1 hides overlay, Space #2
// is handled inside the game module via window.beginTournamentRound?())
let onSpaceStartRef: (() => void) | undefined; // kept for parity, not used elsewhere
let spaceHandler: ((e: KeyboardEvent) => void) | null = null;  // Space key event handler
let inTieBreaker = false;  // Flag to track if we're in a tie-breaker round

/**
 * Removes the space key event handler to prevent duplicate listeners
 * Called when transitioning between tournament states
 */
function detachSpaceHandler() {
  if (spaceHandler) {
    window.removeEventListener("keydown", spaceHandler, true);
    spaceHandler = null;
  }
}

/**
 * Attaches space key handler to capture space presses while overlay is visible
 * Implements two-space flow: Space #1 hides overlay, Space #2 starts the game
 * @param onSpaceStart - Optional callback for space start (stored but not used)
 */
function attachSpaceToStart(onSpaceStart?: () => void) {
  if (onSpaceStart) onSpaceStartRef = onSpaceStart; // stored for parity, not invoked here

  detachSpaceHandler();
  spaceHandler = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault();
      e.stopPropagation();
      hideOverlay();     // Space #1 closes overlay
      detachSpaceHandler();
    }
  };
  window.addEventListener("keydown", spaceHandler, { capture: true });
}

/**
 * Tournament seed data structure persisted from lobby to tournament
 * Contains tournament configuration and player information
 */
type SeedPayload = {
  mode: "2" | "4";                    // Tournament mode: 2-player or 4-player
  difficulty?: "easy" | "medium" | "hard"; // Tournament difficulty level
  players: Player[];                  // List of participating players (with auth data)
  pairs: [string, string][] | null;   // Player pairings for 4-player tournaments
};

/**
 * Loads tournament seed data from localStorage
 * @returns {SeedPayload | null} Tournament configuration or null if not found/invalid
 */
function loadSeed(): SeedPayload | null {
  try {
    const raw = localStorage.getItem("tournamentSeed");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Overlay DOM elements (mounted inside #gameWindow as tournament overlay)
let overlay: HTMLDivElement | null = null;           // Main overlay container
let nameLeftEl: HTMLDivElement | null = null;        // Left player name display
let nameRightEl: HTMLDivElement | null = null;       // Right player name display
let roundLabelEl: HTMLDivElement | null = null;     // Round label (e.g., "Round 1", "Final")
let championEl: HTMLDivElement | null = null;       // Champion banner element

// Current match player names and objects for reference
let currentLeftName = "";
let currentRightName = "";
let currentLeftPlayer: Player | undefined;
let currentRightPlayer: Player | undefined;

/**
 * Creates and mounts the tournament overlay UI
 * Handles cleanup of existing overlays and creates new match display interface
 */
function mountOverlay() {
  const gameWin = document.getElementById("gameWindow");
  if (!gameWin) return;

  // Clean up any existing overlay from previous sessions
  if (overlay) {
    const wrongParent = overlay.parentElement !== gameWin;
    const detached = !overlay.isConnected;
    if (wrongParent || detached) {
      try { overlay.remove(); } catch {}
      overlay = null;
      nameLeftEl = nameRightEl = roundLabelEl = championEl = null;
    }
  }
  if (overlay) return;

  // Create new overlay element
  overlay = document.createElement("div");
  overlay.id = "tournament-overlay";
  overlay.className = "absolute inset-0 z-20 hidden";
  overlay.setAttribute("style", "border-radius: inherit; background: inherit;");

  // Overlay HTML template with match information and controls
  overlay.innerHTML = DOMPurify.sanitize(`
    <div class="relative h-full w-full flex flex-col items-center justify-start pt-6 px-4 animate-zoomIn">
      <h2 id="round-label" class="text-2xl font-bold text-white"></h2>
      <div class="relative mt-6 w-full h-full flex items-center justify-between px-6">
        <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/20"></div>
        <div class="w-1/2 pr-8 flex flex-col items-start">
          <div class="text-xl font-bold text-violet-400 break-words" id="name-left"></div>
          <div class="mt-2 text-xs text-gray-300">${t("controlsLetter")}</div>
        </div>
        <div class="w-1/2 pl-8 flex flex-col items-end">
          <div class="text-xl font-bold text-violet-400 text-right break-words" id="name-right"></div>
          <div class="mt-2 text-xs text-gray-300 text-right">${t("controlsArrow")}</div>
        </div>
      </div>
      <div id="champion-banner" class="hidden mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-600/10 text-emerald-200 px-4 py-3 text-center text-lg font-semibold"></div>
      <div class="mt-4 flex justify-center">
        <div class="text-gray-400 text-sm">${t("pressSpace")}</div>
      </div>
    </div>
  `);
  gameWin.appendChild(overlay);

  // Cache DOM element references for efficient updates
  nameLeftEl  = overlay.querySelector("#name-left") as HTMLDivElement;
  nameRightEl = overlay.querySelector("#name-right") as HTMLDivElement;
  roundLabelEl = overlay.querySelector("#round-label") as HTMLDivElement;
  championEl   = overlay.querySelector("#champion-banner") as HTMLDivElement;
}

/**
 * Displays the tournament overlay with match information
 * @param left - Left player name
 * @param right - Right player name
 * @param label - Round label (e.g., "Round 1", "Final")
 * @param leftPlayer - Full left Player object (optional)
 * @param rightPlayer - Full right Player object (optional)
 */
function showOverlay(left: string, right: string, label: string, leftPlayer?: Player, rightPlayer?: Player) {
  mountOverlay();
  (window as any).layoutTournamentRound?.();   // Reset game field

  if (!overlay || !nameLeftEl || !nameRightEl || !roundLabelEl) return;
  championEl?.classList.add("hidden");  // Hide champion banner for regular matches

  // Update overlay content with display names (including "(G)" for guests)
  nameLeftEl.textContent = leftPlayer ? getDisplayName(leftPlayer) : left;
  nameRightEl.textContent = rightPlayer ? getDisplayName(rightPlayer) : right;
  roundLabelEl.textContent = label;
  overlay.classList.remove("hidden");

  // Store current match information
  currentLeftName = leftPlayer ? getDisplayName(leftPlayer) : left;
  currentRightName = rightPlayer ? getDisplayName(rightPlayer) : right;
  currentLeftPlayer = leftPlayer;
  currentRightPlayer = rightPlayer;
  (window as any).tournamentCurrentPlayers = {
    left,
    right,
    label,
    leftPlayer,   // Full Player object
    rightPlayer   // Full Player object
  };
}

/**
 * Hides the tournament overlay
 */
function hideOverlay() {
  overlay?.classList.add("hidden");
}

/**
 * Displays the tournament completion screen with champion announcement
 * @param name - Champion player name
 */
function showChampion(name: string) {
  mountOverlay();
  if (!overlay) return;

  // Rebuild overlay as tournament completion view
  overlay.innerHTML = DOMPurify.sanitize(`
    <div class="relative h-full w-full flex flex-col items-center justify-center px-6 animate-zoomIn">
      <h2 class="text-3xl font-bold text-white mb-2">${t("tournamentComplete")}</h2>
      <div class="text-xl text-emerald-300 font-semibold mb-6">${t("champion")}: ${name}</div>

      <div class="flex gap-3">
        <button id="btn-new-tourney"
          class="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white
                 border border-violet-400/30 shadow-[0_0_16px_2px_#7037d355]">
          ${t("newTournament")}
        </button>

        <button id="btn-back-arcade"
          class="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-100
                 border border-white/10">
          ${t("backToArcade")}
        </button>
      </div>
    </div>
  `);

  overlay.classList.remove("hidden");

  // Set up completion screen button handlers
  const btnNew  = overlay.querySelector("#btn-new-tourney") as HTMLButtonElement;
  const btnBack = overlay.querySelector("#btn-back-arcade") as HTMLButtonElement;

  // New tournament button - return to tournament lobby
  btnNew?.addEventListener("click", () => {
    teardownTournamentFlow();
    localStorage.removeItem("tournamentSeed");
    resetDifficulty(); // Reset difficulty to medium
    window.location.hash = "#lobbytournament";
  });

  // Back to arcade button - return to main menu
  btnBack?.addEventListener("click", () => {
    teardownTournamentFlow();
    localStorage.removeItem("tournamentSeed");
    resetDifficulty(); // Reset difficulty to medium
    window.location.hash = "#intro";
  });
}

/** Tournament bracket and match state */
let bracket: Bracket | null = null;        // Current tournament bracket
let currentMatch: Match | null = null;      // Currently active match

/**
 * Finds the next unplayed match in the tournament bracket
 * @param b - Tournament bracket to search
 * @returns {Match | null} Next match to play or null if tournament complete
 */
function nextMatch(b: Bracket): Match | null {
  const rounds = b.rounds.slice().sort((a, c) => a.round - c.round);
  for (const r of rounds) {
    const ms = r.matches.slice().sort((a, c) => a.index - c.index);
    for (const m of ms) if (!m.winnerId) return m;
  }
  return null;
}

/**
 * Generates round labels for 2-player best-of-3 matches
 * @param gamesPlayed - Number of games completed in the match
 * @returns {string} Round label
 */
function labelFor2pBo3(gamesPlayed: number): string {
  if (gamesPlayed === 0) return `${t("round")} 1`;
  if (gamesPlayed === 1) return `${t("round")} 2`;
  return "Final";
}

/**
 * Generates appropriate round label for a match
 * @param m - Match object
 * @param mode - Tournament mode ("2" or "4")
 * @returns {string} Round label
 */
function labelFor(m: Match, mode: "2" | "4"): string {
  if (mode === "2") {
    const played = m.winsA + m.winsB;
    return labelFor2pBo3(played);
  }
  if (m.round === 1) return m.index === 0 ? `${t("round")} 1` : `${t("round")} 2`;
  if (m.round === 2) return `${t("final")}`;
  return `${t("round")} ${m.round}`;
}


/**
 * Processes game results and advances tournament state using player ID
 * This is the preferred method that avoids name matching issues
 * @param winnerId - ID of the winning player
 * @param winnerName - Name of the winning player (for 2-player tournaments)
 */
function acceptGameResultWithPlayer(winnerId: string, winnerName: string) {
  if (!bracket || !currentMatch) return;

  const seed = loadSeed()!;
  const m = currentMatch;

  // 2-player tournament: best-of-3 format, play all 3 rounds
  if (seed.mode === "2" && m.bestOf === 3 && m.round === 1) {
    if (winnerId === m.playerA.id) m.winsA += 1;
    else if (winnerId === m.playerB.id) m.winsB += 1;

    const played = m.winsA + m.winsB;

    // Continue to next round if not all 3 games played
    if (played < 3) {
      showOverlay(m.playerA.name, m.playerB.name, labelFor2pBo3(played), m.playerA, m.playerB); // Round 2 / Final
      attachSpaceToStart();
      return;
    }

    // After 3rd game, determine champion
    if (!m.winnerId) m.winnerId = m.winsA > m.winsB ? m.playerA.id : m.playerB.id;
    bracket.championId = m.winnerId;
    const champ = bracket.players.find(p => p.id === bracket!.championId)!.name;

    showChampion(champ);
    return;
  }

  // 4-player tournament: single elimination matches
  reportMatchResult(bracket, m.id, winnerId);

  // Check if tournament is complete
  if (bracket.championId) {
    const champ = bracket.players.find(p => p.id === bracket!.championId)!.name;
    showChampion(champ);
    return;
  }

  // Advance to next match
  const nxt = nextMatch(bracket);
  if (nxt) {
    currentMatch = nxt;
    (window as any).tournamentCurrentMatch = currentMatch; // Update global reference
    console.log("Updated tournamentCurrentMatch:", currentMatch);
    showOverlay(nxt.playerA.name, nxt.playerB.name, labelFor(nxt, seed.mode), nxt.playerA, nxt.playerB); // Round 2 or Final
    attachSpaceToStart();
  }
}

/**
 * Processes game results and advances tournament state
 * Called by window.reportTournamentGameResult or timeup events
 * @param winnerName - Name of the winning player
 */
function acceptGameResult(winnerName: string) {
  if (!bracket || !currentMatch) return;

  const seed = loadSeed()!;
  const m = currentMatch;

  // 2-player tournament: best-of-3 format, play all 3 rounds
  if (seed.mode === "2" && m.bestOf === 3 && m.round === 1) {
    if (winnerName.toLowerCase() === m.playerA.name.toLowerCase()) m.winsA += 1;
    else m.winsB += 1;

    const played = m.winsA + m.winsB;

    // Continue to next round if not all 3 games played
    if (played < 3) {
      showOverlay(m.playerA.name, m.playerB.name, labelFor2pBo3(played), m.playerA, m.playerB); // Round 2 / Final
      attachSpaceToStart();
      return;
    }

    // After 3rd game, determine champion
    if (!m.winnerId) m.winnerId = m.winsA > m.winsB ? m.playerA.id : m.playerB.id;
    bracket.championId = m.winnerId;
    const champ = bracket.players.find(p => p.id === bracket!.championId)!.name;

    showChampion(champ);
    return;
  }

  // 4-player tournament: single elimination matches
  // Strip "(G)" suffix from winnerName for comparison if present
  const normalizedWinnerName = winnerName.replace(/\s*\(G\)\s*$/, "");
  const winnerId =
    normalizedWinnerName.toLowerCase() === m.playerA.name.toLowerCase()
      ? m.playerA.id
      : m.playerB.id;

  reportMatchResult(bracket, m.id, winnerId);

  // Check if tournament is complete
  if (bracket.championId) {
    const champ = bracket.players.find(p => p.id === bracket!.championId)!.name;
    showChampion(champ);
    return;
  }

  // Advance to next match
  const nxt = nextMatch(bracket);
  if (nxt) {
    currentMatch = nxt;
    (window as any).tournamentCurrentMatch = currentMatch; // Update global reference
    console.log("Updated tournamentCurrentMatch:", currentMatch);
    showOverlay(nxt.playerA.name, nxt.playerB.name, labelFor(nxt, seed.mode), nxt.playerA, nxt.playerB); // Round 2 or Final
    attachSpaceToStart();
  }
}

/**
 * Initializes the tournament flow system
 * Creates tournament bracket, sets up event handlers, and displays first match
 * @param onSpaceStart - Optional callback for space start events
 */
export function bootTournamentFlow({ onSpaceStart }: { onSpaceStart?: () => void } = {}) {
  teardownTournamentFlow();   // Start fresh every time
  inTieBreaker = false;

  const seed = loadSeed();
  if (!seed) return;

  const players = ensureMeFirst(seed.players);

  // Use difficulty from saved seed (set when tournament was created)
  const currentDifficulty: "easy" | "medium" | "hard" = seed.difficulty || "medium";

  console.log("🔍 DIFFICULTY DEBUG - Seed data:");
  console.log("  Saved difficulty:", seed.difficulty);
  console.log("🎯 SELECTED DIFFICULTY:", currentDifficulty);

  // Create tournament bracket based on mode
  if (seed.mode === "2") {
    bracket = createTwoPlayerTournament(players.slice(0, 2) as [Player, Player]);
    bracket.difficulty = currentDifficulty;

    // Defensive reset of BO3 state
    const r1 = bracket.rounds.find(r => r.round === 1);
    if (r1?.matches[0]) {
      const m = r1.matches[0];
      m.winsA = 0;
      m.winsB = 0;
      delete m.winnerId;
    }
  } else {
    // 4-player tournament: build from pairs if valid, else fallback to first 4 players
    const idsOk = (pairs: [string, string][]) => {
      const map = new Map(players.map(p => [p.id, p]));
      return pairs.every(([a, b]) => map.has(a) && map.has(b));
    };

    if (seed.pairs && seed.pairs.length === 2 && idsOk(seed.pairs)) {
      const map = new Map(players.map(p => [p.id, p]));
      const pair1 = seed.pairs[0];
      const pair2 = seed.pairs[1];
      if (pair1 && pair2) {
        const [pA1, pA2] = pair1;
        const [pB1, pB2] = pair2;
        const s1: [Player, Player] = [map.get(pA1)!, map.get(pA2)!];
        const s2: [Player, Player] = [map.get(pB1)!, map.get(pB2)!];
        const ordered: [Player, Player, Player, Player] = [s1[0], s1[1], s2[0], s2[1]];
        bracket = createFourPlayerTournament(ordered);
        bracket.difficulty = currentDifficulty;
      }
    } else {
      // Fallback: deterministic semis from first 4 (you're first due to ensureMeFirst)
      const p = players.slice(0, 4) as [Player, Player, Player, Player];
      bracket = createFourPlayerTournament(p);
      bracket.difficulty = currentDifficulty;
    }
  }

  // Find and set up first match
  currentMatch = nextMatch(bracket!);
  if (!currentMatch) {
    const r1 = bracket!.rounds.find(r => r.round === 1);
    currentMatch = r1?.matches?.[0] ?? null;
  }

  // Show first match overlay
  if (currentMatch) {
    const startLabel = seed.mode === "2" ? labelFor2pBo3(0) : labelFor(currentMatch, seed.mode);
    showOverlay(currentMatch.playerA.name, currentMatch.playerB.name, startLabel, currentMatch.playerA, currentMatch.playerB);
    attachSpaceToStart(() => (window as any).beginTournamentRound?.()); // Seed the ref
  }

  // Expose game result reporting function and difficulty to global scope
  (window as any).reportTournamentGameResult = (winnerName: string) => {
    acceptGameResult(winnerName);
  };

  // Expose current match for match saving logic
  (window as any).tournamentCurrentMatch = currentMatch;
  console.log("Set tournamentCurrentMatch:", currentMatch);

  // Expose tournament difficulty for game to access
  const tournamentDifficulty = bracket?.difficulty || "medium";
  (window as any).tournamentDifficulty = tournamentDifficulty;

  // Initialize timer display with correct difficulty time
  const difficultyTimes = { easy: 8, medium: 30, hard: 20 }; // TODO (Yulia): Change easy back to 40 seconds
  const gameTime = difficultyTimes[tournamentDifficulty];
  resetTimer(gameTime);

  // Timer timeout handler: decides winner or triggers tie-breakers
  (window as any).tournamentTimeUp = (leftScore: number, rightScore: number) => {
    const L = Number(leftScore ?? 0);
    const R = Number(rightScore ?? 0);

    if (L === R) {
      if (!inTieBreaker) {
        inTieBreaker = true;
        showOverlay(currentLeftName, currentRightName, `${t("tieBreaker")}`, currentLeftPlayer, currentRightPlayer);
        attachSpaceToStart();   // Space #1 hides overlay; Space #2 starts round (handled by game)
      } else {
        // Still tied in tie-breaker → sudden-death restart (no overlay)
        (window as any).beginTournamentRound?.();
      }
      return;
    }

    // We have a winner → clear tie-breaker and advance
    inTieBreaker = false;
    // Use currentMatch.playerA/playerB directly as the source of truth
    // This ensures correct winner determination even if currentLeftPlayer/currentRightPlayer are misaligned
    if (!currentMatch) {
      console.error("tournamentTimeUp: No currentMatch available");
      return;
    }

    // Determine winner based on scores: L > R means left player (playerA) wins, else right player (playerB) wins
    // Since showOverlay maps playerA to left and playerB to right, we can use currentMatch directly
    const winnerId = L > R ? currentMatch.playerA.id : currentMatch.playerB.id;
    const winnerName = L > R ? currentMatch.playerA.name : currentMatch.playerB.name;

    acceptGameResultWithPlayer(winnerId, winnerName);
  };
}

/**
 * Cleans up tournament flow system and resets all state
 * Removes event handlers, DOM elements, and global references
 */
export function teardownTournamentFlow() {
  // Reset difficulty to medium when leaving tournament
  resetDifficulty();

  // Stop the game loop
  if (typeof (window as any).stopTournamentGame === 'function') {
    (window as any).stopTournamentGame();
  }

  // Remove space key capture handler
  detachSpaceHandler();

  // Remove overlay DOM from previous session
  if (overlay && overlay.isConnected) {
    try { overlay.remove(); } catch {}
  }
  overlay = null;
  nameLeftEl = nameRightEl = roundLabelEl = championEl = null;

  // Clear global hooks so a new session starts clean
  (window as any).tournamentCurrentPlayers = undefined;
  (window as any).reportTournamentGameResult = undefined;
  (window as any).tournamentTimeUp = undefined;
  (window as any).stopTournamentGame = undefined;
  (window as any).tournamentDifficulty = undefined;

  // Reset tournament flow state
  bracket = null;
  currentMatch = null;
  currentLeftName = currentRightName = "";
  currentLeftPlayer = currentRightPlayer = undefined;

  inTieBreaker = false;
}
