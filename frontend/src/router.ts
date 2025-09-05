import { LoginPage } from "./pages/LoginPage";
import { LobbyPage } from "./pages/LobbyPage";
import { login, signup, getCurrentUser } from "./services/api";
import { GameIntroPage } from "./pages/GameIntroPage";

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

    case "GameIntroPage":
      {
        getCurrentUser().then((data) => {
          const user = data.user;
          app.innerHTML = `
      <div class="p-8">
        <h1 class="text-2xl font-bold">Welcome, ${user.name} 👋</h1>
        <p class="text-gray-600">Email: ${user.email}</p>
      </div>
    `;
        }).catch(() => {
          // If token invalid, force back to login
          window.location.hash = "login";
        });
      }
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

    const email = (document.querySelector("input[type='email']") as HTMLInputElement).value.trim();
    const password = (document.querySelector("input[type='password']") as HTMLInputElement).value;
    const name = (document.getElementById("name-field") as HTMLInputElement)?.value?.trim();
    const confirmPassword = (document.getElementById("confirm-password-field") as HTMLInputElement)?.value;

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
        const { token, user } = await login(email, password);
        // user = await login(email, password);
        console.log("Logged in:", user);

        // Save JWT for later requests
        localStorage.setItem("jwt", token);
        window.location.hash = "GameIntroPage"; // navigate to lobby
      }
    } catch (err: unknown) {
      // We are checking if DB is up
      if (typeof err === 'object' && err && 'message' in err && typeof err.message === 'string') {
        if (err.message.includes('fetch')) {
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
  const confirmPasswordField = document.getElementById("confirm-password-field");
  const submitButton = document.querySelector("button[type='submit']") as HTMLButtonElement;
  const title = document.querySelector("h1");

  signupToggle?.addEventListener("click", () => {
    isSignupMode = !isSignupMode;

    if (isSignupMode) {
      // Show signup fields
      nameField?.classList.remove("hidden");
      confirmPasswordField?.classList.remove("hidden");

      // Change button text
      submitButton.textContent = "Sign Up";

      // Change title
      if (title) title.textContent = "Sign Up";

      // Change toggle text
      signupToggle.innerHTML = 'Already have an account? <span class="font-bold text-blue-600">Sign In</span>';
    } else {
      // Hide signup fields
      nameField?.classList.add("hidden");
      confirmPasswordField?.classList.add("hidden");

      // Change button text
      submitButton.textContent = "Login";

      // Change title
      if (title) title.textContent = "Sign In";

      // Change toggle text
      signupToggle.innerHTML = 'Don\'t have an account? <span class="font-bold text-blue-600">Sign Up</span>';
    }
  });
}