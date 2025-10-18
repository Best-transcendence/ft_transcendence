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
function renderMatchmakerPreview() {
  const host = byId<HTMLDivElement>("matchgenerator");
  host.innerHTML = "";

  const max = currentMax();

  // --- PARTICIPANTS BOX (always visible) ---
  const participantsCard = document.createElement("div");
  participantsCard.className =
    "rounded-xl border border-white/10 p-4 mb-3 bg-white/5";
  host.appendChild(participantsCard);

  const participantsTitle = document.createElement("div");
  participantsTitle.className = "text-sm text-gray-300 mb-2";
  participantsTitle.textContent = "Participants";
  participantsCard.appendChild(participantsTitle);

  const participantsList = document.createElement("div");
  participantsList.className = "text-base text-gray-100"; // bigger font
  participantsList.textContent = players.length
    ? players.map((pl) => pl.name).join(", ")
    : "No participants yet.";
  participantsCard.appendChild(participantsList);

  // HINT ON THE NEXT LINE
  const hint = document.createElement("div");
  hint.className = "text-xs text-gray-400 mt-2";
  hint.textContent =
    "You’ll see your matchups once you reach the required players and press Matchmaking!";
  participantsCard.appendChild(hint);

  // If not enough players, stop here.
  if (players.length < max) return;

  // --- MATCHUP PREVIEW (3 boxes side-by-side) ---
  const grid = document.createElement("div");
  grid.className = "grid gap-3 md:grid-cols-3";
  host.appendChild(grid);

  // Helper to make a round card
  const makeRoundCard = (title: string, body: string) => {
    const card = document.createElement("div");
    card.className =
      "rounded-xl border border-white/10 p-4 bg-white/5 flex flex-col";
    const head = document.createElement("div");
    head.className = "text-sm text-gray-300 mb-2";
    head.textContent = title;
    const content = document.createElement("div");
    content.className = "text-sm text-gray-100";
    content.textContent = body;
    card.append(head, content);
    return card;
  };

  if (max === 2) {
    // two players → show three boxes: Round 1, Round 2, Final Round
    const [a, b] = players.slice(0, 2);
    grid.appendChild(makeRoundCard("Round 1", `${a.name} vs ${b.name}`));
    grid.appendChild(makeRoundCard("Round 2", `${a.name} vs ${b.name}`));
    grid.appendChild(makeRoundCard("Final Round", `${a.name} vs ${b.name}`));
  } else {
    // four players → randomize and show semis + unknown final
    if (!plannedPairs) {
      const pool = shuffle(players.slice(0, 4));
      plannedPairs = [
        [pool[0], pool[1]],
        [pool[2], pool[3]],
      ];
    }
    const [s1a, s1b] = plannedPairs[0];
    const [s2a, s2b] = plannedPairs[1];

    grid.appendChild(
      makeRoundCard("Round 1", `${s1a.name} vs ${s1b.name}`)
    );
    grid.appendChild(
      makeRoundCard("Round 2", `${s2a.name} vs ${s2b.name}`)
    );
    grid.appendChild(makeRoundCard("Final Round", `? vs ?`));

    // A small explanatory line under the grid
    const note = document.createElement("div");
    note.className = "text-xs text-gray-400";
    note.textContent =
      "Winners of Round 1 and Round 2 will be selected in the Final!";
    host.appendChild(note);
  }

  // CTA
  const cta = document.createElement("button");
  cta.className =
    "mt-3 px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white";
  cta.textContent = "Let’s start!";
  cta.onclick = () => startTournamentAndGo();
  host.appendChild(cta);
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

