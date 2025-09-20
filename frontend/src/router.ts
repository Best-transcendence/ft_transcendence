//Services:
import { getCurrentUser } from "./services/api";
//Pages:
import { LoginPage } from "./pages/LoginPage";
import { LobbyPage } from "./pages/LobbyPage";
import { login, signup } from "./services/api";
import { GameIntroPage } from "./pages/GameIntroPage";
import { GamePong2D } from "./games/Pong2d";
import { initGame } from "./games/InitGame";

import { ProfilePage } from "./pages/ProfilePage";
//Components:
import { sideBar } from "./components/SideBar";
import { logOutBtn } from "./components/LogOutBtn"
import { triggerPopup } from "./components/popUps"


// Centralizes user extraction into a variable
export let thisUser: any = undefined;

async function fetchUser()
{
	try
	{
		const data = await getCurrentUser();
		thisUser = data.user;
	}
	catch
	{
		thisUser = undefined;
	}

}

/*  Centralizing the user data extraction for the
	protected (AKA logged-in only) pages */
/* function protectedPage(renderer: () => string)
{
	const app = document.getElementById("app")!;

	if (thisUser != undefined)
	{
		const html = renderer();
		app.innerHTML = html;

		sideBar(); //centralise sidebar attach here
		logOutBtn(); //centralise logout button attach here
	}
	else
	{
		console.error("Failed to load user");
		window.location.hash = "login";
	}
}; */

//tmp async function to render visual edit without having to relog
async function protectedPage(renderer: () => string)
{
	const app = document.getElementById("app")!;

	await fetchUser();
	if (thisUser != undefined)
	{
		const html = renderer();
		app.innerHTML = html;

		sideBar(); //centralise sidebar attach here
		logOutBtn(); //centralise logout button attach here
		triggerPopup();
		initGame();
	}
	else
	{
		console.error("Failed to load user");
		window.location.hash = "login";
	}
};
//_______ Info
/*
The router will set up the routing sistem for the SAP
with the # for now just to see if everything works.

*/
export function router() {
  const app = document.getElementById("app")!;
  const page = window.location.hash.replace("#", "") || "login";

  if (window.location.pathname.startsWith("/assets/")) //lets us open assets on web
	return;

  switch (page) {
    case "login":
      app.innerHTML = LoginPage();
      attachLoginListeners();
      break;

    case "lobby":
      app.innerHTML = LobbyPage();
      break;

    case "intro":
      protectedPage(() => GameIntroPage()); //go through user data extraction before rendering page
      break;

    case "pong2d":
	protectedPage(() => GamePong2D());
      initGame();
      break;

	case "profile":
		protectedPage(() => ProfilePage()); //go through user data extraction before rendering page
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
        localStorage.setItem("jwt", user.token);
		await fetchUser();
        window.location.hash = "intro"; // navigate to gamePage
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
