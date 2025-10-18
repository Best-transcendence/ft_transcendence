import {
  Player,
  Bracket,
  createTwoPlayerTournament,
  createFourPlayerTournament,
  reportMatchResult,
} from "../tournament/engine";

function currentMax(): 2 | 4 {
  return (mode === "2" ? 2 : 4);
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
  if (players.length >= max) return; // hard cap

  const trimmed = name.trim();
  if (!trimmed) return;

  // optional: prevent duplicates by name
  if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) return;

  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
  players.push({ id, name: trimmed });
  updateCounters();
  renderWaitingList();
}

function renderWaitingList() {
  const host = byId<HTMLDivElement>("matchgenerator");
  if (bracket) return; // once tournament started, don't show waiting list here
  host.innerHTML = "";
  const p = document.createElement("div");
  p.className = "text-gray-300 text-sm";
  p.textContent = players.length
    ? `Participants: ${players.map(pl => pl.name).join(", ")}`
    : "No participants yet.";
  host.appendChild(p);
}

function startTournament() {
  const max = currentMax();
  if (players.length !== max) return; // don’t start early or overfilled

  const pool = players.slice(0, max) as any;
  bracket = (max === 2)
    ? createTwoPlayerTournament(pool as [Player, Player])
    : createFourPlayerTournament(pool as [Player, Player, Player, Player]);

  renderBracket();
  updateCounters(); // re-check buttons after bracket appears
}

function renderBracket() {
  if (!bracket) return;
  const host = byId<HTMLDivElement>("matchgenerator");
  host.innerHTML = "";

  // champion banner
  if (bracket.championId) {
    const champ = bracket.players.find(p => p.id === bracket!.championId)?.name ?? "Unknown";
    const banner = document.createElement("div");
    banner.className = "rounded-xl border border-emerald-300/30 bg-emerald-600/10 text-emerald-200 px-3 py-2 mb-3";
    banner.textContent = `Champion: ${champ}`;
    host.appendChild(banner);
  }

  bracket.rounds.forEach((r) => {
    const title = document.createElement("div");
    title.className = "text-sm text-gray-300 mt-2 mb-1";
    title.textContent = `Round ${r.round}`;
    host.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "grid gap-2 md:grid-cols-2";
    host.appendChild(grid);

    r.matches.forEach((m) => {
      const card = document.createElement("div");
      card.className = "rounded-xl border border-white/10 p-3 space-y-2";

      const meta = document.createElement("div");
      meta.className = "text-xs text-gray-400";
      const need = Math.floor(m.bestOf / 2) + 1;
      meta.textContent = `Match ${m.index + 1} · Bo${m.bestOf} (need ${need})`;
      card.appendChild(meta);

      const row = (label: string, wins: number, winnerId: string) => {
        const wrap = document.createElement("div");
        wrap.className = "flex items-center gap-2";

        const badge = document.createElement("span");
        badge.className = "inline-flex items-center rounded-lg border border-white/10 px-2 py-1 text-sm text-gray-100";
        badge.textContent = label;

        const winsEl = document.createElement("span");
        winsEl.className = "text-xs text-gray-400";
        winsEl.textContent = `wins: ${wins}`;

        const btn = document.createElement("button");
        btn.className = "px-2 py-1 rounded-lg border border-white/10 hover:border-violet-400 text-xs text-gray-200 disabled:opacity-40";
        btn.textContent = "+ win";
        btn.disabled = Boolean(m.winnerId);
        btn.onclick = () => {
          if (!bracket) return;
          reportMatchResult(bracket, m.id, winnerId);
          renderBracket();
        };

        wrap.append(badge, winsEl, btn);
        return wrap;
      };

      card.appendChild(row(m.playerA.name, m.winsA, m.playerA.id));
      card.appendChild(row(m.playerB.name, m.winsB, m.playerB.id));

      const status = document.createElement("div");
      status.className = "text-xs text-gray-300";
      status.textContent = m.winnerId
        ? `Winner: ${m.winnerId === m.playerA.id ? m.playerA.name : m.playerB.name}`
        : "Awaiting result…";
      card.appendChild(status);

      grid.appendChild(card);
    });
  });
}

function resetPageState() {
  players = [];
  guestCount = 1;
  bracket = null;
  byId<HTMLDivElement>("matchgenerator").innerHTML = ""; // clear right panel
  renderWaitingList();
  updateCounters();
}

function setMode(newMode: "2" | "4") {
  if (mode === newMode) return;
  mode = newMode;
  resetPageState(); // <— removes ALL added players as requested
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

  startBtn.onclick = () => startTournament();

  // first render
  resetPageState();
}

