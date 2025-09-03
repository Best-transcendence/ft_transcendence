import { LoginPage } from "./pages/LoginPage";
import { LobbyPage } from "./pages/LobbyPage";
import { login } from "./services/api";

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

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = (document.querySelector("input[type='text']") as HTMLInputElement).value;
  const password = (document.querySelector("input[type='password']") as HTMLInputElement).value;

  try {
    const user = await login(email, password);
    console.log("Logged in:", user);
    window.location.hash = "lobby"; // navigate to lobby
  } catch (err) {
    alert("Login failed ❌");
  }
});

  const guest = document.getElementById("guest-login");
  guest?.addEventListener("click", () => {
    window.location.hash = "lobby"; // guest also goes to lobby
  });
}