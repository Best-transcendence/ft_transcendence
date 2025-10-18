// src/games/TournamentFlow.ts
import { thisUser } from "../router";
import {
  Bracket,
  Player,
  Match,
  createTwoPlayerTournament,
  createFourPlayerTournament,
  reportMatchResult,
} from "../tournament/engine";

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
  } catch { return null; }
}

function myName(): string {
  return (thisUser?.name ?? "").trim();
}
function ensureMeFirst(players: Player[]): Player[] {
  const me = myName().toLowerCase();
  const mine = players.find(p => p.name.toLowerCase() === me);
  const rest = players.filter(p => p.name.toLowerCase() !== me);
  return mine ? [mine, ...rest] : players;
}

// ---------- Overlay (mounted INSIDE #gameWindow, same style as TimeUp) ----------
let overlay: HTMLDivElement | null = null;
let nameLeftEl: HTMLDivElement | null = null;
let nameRightEl: HTMLDivElement | null = null;
let roundLabelEl: HTMLDivElement | null = null;
let championEl: HTMLDivElement | null = null;

let currentLeftName = "";
let currentRightName = "";

function mountOverlay() {
  if (overlay) return;

  const gameWin = document.getElementById("gameWindow");
  if (!gameWin) return; // safety

  overlay = document.createElement("div");
  overlay.id = "tournament-overlay";
  overlay.className = "absolute inset-0 z-20 hidden";
  overlay.setAttribute("style", "border-radius: inherit; background: inherit;");

  overlay.innerHTML = `
    <div class="relative h-full w-full flex flex-col items-center justify-start pt-6 px-4 animate-zoomIn">
      <!-- Round label -->
      <h2 id="round-label" class="text-2xl font-bold text-white"></h2>

      <!-- Names + controls row -->
      <div class="relative mt-6 w-full h-full flex items-center justify-between px-6">
        <!-- vertical line in the middle -->
        <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/20"></div>

        <!-- Left plate -->
        <div class="w-1/2 pr-8 flex flex-col items-start">
          <div class="text-xl font-bold text-violet-400 break-words" id="name-left"></div>
          <div class="mt-2 text-xs text-gray-300">Controls: W • A • S • D</div>
        </div>

        <!-- Right plate -->
        <div class="w-1/2 pl-8 flex flex-col items-end">
          <div class="text-xl font-bold text-violet-400 text-right break-words" id="name-right"></div>
          <div class="mt-2 text-xs text-gray-300 text-right">Controls: ↑ • ↓ • ← • →</div>
        </div>
      </div>

      <!-- Champion banner -->
      <div id="champion-banner" class="hidden mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-600/10 text-emerald-200 px-4 py-3 text-center text-lg font-semibold"></div>

      <!-- Foot hint -->
      <div class="mt-4 flex justify-center">
        <div class="text-gray-400 text-sm">Press <span class="text-white font-semibold">SPACE</span> to start</div>
      </div>
    </div>
  `;

  gameWin.appendChild(overlay);

  nameLeftEl = overlay.querySelector("#name-left") as HTMLDivElement;
  nameRightEl = overlay.querySelector("#name-right") as HTMLDivElement;
  roundLabelEl = overlay.querySelector("#round-label") as HTMLDivElement;
  championEl = overlay.querySelector("#champion-banner") as HTMLDivElement;
}

function showOverlay(left: string, right: string, label: string) {
  mountOverlay();
  if (!overlay || !nameLeftEl || !nameRightEl || !roundLabelEl) return;
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
  if (!championEl || !roundLabelEl) return;
  championEl.textContent = `Champion: ${name}`;
  championEl.classList.remove("hidden");
  roundLabelEl.textContent = "Tournament Complete";
  overlay!.classList.remove("hidden");
}

// ---------- Bracket flow ----------
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

// 2P: 3 rounds (always play all 3)
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

function attachSpaceToStart(onSpaceStart?: () => void) {
  function onKey(e: KeyboardEvent) {
    if (e.code === "Space") {
      e.preventDefault();
      hideOverlay();
      onSpaceStart?.();
      window.removeEventListener("keydown", onKey);
    }
  }
  window.addEventListener("keydown", onKey);
}

// Called by the game OR our time-up hook
function acceptGameResult(winnerName: string) {
  if (!bracket || !currentMatch) return;

  const seed = loadSeed()!;
  const m = currentMatch;

  // 2P: play all 3 rounds, no early stop
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

  // 4P: single games
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

// ---------- Boot ----------
export function bootTournamentFlow({ onSpaceStart }: { onSpaceStart?: () => void } = {}) {
  const seed = loadSeed();
  if (!seed) return;

  const players = ensureMeFirst(seed.players);

  if (seed.mode === "2") {
  bracket = createTwoPlayerTournament(players.slice(0, 2) as [Player, Player]);
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
  attachSpaceToStart(onSpaceStart);
}

  // Game -> Flow: report a winner name
  (window as any).reportTournamentGameResult = (winnerName: string) => {
    acceptGameResult(winnerName);
  };

  // Game -> Flow: “time’s up” with scores; we pick the winner and advance
  (window as any).tournamentTimeUp = (leftScore: number, rightScore: number) => {
    if (leftScore === rightScore) {
      // On tie: show tie-breaker overlay and wait for SPACE; game should treat next point as OT
      showOverlay(currentLeftName, currentRightName, "Tie-breaker");
      attachSpaceToStart();
      return;
    }
    const winner = leftScore > rightScore ? currentLeftName : currentRightName;
    acceptGameResult(winner);
  };
}
