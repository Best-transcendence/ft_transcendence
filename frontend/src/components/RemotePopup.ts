// src/components/popup.ts
import { sendWSMessage } from "../services/ws";
import { t } from "../services/lang/LangEngine";

/**
 * Trigger an invite popup when another player invites you.
 * @param inviteData - object containing inviter info { from: { id, name } }
 */
let activeInvitePopup: HTMLElement | null = null;

export function triggerInvitePopup(inviteData: { from: { id: string; name?: string } }) {
  // If a popup is already active, ignore new ones
  if (activeInvitePopup) return;

  const overlay = document.createElement("div");
  overlay.id = "invite-overlay"; // id for clarity
  overlay.className = "fixed inset-0 bg-black/60 z-50 flex items-center justify-center";

  const fromName = inviteData.from.name ?? `${t("playerLabel")} ${inviteData.from.id}`;

  overlay.innerHTML = `
    <div class="bg-slate-900 text-gray-200 p-6 rounded-2xl shadow-lg w-[min(90vw,380px)] text-center animate-fadeIn">
      <h2 class="text-xl font-bold mb-4">${t("gameInvitationTitle")}</h2>
      <p class="mb-6"><b>${fromName}</b> ${t("gameInvitationText")}</p>
      <div class="flex justify-center gap-4">
        <button id="acceptInvite" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold">${t("accept")}</button>
        <button id="declineInvite" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold">${t("decline")}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  activeInvitePopup = overlay;

  const cleanup = () => {
    overlay.remove();
    activeInvitePopup = null;
  };

  overlay.querySelector("#acceptInvite")?.addEventListener("click", () => {
    sendWSMessage("invite:accepted", { from: inviteData.from.id }); 
    cleanup();
  });

  overlay.querySelector("#declineInvite")?.addEventListener("click", () => {
    sendWSMessage("invite:declined", { from: inviteData.from.id });
    cleanup();
  });
}

export function closeInvitePopup() {
  // Close using the tracked overlay first
  if (activeInvitePopup) {
    activeInvitePopup.remove();
    activeInvitePopup = null;
    return;
  }
  // Fallback by ids if needed
  document.getElementById("invite-popup")?.remove();
  document.getElementById("invite-overlay")?.remove();
}