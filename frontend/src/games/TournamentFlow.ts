import {
  Bracket,
  Player,
  Match,
  createTwoPlayerTournament,
  createFourPlayerTournament,
  reportMatchResult,
} from "../tournament/engine";
import { myName, ensureMeFirst } from "../tournament/utils"; // reuse shared helpers

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
  players: Player[];                  // List of participating players
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

// Current match player names for reference
let currentLeftName = "";
let currentRightName = "";

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
  overlay.innerHTML = `
    <div class="relative h-full w-full flex flex-col items-center justify-start pt-6 px-4 animate-zoomIn">
      <h2 id="round-label" class="text-2xl font-bold text-white"></h2>
      <div class="relative mt-6 w-full h-full flex items-center justify-between px-6">
        <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/20"></div>
        <div class="w-1/2 pr-8 flex flex-col items-start">
          <div class="text-xl font-bold text-violet-400 break-words" id="name-left"></div>
          <div class="mt-2 text-xs text-gray-300">Controls: W • S</div>
        </div>
        <div class="w-1/2 pl-8 flex flex-col items-end">
          <div class="text-xl font-bold text-violet-400 text-right break-words" id="name-right"></div>
          <div class="mt-2 text-xs text-gray-300 text-right">Controls: ↑ • ↓</div>
        </div>
      </div>
      <div id="champion-banner" class="hidden mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-600/10 text-emerald-200 px-4 py-3 text-center text-lg font-semibold"></div>
      <div class="mt-4 flex justify-center">
        <div class="text-gray-400 text-sm">Press <span class="text-white font-semibold">SPACE</span> to start</div>
      </div>
    </div>
  `;
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
 */
function showOverlay(left: string, right: string, label: string) {
  mountOverlay();
  (window as any).layoutTournamentRound?.();   // Reset game field

  if (!overlay || !nameLeftEl || !nameRightEl || !roundLabelEl) return;
  championEl?.classList.add("hidden");  // Hide champion banner for regular matches

  // Update overlay content
  nameLeftEl.textContent = left;
  nameRightEl.textContent = right;
  roundLabelEl.textContent = label;
  overlay.classList.remove("hidden");

  // Store current match information
  currentLeftName = left;
  currentRightName = right;
  (window as any).tournamentCurrentPlayers = { left, right, label };
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
  overlay.innerHTML = `
    <div class="relative h-full w-full flex flex-col items-center justify-center px-6 animate-zoomIn">
      <h2 class="text-3xl font-bold text-white mb-2">Tournament Complete</h2>
      <div class="text-xl text-emerald-300 font-semibold mb-6">Champion: ${name}</div>

      <div class="flex gap-3">
        <button id="btn-new-tourney"
          class="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white
                 border border-violet-400/30 shadow-[0_0_16px_2px_#7037d355]">
          New Tournament
        </button>

        <button id="btn-back-arcade"
          class="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-100
                 border border-white/10">
          Back to Arcade Clash
        </button>
      </div>
    </div>
  `;

  overlay.classList.remove("hidden");

  // Set up completion screen button handlers
  const btnNew  = overlay.querySelector("#btn-new-tourney") as HTMLButtonElement;
  const btnBack = overlay.querySelector("#btn-back-arcade") as HTMLButtonElement;

  // New tournament button - return to tournament lobby
  btnNew?.addEventListener("click", () => {
    teardownTournamentFlow();
    localStorage.removeItem("tournamentSeed");
    window.location.hash = "#lobbytournament";
  });

  // Back to arcade button - return to main menu
  btnBack?.addEventListener("click", () => {
    teardownTournamentFlow();
    localStorage.removeItem("tournamentSeed");
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
  if (gamesPlayed === 0) return "Round 1";
  if (gamesPlayed === 1) return "Round 2";
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
  if (m.round === 1) return m.index === 0 ? "Round 1" : "Round 2";
  if (m.round === 2) return "Final";
  return `Round ${m.round}`;
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
      showOverlay(m.playerA.name, m.playerB.name, labelFor2pBo3(played)); // Round 2 / Final
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
  const winnerId =
    winnerName.toLowerCase() === m.playerA.name.toLowerCase()
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
    showOverlay(nxt.playerA.name, nxt.playerB.name, labelFor(nxt, seed.mode)); // Round 2 or Final
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

  // Create tournament bracket based on mode
  if (seed.mode === "2") {
    bracket = createTwoPlayerTournament(players.slice(0, 2) as [Player, Player]);

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
      }
    } else {
      // Fallback: deterministic semis from first 4 (you're first due to ensureMeFirst)
      const p = players.slice(0, 4) as [Player, Player, Player, Player];
      bracket = createFourPlayerTournament(p);
    }
  }

  // Find and set up first match
  currentMatch = nextMatch(bracket!);
  if (!currentMatch) {
    const r1 = bracket!.rounds.find(r => r.round === 1);
    currentMatch = r1?.matches?.[0] ?? null;
  }

  if (currentMatch) {
    const startLabel = seed.mode === "2" ? labelFor2pBo3(0) : labelFor(currentMatch, seed.mode);
    showOverlay(currentMatch.playerA.name, currentMatch.playerB.name, startLabel);
    attachSpaceToStart(() => (window as any).beginTournamentRound?.()); // Seed the ref
  }

  // Expose game result reporting function to global scope
  (window as any).reportTournamentGameResult = (winnerName: string) => {
    acceptGameResult(winnerName);
  };

  // Timer timeout handler: decides winner or triggers tie-breakers
  (window as any).tournamentTimeUp = (leftScore: number, rightScore: number) => {
    const L = Number(leftScore ?? 0);
    const R = Number(rightScore ?? 0);

    if (L === R) {
      if (!inTieBreaker) {
        inTieBreaker = true;
        showOverlay(currentLeftName, currentRightName, "Tie-breaker");
        attachSpaceToStart();   // Space #1 hides overlay; Space #2 starts round (handled by game)
      } else {
        // Still tied in tie-breaker → sudden-death restart (no overlay)
        (window as any).beginTournamentRound?.();
      }
      return;
    }

    // We have a winner → clear tie-breaker and advance
    inTieBreaker = false;
    const winner = L > R ? currentLeftName : currentRightName;
    acceptGameResult(winner);
  };
}

/**
 * Cleans up tournament flow system and resets all state
 * Removes event handlers, DOM elements, and global references
 */
export function teardownTournamentFlow() {
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

  // Reset tournament flow state
  bracket = null;
  currentMatch = null;
  currentLeftName = currentRightName = "";

  inTieBreaker = false;
}
