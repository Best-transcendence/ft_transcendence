import { t } from "../../services/lang/LangEngine";

const EMOJIS = ["⚡","🚀","🐉","🦊","🐱","🐼","🐧","🐸","🦄","👾","⭐","🌟","🍀"];

function safeEmojiForId(idStr: string) {
  const n = Number(idStr);
  const idx = Number.isFinite(n) ? n % EMOJIS.length : 0;
  return EMOJIS[Math.abs(idx)];
}

function escapeHTML(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderPlayerCard(
  id: string,
  name: string,
  role: "p1" | "p2",
  isYou = false
) {
  const displayId = String(id ?? "");
  const rawName = typeof name === "string" ? name : "";
  const displayName = rawName.trim() || `Player ${displayId}`;
  const emoji = safeEmojiForId(displayId);
  const controlsLabel = t("controlsLabel") ?? "Controls";
  const youLabel = t("you") ?? "You";

  const controls =
    role === "p1"
      ? "<kbd class='px-1 py-0.5 bg-slate-700 rounded'>W</kbd> / <kbd class='px-1 py-0.5 bg-slate-700 rounded'>S</kbd>"
      : "<kbd class='px-1 py-0.5 bg-slate-700 rounded'>↑</kbd> / <kbd class='px-1 py-0.5 bg-slate-700 rounded'>↓</kbd>";

  return `
    <div id="player-${role}"
         class="player-card bg-slate-900/90 rounded-lg shadow-[0_0_30px_10px_#7037d3]
                p-4 flex items-center gap-3 ${isYou ? "ring-2 ring-purple-500" : ""}">
      <div class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-lg">
        ${emoji}
      </div>
      <div class="flex flex-col leading-tight">
        <span class="text-gray-200 font-medium">${escapeHTML(displayName)}</span>
        ${isYou ? `<span class="text-green-400 text-xs">${escapeHTML(youLabel)}</span>` : ""}
        <span class="text-xs text-gray-400 mt-1">${escapeHTML(controlsLabel)}: ${controls}</span>
      </div>
    </div>
  `;
}

