import { sendWSMessage } from "../services/ws";

export function triggerInvitePopup(inviteData: { from: any }) {
  const popup = document.createElement("div");
  popup.className = `
    fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50
  `;

  popup.innerHTML = `
    <div class="bg-white text-gray-800 p-6 rounded-2xl shadow-lg w-80 text-center">
      <h2 class="text-xl font-bold mb-4">🎮 Game Invitation</h2>
      <p class="mb-6">Player <b>${inviteData.from.name}</b> wants to play with you!</p>
      <div class="flex justify-center gap-4">
        <button id="acceptInvite"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">
          Accept
        </button>
        <button id="declineInvite"
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
          Decline
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  popup.querySelector("#acceptInvite")?.addEventListener("click", () => {
    sendWSMessage("invite:accepted", { from: inviteData.from.id });
    popup.remove();
  });

  popup.querySelector("#declineInvite")?.addEventListener("click", () => {
    sendWSMessage("invite:declined", { from: inviteData.from.id });
    popup.remove();
  });
}
