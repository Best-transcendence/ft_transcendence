import { onMessage } from "../services/ws";

export function LobbyPage() {
  setTimeout(() => {
    const usersList = document.getElementById("users-list");

    onMessage((msg) => {
      if (msg.type === "user:list" && usersList) {
        usersList.innerHTML = msg.users
          .map((u: any) => `<li>${u.name}</li>`)
          .join("");
      }
    });
  }, 0);

  return `
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-4">Lobby</h1>
      <ul id="users-list" class="space-y-2 text-lg"></ul>
    </div>
  `;
}
