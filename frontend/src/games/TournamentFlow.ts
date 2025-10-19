import {
  Bracket,
  Player,
  Match,
  createTwoPlayerTournament,
  createFourPlayerTournament,
  reportMatchResult,
} from "../tournament/engine";
import { myName, ensureMeFirst } from "../tournament/utils"; // reuse shared helpers

// Space-key overlay control (two-space flow: Space #1 hides overlay, Space #2
// is handled inside the game module via window.beginTournamentRound?())
let onSpaceStartRef: (() => void) | undefined; // kept for parity, not used elsewhere
let spaceHandler: ((e: KeyboardEvent) => void) | null = null;
let inTieBreaker = false;

function detachSpaceHandler() {
  if (spaceHandler) {
    window.removeEventListener("keydown", spaceHandler, true);
    spaceHandler = null;
  }
}

// Capture Space while overlay is visible, prevent the game fallback handler.
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

// Persisted seed (lobby -> tournament)
type SeedPayload = {
  mode: "2" | "4";
  players: Player[];
  pairs: [string, string][] | null;
};

function loadSeed(): SeedPayload | null {
  try {
    const raw = localStorage.getItem("tournamentSeed");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Overlay (mounted inside #gameWindow as TimeUp overlay)
let overlay: HTMLDivElement | null = null;
let nameLeftEl: HTMLDivElement | null = null;
let nameRightEl: HTMLDivElement | null = null;
let roundLabelEl: HTMLDivElement | null = null;
let championEl: HTMLDivElement | null = null;

let currentLeftName = "";
let currentRightName = "";

function mountOverlay() {
  const gameWin = document.getElementById("gameWindow");
  if (!gameWin) return;

  // If an old overlay points to a previous page, drop it
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

  overlay = document.createElement("div");
  overlay.id = "tournament-overlay";
  overlay.className = "absolute inset-0 z-20 hidden";
  overlay.setAttribute("style", "border-radius: inherit; background: inherit;");

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

  nameLeftEl  = overlay.querySelector("#name-left") as HTMLDivElement;
  nameRightEl = overlay.querySelector("#name-right") as HTMLDivElement;
  roundLabelEl = overlay.querySelector("#round-label") as HTMLDivElement;
  championEl   = overlay.querySelector("#champion-banner") as HTMLDivElement;
}

function showOverlay(left: string, right: string, label: string) {
  mountOverlay();
  (window as any).layoutTournamentRound?.();   // reset field now

  if (!overlay || !nameLeftEl || !nameRightEl || !roundLabelEl) return;
  championEl?.classList.add("hidden");

  nameLeftEl.textContent = left;
  nameRightEl.textContent = right;
  roundLabelEl.textContent = label;
  overlay.classList.remove("hidden");

  currentLeftName = left;
  currentRightName = right;
  (window as any).tournamentCurrentPlayers = { left, right, label };
}

function hideOverlay() {
  overlay?.classList.add("hidden");
}

function showChampion(name: string) {
  mountOverlay();
  if (!overlay) return;

  // Rebuild as a "complete" view
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

  const btnNew  = overlay.querySelector("#btn-new-tourney") as HTMLButtonElement;
  const btnBack = overlay.querySelector("#btn-back-arcade") as HTMLButtonElement;

  btnNew?.addEventListener("click", () => {
    teardownTournamentFlow();
    localStorage.removeItem("tournamentSeed");
    window.location.hash = "#lobbytournament";
  });

  btnBack?.addEventListener("click", () => {
    teardownTournamentFlow();
    localStorage.removeItem("tournamentSeed");
    window.location.hash = "#intro";
  });
}

/** Bracket traversal */
let bracket: Bracket | null = null;
let currentMatch: Match | null = null;

function nextMatch(b: Bracket): Match | null {
  const rounds = b.rounds.slice().sort((a, c) => a.round - c.round);
  for (const r of rounds) {
    const ms = r.matches.slice().sort((a, c) => a.index - c.index);
    for (const m of ms) if (!m.winnerId) return m;
  }
  return null;
}

function labelFor2pBo3(gamesPlayed: number): string {
  if (gamesPlayed === 0) return "Round 1";
  if (gamesPlayed === 1) return "Round 2";
  return "Final";
}

function labelFor(m: Match, mode: "2" | "4"): string {
  if (mode === "2") {
    const played = m.winsA + m.winsB;
    return labelFor2pBo3(played);
  }
  if (m.round === 1) return m.index === 0 ? "Round 1" : "Round 2";
  if (m.round === 2) return "Final";
  return `Round ${m.round}`;
}


/** Game result ingestion (called by window.reportTournamentGameResult / timeup) */
function acceptGameResult(winnerName: string) {
  if (!bracket || !currentMatch) return;

  const seed = loadSeed()!;
  const m = currentMatch;

  // 2-player: play all 3 rounds, no early stop
  if (seed.mode === "2" && m.bestOf === 3 && m.round === 1) {
    if (winnerName.toLowerCase() === m.playerA.name.toLowerCase()) m.winsA += 1;
    else m.winsB += 1;

    const played = m.winsA + m.winsB;

    if (played < 3) {
      showOverlay(m.playerA.name, m.playerB.name, labelFor2pBo3(played)); // Round 2 / Final
      attachSpaceToStart();
      return;
    }

    // After 3rd game, decide champion
    if (!m.winnerId) m.winnerId = m.winsA > m.winsB ? m.playerA.id : m.playerB.id;
    bracket.championId = m.winnerId;
    const champ = bracket.players.find(p => p.id === bracket!.championId)!.name;
    showChampion(champ);
    return;
  }

  // 4-player: single matches
  const winnerId =
    winnerName.toLowerCase() === m.playerA.name.toLowerCase()
      ? m.playerA.id
      : m.playerB.id;

  reportMatchResult(bracket, m.id, winnerId);

  if (bracket.championId) {
    const champ = bracket.players.find(p => p.id === bracket!.championId)!.name;
    showChampion(champ);
    return;
  }

  const nxt = nextMatch(bracket);
  if (nxt) {
    currentMatch = nxt;
    showOverlay(nxt.playerA.name, nxt.playerB.name, labelFor(nxt, seed.mode)); // Round 2 or Final
    attachSpaceToStart();
  }
}

/** Public API – boot & teardown */
export function bootTournamentFlow({ onSpaceStart }: { onSpaceStart?: () => void } = {}) {
  teardownTournamentFlow();   // start fresh every time
  inTieBreaker = false;

  const seed = loadSeed();
  if (!seed) return;

  const players = ensureMeFirst(seed.players);

  if (seed.mode === "2") {
    bracket = createTwoPlayerTournament(players.slice(0, 2) as [Player, Player]);

    // Defensive reset of BO3 state
    const r1 = bracket.rounds.find(r => r.round === 1);
    if (r1?.matches[0]) {
      const m = r1.matches[0];
      m.winsA = 0;
      m.winsB = 0;
      m.winnerId = undefined;
    }
  } else {
    // 4P — build from pairs if valid, else fallback to first 4 players
    const idsOk = (pairs: [string, string][]) => {
      const map = new Map(players.map(p => [p.id, p]));
      return pairs.every(([a, b]) => map.has(a) && map.has(b));
    };

    if (seed.pairs && seed.pairs.length === 2 && idsOk(seed.pairs)) {
      const map = new Map(players.map(p => [p.id, p]));
      const [pA1, pA2] = seed.pairs[0];
      const [pB1, pB2] = seed.pairs[1];
      const s1: [Player, Player] = [map.get(pA1)!, map.get(pA2)!];
      const s2: [Player, Player] = [map.get(pB1)!, map.get(pB2)!];
      const ordered: [Player, Player, Player, Player] = [s1[0], s1[1], s2[0], s2[1]];
      bracket = createFourPlayerTournament(ordered);
    } else {
      // fallback: deterministic semis from first 4 (you’re first due to ensureMeFirst)
      const p = players.slice(0, 4) as [Player, Player, Player, Player];
      bracket = createFourPlayerTournament(p);
    }
  }

  currentMatch = nextMatch(bracket!);
  if (!currentMatch) {
    const r1 = bracket!.rounds.find(r => r.round === 1);
    currentMatch = r1?.matches?.[0] ?? null;
  }

  if (currentMatch) {
    const startLabel = seed.mode === "2" ? labelFor2pBo3(0) : labelFor(currentMatch, seed.mode);
    showOverlay(currentMatch.playerA.name, currentMatch.playerB.name, startLabel);
    attachSpaceToStart(() => (window as any).beginTournamentRound?.()); // seed the ref
  }

  // Game -> Flow: expose a function for reporting winners by name
  (window as any).reportTournamentGameResult = (winnerName: string) => {
    acceptGameResult(winnerName);
  };

  // Timer -> Flow: time-up hook decides winner or triggers tie-breakers
  (window as any).tournamentTimeUp = (leftScore: number, rightScore: number) => {
    const L = Number(leftScore ?? 0);
    const R = Number(rightScore ?? 0);

    if (L === R) {
      if (!inTieBreaker) {
        inTieBreaker = true;
        showOverlay(currentLeftName, currentRightName, "Tie-breaker");
        attachSpaceToStart();   // Space #1 hides overlay; Space #2 starts round (handled by game)
      } else {
        // still tied in tie-breaker → sudden-death restart (no overlay)
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

export function teardownTournamentFlow() {
  // remove SPACE capture handler
  detachSpaceHandler();

  // remove overlay DOM from previous session
  if (overlay && overlay.isConnected) {
    try { overlay.remove(); } catch {}
  }
  overlay = null;
  nameLeftEl = nameRightEl = roundLabelEl = championEl = null;

  // clear globals/hooks so a new session starts clean
  (window as any).tournamentCurrentPlayers = undefined;
  (window as any).reportTournamentGameResult = undefined;
  (window as any).tournamentTimeUp = undefined;

  // reset flow state
  bracket = null;
  currentMatch = null;
  currentLeftName = currentRightName = "";

  inTieBreaker = false;
}
