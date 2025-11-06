// pages/LoadingPage.ts
import { sendWSMessage } from "../services/ws";

export function LoadingPage(): string {
  return `
    <div class="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-orange-600 to-red-700 text-white">

      <!-- Title -->
      <h2 class="text-3xl font-heading font-bold mb-6 animate-pulse">
        🔍 Searching for Opponent...
      </h2>

      <!-- Animated bouncing dots -->
      <div class="flex space-x-3 mb-10">
        <span class="w-4 h-4 bg-yellow-300 rounded-full animate-bounce"></span>
        <span class="w-4 h-4 bg-yellow-300 rounded-full animate-bounce" style="animation-delay:0.2s"></span>
        <span class="w-4 h-4 bg-yellow-300 rounded-full animate-bounce" style="animation-delay:0.4s"></span>
      </div>

      <!-- Cancel button -->
      <button id="cancel-btn"
              class="px-6 py-2 rounded-lg font-bold
                     bg-red-600 hover:bg-red-700
                     text-white shadow-lg
                     transition-transform transform hover:scale-105">
        Cancel
      </button>
    </div>
  `;
}

export function initLoadingPage() {
  const cancelBtn = document.getElementById("cancel-btn");
  if (!cancelBtn) return;

  cancelBtn.addEventListener("click", () => {
    console.log("❌ Cancel matchmaking");
    sendWSMessage("matchmaking:leave", {}); // tell backend to remove from queue
    window.location.hash = "intro"; // back to game intro
  });
}