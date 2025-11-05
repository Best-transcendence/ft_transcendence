import { addTheme } from "../components/Theme";
import { sidebarDisplay } from "../components/SideBar";
import { profileDivDisplay } from "../components/ProfileDiv";
import { LogOutBtnDisplay } from "../components/LogOutBtn";
import { t } from "../i18n/Lang";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";

/**
 * Tournament Lobby Page Template Generator
 * 
 * This module generates the HTML template for the tournament lobby interface.
 * It provides a user interface for creating tournaments with 2 or 4 players,
 * including player management, tournament rules selection, and match generation.
 */

/**
 * Generates the complete HTML template for the tournament lobby page
 * 
 * Creates a tournament creation interface with:
 * - User interface components (profile, sidebar, logout)
 * - Tournament size selection (2 or 4 players)
 * - Player addition system (friends and guests)
 * - Match generator preview
 * - Tournament rules and controls
 * 
 * @returns {string} Complete HTML template for the tournament lobby
 */
export function LobbyPageTournament() {
  return `
    <!-- Theme component for consistent styling -->
    ${addTheme()}

    <!-- Header section with user interface components -->
    <div class="w-full flex justify-between items-center mb-10">
		
	<!-- Protected pages components -->
		${ profileDivDisplay() }
		${ sidebarDisplay() }
        <!-- Group Language and Logout on the right -->
        <div class="flex gap-2 items-center">
            ${LanguageSwitcher()}
             ${LogOutBtnDisplay()}
        </div>
     </div>

    <!-- Page title and description -->
    <div class="flex items-center flex-col text-center">
      <h1 class="text-4xl text-gray-200 font-heading font-bold mb-1">${t("createTournamentTitle")}</h1>
      <p class="text-lg text-gray-400 max-w-xl mb-12">${t("createTournamentSubtitle")}</p>
    </div>

    <!-- Main tournament builder card with glassmorphism styling -->
    <div class="mx-auto bg-[#271d35] backdrop-blur-md rounded-2xl w-full max-w-[980px] p-6 md:p-8 space-y-6 shadow-[0_0_30px_10px_#7037d3]">

      <!-- Tournament participants management section -->
      <div class="grid md:grid-cols-5 gap-6">
        <!-- Left column: Player management and tournament settings -->
        <div class="md:col-span-2 space-y-4">
          <!-- Player addition interface -->
          <div class="rounded-xl border border-white/10 p-4">
            <div class="text-sm text-gray-300 mb-3">${t("addPlayer")}</div>

            <!-- Two buttons to toggle between guest and user -->
            <div class="flex gap-2 mb-3">
              <button
                type="button"
                id="btn-toggle-guest"
                class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-violet-600 text-white border border-violet-400">
               ${t("addGuest")}
              </button>
              <button
                type="button"
                id="btn-toggle-user"
                class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-transparent text-gray-300 border border-white/10 hover:border-violet-400">
                ${t("addUser")}
              </button>
            </div>

            <!-- Guest player input (visible by default) -->
            <div id="guest-inputs" class="space-y-2">
              <input
                id="guest-name"
                type="text"
                placeholder="${t("guestNamePlaceholder")}"
                maxlength="12"
                class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"/>
              <button
                type="button"
                id="btn-add-guest"
                class="w-full px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium">
				${t("addGuestPlayer")}
              </button>
            </div>

            <!-- User (existing user) inputs (hidden by default) -->
            <div id="user-inputs" class="space-y-2 hidden">
              <input
                id="user-email"
                type="email"
                placeholder="${t("userEmailPlaceholder")}"
                autocomplete="off"
                class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"/>
              <input
                id="user-password"
                type="password"
                placeholder="${t("userPasswordPlaceholder")}"
                autocomplete="off"
                class="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"/>
              <button
                type="button"
                id="btn-add-user"
                class="w-full px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium cursor-pointer">
 				${t("verifyAndAddUser")}
               </button>
            </div>

            <!-- Error message display -->
            <div id="player-error" class="text-red-400 text-sm mt-2 hidden"></div>
          </div>

          <!-- Tournament size selection -->
          <div class="rounded-xl border border-white/10 p-4">
            <div class="text-sm text-gray-300 mb-2">${t("tournamentSize")}</div>
            <div class="space-y-2 text-sm text-gray-200">
              <label class="flex items-center gap-2">
                <input type="radio" name="tournament-size" value="2" id="mode-2" class="accent-violet-600" checked />
                <span>${t("tournamentOf2")}</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" name="tournament-size" value="4" id="mode-4" class="accent-violet-600" />
                <span>${t("tournamentOf4")}</span>
              </label>
            </div>
          </div>

          <!-- Player counter, difficulty and tournament start controls -->
          <div class="rounded-xl border border-white/10 p-4">
            <!-- Player counter -->
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="text-sm text-gray-300">${t("playersLabel")}</div>
                <div class="text-2xl font-semibold text-white">
                  <span id="count">0</span>/<span id="max">4</span>
                </div>
              </div>
              <!-- Tournament start button (disabled until enough players) -->
              <button id="btn-start" class="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                ${t("matchmaking")}
              </button>
            </div>

            <!-- Difficulty selection -->
            <div class="border-t border-white/10 pt-4">
              <div class="text-sm text-gray-300 mb-2">${t("difficultyLabel")}</div>
              <div class="flex gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tournament-difficulty" value="easy" id="difficulty-easy" class="accent-violet-600" />
                  <span class="text-sm text-gray-200">${t("easy")}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tournament-difficulty" value="medium" id="difficulty-medium" class="accent-violet-600" checked />
                  <span class="text-sm text-gray-200">${t("medium")}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tournament-difficulty" value="hard" id="difficulty-hard" class="accent-violet-600" />
                  <span class="text-sm text-gray-200">${t("hard")}</span>
                </label>
              </div>
              <div class="text-xs text-gray-400 mt-2">
                <span id="difficulty-info">${t("difficultyInfoNormal")}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column: Match generator preview -->
        <div class="md:col-span-3 rounded-xl border border-white/10 p-4">
          <div class="text-sm text-gray-300 mb-2">${t("matchGenerator")}</div>
          <!-- Dynamic match preview container -->
          <div id="matchgenerator" class="flex flex-wrap gap-2 min-h-[42px]"></div>
        </div>
        </div>
      </div>
    `;
}
