import { getCurrentUser } from "../services/api";
import { sidebarDisplay } from "../components/SideBar"

export async function GameIntroPage() {
  try {
    const data = await getCurrentUser();
    const user = data.user;

    return `
      <div class="min-h-screen
                  flex
                  flex-col
                  items-center justify-start
                  bg-gradient-to-b from-theme-bg1 to-theme-bg2
                  text-theme-text p-8">

<!-- Header with user info -->
        <div class="w-full
                    flex justify-between items-center
                    mb-10">

<!-- Profile button -->
		<div class="flex items-center gap-3">
			<div id="profile-logo"
				class="w-10 h-10 rounded-full bg-theme-button flex items-center justify-center text-white font-bold cursor-pointer relative">
				${user.name.charAt(0).toUpperCase()}
			</div>

<!-- Profile text -->
			<div>
              <p class="font-semibold">Welcome back, ${user.name}!</p>
              <p class="text-sm text-gray-500">${user.email}</p>
            </div>
          </div>


<!-- Logout button -->
          <button id="logout-btn"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
            Logout
          </button>
        </div>

<!-- Sidebar -->
		${ sidebarDisplay() }


        <!-- Title -->
        <h1 class="text-4xl font-heading font-bold mb-4">Retro Pong</h1>
        <p class="text-lg text-gray-600 max-w-xl text-center mb-10">
          Experience the classic game of Pong with a modern twist.
        </p>

        <!-- Feature cards -->
        <div class="flex gap-6 flex-wrap justify-center">
          <div class="bg-white bg-opacity-90 rounded-xl shadow p-6 w-64 text-center">
            <h2 class="font-bold text-theme-button mb-2">Classic Gameplay</h2>
            <p class="text-gray-600 text-sm">Pure Pong mechanics</p>
          </div>
          <div class="bg-white bg-opacity-90 rounded-xl shadow p-6 w-64 text-center">
            <h2 class="font-bold text-theme-button mb-2">Smooth Controls</h2>
            <p class="text-gray-600 text-sm">Responsive keyboard controls for both players</p>
          </div>
          <div class="bg-white bg-opacity-90 rounded-xl shadow p-6 w-64 text-center">
            <h2 class="font-bold text-theme-button mb-2">Our amaizing modern Design</h2>
            <p class="text-gray-600 text-sm">more text.......</p>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Failed to load user :", err);
    return `
      <div class="min-h-screen flex items-center justify-center bg-red-100 text-red-600">
        <p> Failed to load user. Please log in again.</p>
      </div>
    `;
  }
}
