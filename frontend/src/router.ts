import { LoginPage } from "./pages/LoginPage";
import { LobbyPage } from "./pages/LobbyPage";
import { login, signup } from "./services/api";
import { GameIntroPage } from "./pages/GameIntroPage";
import { GamePong2D } from "./games/Pong2d";
import { initGame } from "./games/InitGame";
//_______ Info
/*
The router will set up the routing sistem for the SAP
with the # for now just to see if everything works.

*/
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

    case "intro":
      GameIntroPage().then((html) => {
        app.innerHTML = html;

        // attach logout listener
        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn?.addEventListener("click", () => {
          localStorage.removeItem("jwt");
          window.location.hash = "login";
        });
      });
      break;

    case "game":
      app.innerHTML = GamePong2D();
      initGame();
      break;

    default:
      app.innerHTML = `<h1 class="text-red-600 text-3xl text-center mt-10">404 Bro Page Not Found </h1>`;
  }
}

/* Example: add listeners after rendering LoginPage */
function attachLoginListeners() {
  const form = document.getElementById("login-form");
  let isSignupMode = false;

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = (
      document.querySelector("input[type='email']") as HTMLInputElement
    ).value.trim();
    const password = (
      document.querySelector("input[type='password']") as HTMLInputElement
    ).value;
    const name = (
      document.getElementById("name-field") as HTMLInputElement
    )?.value?.trim();
    const confirmPassword = (
      document.getElementById("confirm-password-field") as HTMLInputElement
    )?.value;

    try {
      let user;

      if (isSignupMode) {
        // Handle signup
        if (!name || !confirmPassword) {
          alert("❌ All fields are required for signup");
          return;
        }

        if (password !== confirmPassword) {
          alert("❌ Passwords do not match");
          return;
        }

        user = await signup(name, email, password, confirmPassword);
        console.log("Signed up:", user);
        alert("✅ Account created successfully! You can now log in.");

        // Switch back to login mode after successful signup
        signupToggle?.click();
      } else {
        // Handle login
        user = await login(email, password);
        // TODO: make sure not to expose token to the console.log. Now we are exposing it.
        console.log("Logged in:", user);
        window.location.hash = "GameIntroPage"; // navigate to lobby
      }
    } catch (err: unknown) {
      // We are checking if DB is up
      if (
        typeof err === "object" &&
        err &&
        "message" in err &&
        typeof err.message === "string"
      ) {
        if (err.message.includes("fetch")) {
          alert("❌ Cannot connect to server. Is the backend running?");
        } else {
          // DB is up but wrong credentials or signup error
          const action = isSignupMode ? "Signup" : "Login";
          alert(`❌ ${action} failed: ${err.message}`);
        }
      }
    }
  });

  const guest = document.getElementById("guest-login");
  guest?.addEventListener("click", () => {
    window.location.hash = "lobby"; // guest also goes to lobby
  });

  // Signup toggle functionality
  const signupToggle = document.getElementById("signup-toggle");
  const nameField = document.getElementById("name-field");
  const confirmPasswordField = document.getElementById(
    "confirm-password-field"
  );
  const submitButton = document.querySelector(
    "button[type='submit']"
  ) as HTMLButtonElement;
  const title = document.querySelector("h1");

  signupToggle?.addEventListener("click", () => {
    isSignupMode = !isSignupMode;

    if (isSignupMode) {
      // Show signup fields
      nameField?.classList.remove("hidden");
      confirmPasswordField?.classList.remove("hidden");

      // Change button text
      submitButton.textContent = "Register";

      // Change title
      if (title) title.textContent = "Sign Up";

      // Change toggle text
      signupToggle.innerHTML =
        'Already have an account? <span class="font-bold text-[#8a56ea]">Sign In</span>';
    } else {
      // Hide signup fields
      nameField?.classList.add("hidden");
      confirmPasswordField?.classList.add("hidden");

      // Change button text
      submitButton.textContent = "Login";

      // Change title
      if (title) title.textContent = "Sign In";

      // Change toggle text
      signupToggle.innerHTML =

        'Don\'t have an account? <span class="font-bold text-[#8a56ea]">Sign Up</span>';
    }
  });
}
