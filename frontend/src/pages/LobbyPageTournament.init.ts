import {
  Player,
  Bracket,
  createTwoPlayerTournament,
  createFourPlayerTournament,
  reportMatchResult,
} from "../tournament/engine";

let plannedPairs: [Player, Player][] | null = null; // for 4p preview (randomized semis)

function currentMax(): 2 | 4 {
  return (mode === "2" ? 2 : 4);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Mode = "2" | "4";

let players: Player[] = [];
let guestCount = 1;
let mode: Mode = "2";
let bracket: Bracket | null = null;

function byId<T extends HTMLElement>(id: string) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el as T;
}



function updateCounters() {
  const max = currentMax();
  byId<HTMLSpanElement>("count").textContent = String(players.length);
  byId<HTMLSpanElement>("max").textContent = String(max);

  const startBtn = byId<HTMLButtonElement>("btn-start");
  startBtn.disabled = players.length !== max;

  // disable add buttons if we’re at capacity
  byId<HTMLButtonElement>("btn-add-friend").disabled = players.length >= max;
  byId<HTMLButtonElement>("btn-add-guest").disabled = players.length >= max;
}


function addPlayer(name: string) {
  const max = currentMax();
  if (players.length >= max) return;
  const trimmed = name.trim();
  if (!trimmed) return;
  if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) return;

  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
  players.push({ id, name: trimmed });
  plannedPairs = null; // force redraw for 4p if capacity reached again
  updateCounters();
  renderMatchmakerPreview();
}

function startTournamentAndGo() {
  startTournament();

  // Persist the setup so Tournament.ts can read it
  const payload = {
    mode,
    players,
    pairs: plannedPairs?.map(([a,b]) => [a.id, b.id]) ?? null, // null for 2p
  };
  localStorage.setItem("tournamentSeed", JSON.stringify(payload));

  // Go to the game page
  window.location.hash = "#tournament";
}

// helper: violet "glow chip" for names (and for "?")
function createNameChip(label: string) {
  const chip = document.createElement("span");
  chip.className =
    "inline-flex items-center rounded-lg px-3 py-1 " +
    "font-semibold text-violet-100 " +                      // bold text
    "bg-violet-500/15 border border-violet-400/30 " +      // light purple bg
    "shadow-[0_0_12px_2px_#7037d355]";                      // glow behind
  chip.textContent = label;
  return chip;
}

// Helper: stacked layout for names + VS
function createStackedVsBlock(top: string, bottom: string, highlight = false) {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-col items-center justify-center -mt-2";

  const baseColor = "text-violet-500"; // button purple
  const highlightGlow = highlight
    ? "drop-shadow-[0_0_6px_#9f7aea]"
    : ""; // stronger glow only for Final

  const topName = document.createElement("div");
  topName.textContent = top;
  topName.className = `font-bold text-lg ${baseColor} ${highlightGlow}`;

  const vs = document.createElement("div");
  vs.textContent = "vs";
  vs.className = "text-gray-400 my-1 text-sm";

  const bottomName = document.createElement("div");
  bottomName.textContent = bottom;
  bottomName.className = `font-bold text-lg ${baseColor} ${highlightGlow}`;

  wrap.append(topName, vs, bottomName);
  return wrap;
}

// Round Card Builder
function makeRoundCard(title: string, top: string, bottom: string, highlight = false) {
  const card = document.createElement("div");
  card.className =
    "rounded-2xl border border-violet-400/25 p-4 bg-[#271d35] " +
    "shadow-[0_0_30px_10px_#7037d333] flex flex-col justify-start min-h-[130px]";

  const head = document.createElement("div");
  head.className = "text-base text-gray-200 mb-3 font-semibold";
  head.textContent = title;

  const names = createStackedVsBlock(top, bottom, highlight);
  card.append(head, names);
  return card;
}

function renderMatchmakerPreview() {
  const host = byId<HTMLDivElement>("matchgenerator");
  host.innerHTML = "";

  const max = currentMax();

  // participants boy
  const participantsCard = document.createElement("div");
  participantsCard.className =
    "rounded-2xl border border-violet-400/20 p-4 mb-4 bg-[#271d35] shadow-[0_0_24px_4px_#7037d333]";
  host.appendChild(participantsCard);

  const participantsTitle = document.createElement("div");
  participantsTitle.className = "text-sm text-gray-300 mb-2";
  participantsTitle.textContent = "Participants";
  participantsCard.appendChild(participantsTitle);

  // chips instead of comma list
  const chips = document.createElement("div");
  chips.className = "flex flex-wrap gap-2";
  if (players.length) {
    players.forEach((pl) => {
      const chip = document.createElement("span");
      chip.className =
        "inline-flex items-center rounded-lg px-3 py-1 text-sm " +
        "bg-violet-500/15 text-violet-100 border border-violet-400/20";
      chip.textContent = pl.name;
      chips.appendChild(chip);
    });
  } else {
    const none = document.createElement("div");
    none.className = "text-base text-gray-100";
    none.textContent = "No participants yet.";
    chips.appendChild(none);
  }
  participantsCard.appendChild(chips);

  // hint on its own line
  const hint = document.createElement("div");
  hint.className = "text-xs text-gray-400 mt-3";
  hint.textContent =
    "You’ll see your matchups once you reach the required players and press Matchmaking!";
  participantsCard.appendChild(hint);

  // if not enough players, stop here
  if (players.length < max) return;

  // matchup preview cards
  const grid = document.createElement("div");
  grid.className = "grid gap-4 w-full md:grid-cols-3";
  host.appendChild(grid);

  if (max === 2) {
  const [a, b] = players.slice(0, 2);
  grid.appendChild(makeRoundCard("Round 1", a.name, b.name));
  grid.appendChild(makeRoundCard("Round 2", a.name, b.name));
  grid.appendChild(makeRoundCard("Final Round", a.name, b.name));
} else {
  if (!plannedPairs) {
    const pool = shuffle(players.slice(0, 4));
    plannedPairs = [
      [pool[0], pool[1]],
      [pool[2], pool[3]],
    ];
  }
  const [s1a, s1b] = plannedPairs[0];
  const [s2a, s2b] = plannedPairs[1];

  grid.appendChild(makeRoundCard("Round 1", s1a.name, s1b.name));
  grid.appendChild(makeRoundCard("Round 2", s2a.name, s2b.name));
  grid.appendChild(makeRoundCard("Final Round", "?", "?"));  // glow chips for ?

    // explanatory line under the grid (unchanged text)
    const note = document.createElement("div");
    note.className = "text-xs text-gray-300 mt-1";
    note.textContent = "Winners of Round 1 and Round 2 will be selected in the Final!";
    host.appendChild(note);
  }

  // --- CTA: bottom-right, Tailwind purple ---
  const ctaWrap = document.createElement("div");
  ctaWrap.className = "mt-4 w-full flex justify-end";
  const cta = document.createElement("button");
  cta.className =
    "px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white " +
    "border border-violet-400/30 shadow-[0_0_16px_2px_#7037d355]";
  cta.textContent = "Let’s start 🕹️";
  cta.onclick = () => startTournamentAndGo();
  ctaWrap.appendChild(cta);
  host.appendChild(ctaWrap);
}

function startTournament() {
  const max = currentMax();
  if (players.length !== max) return;

  if (max === 2) {
    const pool = players.slice(0, 2) as [Player, Player];
    bracket = createTwoPlayerTournament(pool);
  } else {
    // Use the plannedPairs order for the semis
    if (!plannedPairs) {
      const pool = shuffle(players.slice(0, 4));
      plannedPairs = [
        [pool[0], pool[1]],
        [pool[2], pool[3]],
      ];
    }
    const p = plannedPairs!;
    // Flatten into the expected ordering [a,b,c,d]
    const ordered: [Player, Player, Player, Player] = [p[0][0], p[0][1], p[1][0], p[1][1]];
    bracket = createFourPlayerTournament(ordered);
  }
}


function resetPageState() {
  players = [];
  guestCount = 1;
  bracket = null;
  plannedPairs = null; // clear any previous draw
  byId<HTMLDivElement>("matchgenerator").innerHTML = "";
  renderMatchmakerPreview(); // show empty state
  updateCounters();
}


function setMode(newMode: "2" | "4") {
  if (mode === newMode) return;
  mode = newMode;
  resetPageState(); // clears players & plannedPairs
}

/** Public initializer — call this after you inject LobbyPageTournament() HTML into the DOM */
export function initLobbyPageTournament() {
  // initial mode (radio defaults)
  mode = (document.getElementById("mode-4") as HTMLInputElement).checked ? "4" : "2";

  // wire controls
  const friendInput = byId<HTMLInputElement>("friend-name");
  const addFriendBtn = byId<HTMLButtonElement>("btn-add-friend");
  const addGuestBtn = byId<HTMLButtonElement>("btn-add-guest");
  const startBtn = byId<HTMLButtonElement>("btn-start");
  const mode2 = byId<HTMLInputElement>("mode-2");
  const mode4 = byId<HTMLInputElement>("mode-4");

  addFriendBtn.onclick = () => {
    addPlayer(friendInput.value);
    friendInput.value = "";
  };

	const guestInput = byId<HTMLInputElement>("guest-name");
	addGuestBtn.onclick = () => {
	addPlayer(guestInput.value);
	guestInput.value = "";
	};


  mode2.onchange = () => { if (mode2.checked) setMode("2"); };
  mode4.onchange = () => { if (mode4.checked) setMode("4"); };

  startBtn.onclick = () => startTournamentAndGo();

  // first render
  resetPageState();
}

