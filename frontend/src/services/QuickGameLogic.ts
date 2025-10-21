import { sendWSMessage } from "../services/ws";

export function initQuickGameCardLogic() {
  const btn = document.getElementById("quick-start-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    console.log("🔥 Quick Game button clicked — sending matchmaking:join");
    sendWSMessage("matchmaking:join", {});
    window.location.hash = "loading"; // Go to loading page
  });
}
