import { LoginPage } from "./pages/LoginPage";
import { LobbyPage } from "./pages/LobbyPage";

export function router() {
  const app = document.getElementById("app")!;
  const page = window.location.hash.replace("#", "") || "login";

  switch (page) {
    case "login":
      app.innerHTML = LoginPage();
      attachLoginListeners();
      break;

    case "lobby":
      app.innerHTML = LobbyPage();
      break;

    default:
      app.innerHTML = `<h1 class="text-red-600 text-3xl text-center mt-10">404 Bro Page Not Found </h1>`;

  }
}


/* Example: add listeners after rendering LoginPage */
function attachLoginListeners() {
  const form = document.getElementById("login-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.hash = "lobby"; // navigate to lobby
  });

  const guest = document.getElementById("guest-login");
  guest?.addEventListener("click", () => {
    window.location.hash = "lobby"; // guest also goes to lobby
  });
}