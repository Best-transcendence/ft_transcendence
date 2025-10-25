// src/components/popup.ts
import { sendWSMessage } from "../services/ws";

/**
 * Trigger an invite popup when another player invites you.
 * @param inviteData - object containing inviter info { from: { id, name } }
 */
let activeInvitePopup: HTMLElement | null = null;

export function triggerInvitePopup(inviteData: { from: { id: string; name?: string } }) {
  // If a popup is already active, ignore new ones
  if (activeInvitePopup) return;

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/60 z-50 flex items-center justify-center";

  // TODO this it their own id
  const fromName = inviteData.from.name ?? `Player ${inviteData.from.id}`;

  overlay.innerHTML = `
    <div class="bg-slate-900 text-gray-200 p-6 rounded-2xl shadow-lg w-[min(90vw,380px)] text-center animate-fadeIn">
      <h2 class="text-xl font-bold mb-4">🎮 Game Invitation</h2>
      <p class="mb-6">Player <b>${fromName}</b> wants to play with you!</p>
      <div class="flex justify-center gap-4">
        <button id="acceptInvite" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold">Accept</button>
        <button id="declineInvite" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold">Decline</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  activeInvitePopup = overlay;

  const cleanup = () => {
    overlay.remove();
    activeInvitePopup = null;
  };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      sendWSMessage("invite:declined", { from: inviteData.from.id });
      cleanup();
    }
  });

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
  const el = document.getElementById('invite-popup');
  if (el && el.parentElement) {
    el.parentElement.removeChild(el);
  }
}