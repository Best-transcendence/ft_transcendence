import { sidebarDisplay } from "../components/SideBar";
import { profileDivDisplay } from "../components/ProfileDiv";
import { LogOutBtnDisplay } from "../components/LogOutBtn";
import { addTheme } from "../components/Theme";
import { QuickGameCard } from "../components/cards/QuickGameCard";
import { ModeCards } from "../components/cards/ModeCards";
import { autoConnect, sendWSMessage } from "../services/ws";

// Adapted function now that data extraction has been centralized
export function GameIntroPage(): string {
  autoConnect(handleWSMessage);

  return `
    ${addTheme()}
    <div class="w-full flex justify-between items-center mb-10">
      ${profileDivDisplay()}
      ${sidebarDisplay()}
      ${LogOutBtnDisplay()}
    </div>

    <h1 class="text-4xl font-heading font-bold mb-4">Arcade Clash</h1>
    <p class="text-lg text-gray-600 max-w-xl text-center mb-10">
      Challenge a friend and prove your skills.
    </p>

    <div class="flex gap-6 flex-wrap justify-center">
      ${QuickGameCard()}
      ${ModeCards()}
    </div>
  `;
}

export function initQuickGameCardLogic() {
  const btn = document.getElementById("quick-start-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    console.log("🔥 Quick Game button clicked — sending matchmaking:join");
    sendWSMessage("matchmaking:join", {});
    window.location.hash = "loading"; // Go to loading page
  });
}

function handleWSMessage(msg: any) {
  switch (msg.type) {
    case "room:start":
      console.log("Match found! Room ID:", msg.roomId);
      localStorage.setItem("roomId", msg.roomId);
      window.location.hash = `remote?room=${encodeURIComponent(msg.roomId)}`;
      break;
    case "matchmaking:searching":
      console.log(" Waiting for opponent…");
      break;
    case "invite:error":
      alert("There are not players in this moment..");
      break;
  }
}
