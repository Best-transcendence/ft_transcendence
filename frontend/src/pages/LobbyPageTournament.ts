import { addTheme } from "../components/Theme";
import { sidebarDisplay } from "../components/SideBar";
import { profileDivDisplay } from "../components/ProfileDiv";
import { LogOutBtnDisplay } from "../components/LogOutBtn";

export function LobbyPageTournament() {
  return `
    <!-- Theme -->
    ${addTheme()}

    <!-- Header with user info -->
    <div class="w-full flex justify-between items-center mb-10">
      ${profileDivDisplay()}
      ${sidebarDisplay()}
      ${LogOutBtnDisplay()}
    </div>

    <!-- Title -->
    <div class="flex items-center flex-col text-center">
      <h1 class="text-4xl text-gray-200 font-heading font-bold mb-1">Create Tournament</h1>
      <p class="text-lg text-gray-400 max-w-xl mb-12">Choose 4 or 8 players · Single Elimination</p>
    </div>

    <!-- Builder Card -->
    <div class="mx-auto bg-[#271d35] backdrop-blur-md rounded-2xl w-full max-w-[980px] p-6 md:p-8 space-y-6 shadow-[0_0_30px_10px_#7037d3]">

      <!-- Participants Manager -->
      <div class="grid md:grid-cols-5 gap-6">
        <!-- Left: Add players -->
        <div class="md:col-span-2 space-y-4">
          <div class="rounded-xl border border-white/10 p-4">
            <div class="text-sm text-gray-300 mb-2">Add Player</div>

			  <div class="flex items-center gap-2">
				<input
				id="friend-name"
				type="text"
				placeholder="Friend username"
				class="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
				/>
				<button
				id="btn-add-friend"
				class="shrink-0 px-4 py-2 rounded-lg border border-white/10 hover:border-violet-400 text-gray-200"
				>
				Add Friend
				</button>
			</div>

			<div class="mt-3">
				<button
				id="btn-add-guest"
				class="w-full px-3 py-2 rounded-lg bg-violet-600/80 hover:bg-violet-600 text-white"
				>
				Add Guest
				</button>
			</div>
			</div>

          <!-- Rules -->
          <div class="rounded-xl border border-white/10 p-4">
            <div class="text-sm text-gray-300 mb-2">Rules</div>
            <div class="space-y-2 text-sm text-gray-200">
              <label class="flex items-center gap-2">
                <input type="radio" name="tournament-size" value="4" id="mode-4" class="accent-violet-600" checked />
                <span>Tournament of <span class="font-mono">4</span> players</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" name="tournament-size" value="8" id="mode-8" class="accent-violet-600" />
                <span>Tournament of <span class="font-mono">8</span> players</span>
              </label>
            </div>
          </div>

          <!-- Player counter -->
          <div class="rounded-xl border border-white/10 p-4 flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-300">Players</div>
              <div class="text-2xl font-semibold text-white">
                <span id="count">0</span>/<span id="max">4</span>
              </div>
            </div>
            <button id="btn-start" class="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed" disabled>
              Matchmaking
            </button>
          </div>
        </div>

        <div class="md:col-span-3 rounded-xl border border-white/10 p-4">
          <div class="text-sm text-gray-300 mb-2">Match Generator</div>
          <div id="matchgenerator" class="flex flex-wrap gap-2 min-h-[42px]"></div>
 			<div class="text-xs text-gray-400 mt-2">You’ll see your matchups once you press Matchmaking! </div>
        </div>
        </div>
      </div>
  `;
}
