/**
 * Application Router and Authentication System
 *
 * This module handles client-side routing, user authentication, and page management
 * for the Pong game application. It provides a centralized routing system with
 * protected routes, user session management, and WebSocket connection handling.
 */

// Service imports for API communication and WebSocket connection
import { getCurrentUser, login, signup } from "./services/api";
import { connectSocket } from "./services/ws";
import { GamePongRemote, initRemoteGame, leaveRemoteGame} from "./games/Pong2dRemote";
import { setupLanguageSwitcher } from "./services/lang/LanguageSwitcher";
import { t } from "./services/lang/LangEngine";
import DOMPurify from "dompurify";
// Page component imports for different application views
import { LoginPage } from "./pages/LoginPage";
import { LobbyPage, initLobby } from "./pages/LobbyPage";
import { GameIntroPage } from "./pages/GameIntroPage";
import { GamePongAIOpponent, setupAIOpponent } from "./games/AIOpponent";
import { destroyCurrentGame } from "./games/GameController";
import { GamePongTournament } from "./games/Tournament";
import { LobbyPageTournament } from "./tournament/TournamentLobby";
import { initLobbyPageTournament } from "./tournament/InitTournamentLobby";
import { initGameTournament } from "./games/InitGameTournament";
import {
  bootTournamentFlow,
  teardownTournamentFlow,
} from "./games/TournamentFlow";
import { ProfilePage, profileStatsEvents } from "./pages/ProfilePage";
import { FriendsPage } from "./pages/Friends";
import { HistoryPage, matchesEvents, resetHistoryPageState } from "./pages/HistoryPage";
import { DashboardPage, initDashboard, resetDashboardState } from "./pages/Dashboard";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LoadingPage, initLoadingPage } from "./pages/LoadingPage";

// UI component imports for consistent interface elements
import { sideBar } from "./components/SideBar";
import { logOutBtn } from "./components/LogOutBtn";
import { triggerPopup } from "./components/Popups";
import { friendRequest } from "./components/FriendRequestDiv";

// Global user state - centralizes user data across the application
export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  pointsFor: number;
  pointsAgainst: number;
  highestScore: number;
}

export interface User {
  id?: number;
  authUserId?: number;
  name?: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  friends?: any[];
  friendOf?: any[];
  matches?: any[];
  stats?: UserStats;   // tell TS that stats exists
  createdAt?: string;
  updatedAt?: string;
}

export const thisUser: User = {};

/**
 * Fetches current user data from the API and updates global user state
 * Called before rendering protected pages to ensure user authentication
 */
export async function fetchUser() {
  try {
    const data = await getCurrentUser();
    Object.assign(thisUser, data.user); // merge new data into existing reference

    console.log("=== FETCH USER DEBUG ===");
    console.log("Data received:", data);
    console.log("User stats:", thisUser.stats);
  } catch (error) {
    console.error("Error fetching user:", error);
    for (const key in thisUser) delete (thisUser as any)[key];
  }
}


/**
 * Protected page wrapper that ensures user authentication before rendering
 *
 * This function handles authentication checks and renders pages only for logged-in users.
 * It automatically redirects to login if the user is not authenticated.
 *
 * @param renderer - Function that returns the HTML content for the page
 * @param postRender - Optional array of functions to execute after page rendering
 *                    (used for page-specific initialization like event listeners)
 */
export async function protectedPage(
  renderer: () => string | Promise<string>,
  ...postRender: (() => void)[]
) {
  const app = document.getElementById("app")!;

  // Fetch and validate user authentication
  await fetchUser();

  // Check if user is properly authenticated with valid data
  if (thisUser && thisUser.id && thisUser.name && thisUser.email) {
    // Render the page content
    const content = await renderer();
    app.innerHTML = content;

    // Attach common UI components to all protected pages
    sideBar(); // Navigation sidebar
    logOutBtn(); // Logout button

    // Execute page-specific initialization functions
    postRender?.forEach((fn) => fn());
  } else {
    console.error("Failed to load user - redirecting to login");
    console.error("User state:", thisUser);
    // Clear invalid token
    localStorage.removeItem("jwt");
    window.location.hash = "login"; // Redirect to login if not authenticated
  }
}

/**
 * Main application router function
 *
 * Handles client-side routing using hash-based navigation (#route).
 * Manages page rendering, authentication, and URL parameter parsing.
 * Supports both public routes (login) and protected routes (authenticated pages).
 */
let lastPage: string | null = null;

export function router() {
  const app = document.getElementById("app")!;

  // Parse URL hash to extract route and query parameters
  const rawHash = window.location.hash.slice(1);
  const [route, query] = rawHash.split("?"); // Split route and query parameters

  const page = route || "login"; // Default to login page if no route specified

  // Skip routing for asset requests (CSS, JS, images, etc.)
  if (window.location.pathname.startsWith("/assets/")) return;

  // Cleanup previous games when navigating away
  console.log("=== ROUTER NAVIGATION ===", "Page:", page);

  // UNIFIED GAME CLEANUP: Let game creation functions handle cleanup
  // Each game type (AI, tournament, etc.) will call destroyCurrentGame() when initializing
  // This ensures proper cleanup order and prevents destroying games that haven't been created yet

  // Stop tournament flow if navigating away from tournament
  if (page !== "tournament" && page !== "lobbytournament") {
    console.log("Tearing down tournament flow");
    teardownTournamentFlow();
  }

  // Cleanup games when navigating to non-game pages
  const isGamePage =
    page === "AIopponent" ||
    page === "tournament" ||
    page === "pong" ||
    page === "remote";
  if (!isGamePage) {
    console.log("Navigating to non-game page - destroying any active game");
    destroyCurrentGame();
  }

  // If we’re leaving the remote page, clean it up
  if (lastPage === "remote" && page !== "remote") {
    console.log("Leaving remote game, cleaning up");
    leaveRemoteGame();
  }

  lastPage = page;
  // Route handling - switch between different application pages
  switch (page) {
    // Public routes (no authentication required)
    case "login":
      app.innerHTML = DOMPurify.sanitize(LoginPage());
      attachLoginListeners(); // Set up login form event listeners
	  setupLanguageSwitcher();
      break;

    // Protected routes (authentication required)
    case "lobby":
      protectedPage(
        () => LobbyPage(),
        () => {
          initLobby(); // Initialize lobby-specific functionality
        }
      );
      break;

    case "lobbytournament":
      protectedPage(
        () => LobbyPageTournament(),
        () => initLobbyPageTournament() // Initialize tournament lobby
      );
      break;

    case "intro":
		protectedPage(
			() => GameIntroPage(),
			() => setupLanguageSwitcher() // language switcher setup after rendering
		)
      break;

    case "remote":
      // Remote multiplayer game with room ID validation
      const roomId = query ? new URLSearchParams(query).get("room") : null;
      if (roomId) localStorage.setItem("roomId", roomId); // Store room ID for game
      if (!roomId) {
        app.innerHTML = DOMPurify.sanitize(NotFoundPage()); // Show 404 if no room ID provided
        return;
      }
      protectedPage(
        () => GamePongRemote(),
        () => initRemoteGame(roomId) // Initialize remote game with room ID
      );
      break;

    // Tournament system routes
    case "loading":
      protectedPage(
        () => LoadingPage(),
        () => initLoadingPage()
      );
      break;

    case "tournament":
      protectedPage(
        () => GamePongTournament(),
        () => {
          initGameTournament(); // Initialize tournament game
          bootTournamentFlow({
            // Set up tournament flow management
            onSpaceStart: () => (window as any).beginTournamentRound?.(),
          });
        }
      );
      break;

    // Game mode routes
    case "AIopponent":
      protectedPage(() => GamePongAIOpponent(), setupAIOpponent); // AI opponent game
      break;

    // User management routes
    case "profile":
      protectedPage(() => ProfilePage(), profileStatsEvents, triggerPopup); // User profile page
      break;

    case "friends":
      protectedPage(() => FriendsPage(), triggerPopup, friendRequest); // Friends management
      break;

    case "dashboard":
      // Reset dashboard state to show Statistics Overview on fresh navigation
      resetDashboardState();
      protectedPage(() => DashboardPage(), initDashboard); // User dashboard
      break;

    case "history":
      // Reset history page state to show latest match on fresh navigation
      resetHistoryPageState();
      protectedPage(() => HistoryPage(), matchesEvents);  // Match history page
      break;

    // Fallback for unknown routes
    default:
      app.innerHTML = DOMPurify.sanitize(NotFoundPage()); // 404 page for invalid routes
  }
}

/**
 * Sets up event listeners for the login page
 * Handles both login and signup functionality with form validation
 */
function attachLoginListeners() {
  const form = document.getElementById("login-form");
  let isSignupMode = false; // Toggle between login and signup modes

  // Main form submission handler for both login and signup
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Extract form field values
    const email = (
      document.getElementById("email-field") as HTMLInputElement
    )?.value.trim();
    const password = (
      document.getElementById("password-field") as HTMLInputElement
    )?.value;
    const name = (
      document.getElementById("name-field") as HTMLInputElement
    )?.value?.trim();
    const confirmPassword = (
      document.getElementById("confirm-password-field") as HTMLInputElement
    )?.value;

    try {
      let user;

      if (isSignupMode) {
        // Handle user registration
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
        // Handle user login
        user = await login(email, password);
        console.log("Logged in:", user);
        localStorage.setItem("jwt", user.token); // Store JWT token for authentication

        console.log("✅ Logged in with token:", user.token);

        // Establish WebSocket connection for real-time features
        const token = localStorage.getItem("jwt") || user.token;
        if (token) {
          connectSocket(token);
        }

        // Update user state and navigate to game intro
        await fetchUser();
        window.location.hash = "intro";
      }
    } catch (err: unknown) {
      // Error handling with user-friendly messages
      if (
        typeof err === "object" &&
        err &&
        "message" in err &&
        typeof err.message === "string"
      ) {
        if (err.message.includes("fetch")) {
          alert("❌ Cannot connect to server. Is the backend running?");
        } else {
          // Server is up but authentication failed
          const action = isSignupMode ? "Signup" : "Login";
          alert(`❌ ${action} failed: ${err.message}`);
        }
      }
    }
  });

  // Signup/login mode toggle functionality
  const signupToggle = document.getElementById("signup-toggle");
  const nameField = document.getElementById("name-field");
  const confirmPasswordField = document.getElementById(
    "confirm-password-field"
  );
  const submitButton = document.getElementById(
    "submit-button"
  ) as HTMLButtonElement | null;
  const title = document.getElementById("form-title");

  /**
   * Updates the form UI based on current mode (login/signup)
   * Shows/hides fields and updates button text and titles
   */
  function render() {
    if (!signupToggle) return;
    if (isSignupMode) {
      // Show signup-specific fields
      nameField?.classList.remove("hidden");
      confirmPasswordField?.classList.remove("hidden");
      // Update UI text for signup mode
      if (submitButton) submitButton.textContent = t("register");
      if (title) title.textContent = t("signUp");
      signupToggle.innerHTML = DOMPurify.sanitize(`${t("alreadyHaveAccount")} <span class="font-bold text-accent hover:text-accent-hover transition-colors duration-200">${t("signIn")}</span>`);
    } else {
      // Hide signup fields for login mode
      nameField?.classList.add("hidden");
      confirmPasswordField?.classList.add("hidden");
      // Update UI text for login mode
      if (submitButton) submitButton.textContent = t("login");
      if (title) title.textContent = t("signIn");
      signupToggle.innerHTML = DOMPurify.sanitize(`
		${t("dontHaveAccount")}
		<span class="font-bold text-accent hover:text-accent-hover transition-colors duration-200">
			${t("signUp")}
		</span>`);
    }
  }

  // Toggle between login and signup modes
  signupToggle?.addEventListener("click", () => {
    isSignupMode = !isSignupMode;
    render();
  });

  // Initial render to ensure consistent UI state
  render();
}
