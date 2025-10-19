import { Bracket, Match, Player } from "./engine";

export function render(bracket: Bracket, onWin: (matchId: string, winnerId: string) => void) {
  const roundsEl = document.getElementById("rounds")!;
  roundsEl.innerHTML = "";

  bracket.rounds.forEach((r) => {
    const h2 = document.createElement("h2");
    h2.className = "text-xl font-medium";
    h2.textContent = `Round ${r.round}`;
    roundsEl.appendChild(h2);

    const grid = document.createElement("div");
    grid.className = "grid gap-3 md:grid-cols-2";
    roundsEl.appendChild(grid);

    r.matches.forEach((m) => grid.appendChild(matchCard(m, onWin)));
  });

  const champEl = document.getElementById("champion")!;
  if (bracket.championId) {
    const name = bracket.players.find(p => p.id === bracket.championId)?.name ?? bracket.championId;
    champEl.classList.remove("hidden");
    champEl.textContent = `Champion: ${name}`;
  } else {
    champEl.classList.add("hidden");
    champEl.textContent = "";
  }
}

function matchCard(match: Match, onWin: (matchId: string, winnerId: string) => void) {
  const card = document.createElement("div");
  card.className = "rounded-2xl border p-4 shadow-sm space-y-2";

  const meta = document.createElement("div");
  meta.className = "text-xs text-gray-500";
  const need = Math.floor(match.bestOf / 2) + 1;
  meta.textContent = `Round ${match.round} · Match ${match.index + 1} · Best of ${match.bestOf} (need ${need})`;
  card.appendChild(meta);

  const row = document.createElement("div");
  row.className = "flex items-center justify-between gap-3";
  card.appendChild(row);

  const left = document.createElement("div");
  left.className = "flex flex-col gap-2";
  row.appendChild(left);

  left.appendChild(playerRow(match.playerA, match.winsA, () => onWin(match.id, match.playerA.id), !!match.winnerId));
  left.appendChild(playerRow(match.playerB, match.winsB, () => onWin(match.id, match.playerB.id), !!match.winnerId));

  const status = document.createElement("div");
  status.className = "text-sm";
  status.textContent = match.winnerId
    ? `Winner: ${match.winnerId === match.playerA.id ? match.playerA.name : match.playerB.name}`
    : "Awaiting result…";
  row.appendChild(status);

  return card;
}

function playerRow(p: Player, wins: number, onClick: () => void, disabled: boolean) {
  const wrap = document.createElement("div");
  wrap.className = "flex items-center gap-2";

  const badge = document.createElement("span");
  badge.className = "inline-flex items-center rounded-xl border px-2 py-1 text-sm";
  badge.textContent = p.name;

  const winsEl = document.createElement("span");
  winsEl.className = "text-xs";
  winsEl.textContent = `wins: ${wins}`;

  const btn = document.createElement("button");
  btn.className = "rounded-xl border px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50";
  btn.textContent = "+ win";
  btn.onclick = () => !disabled && onClick();
  if (disabled) btn.disabled = true;

  wrap.append(badge, winsEl, btn);
  return wrap;
}
