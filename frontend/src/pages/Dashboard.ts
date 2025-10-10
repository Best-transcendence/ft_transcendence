import { addTheme } from "../components/Theme";
import { sidebarDisplay } from "../components/SideBar";
import { profileDivDisplay } from "../components/ProfileDiv";
import { LogOutBtnDisplay } from "../components/LogOutBtn";
import { thisUser } from "../router";

// Prisma model //TODO work on it maybe merge with Camille Matches modell
type Stats = {
  userId: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  pointsFor: number;
  pointsAgainst: number;
  highestScore: number;
  updatedAt: string; // ISO string from API
};

export function DashboardPage(): string {
  return `
    ${ addTheme() }

    <!-- Header -->
    <div class="w-full flex justify-between items-center mb-10">
      ${ profileDivDisplay() }
      ${ sidebarDisplay() }
      ${ LogOutBtnDisplay() }
    </div>

    <!-- Title -->
    <div class="flex items-center flex-col text-center">
      <h1 class="text-4xl text-gray-200 font-heading font-bold mb-1">Dashboard</h1>
      <p class="text-lg text-gray-400 max-w-xl mb-12">Your Arcade Clash Data Zone</p>
    </div>

    <!-- Stats Card -->
    <div class="mx-auto bg-[#271d35] backdrop-blur-md rounded-2xl w-full max-w-[560px] p-6 space-y-6 shadow-[0_0_30px_10px_#7037d3]">

      <!-- Top row: Games / Record -->
      <div class="grid grid-cols-2 gap-4">
        <div class="rounded-xl border border-white/10 p-4">
          <div class="text-sm text-gray-300">Games Played</div>
          <div id="stat-games" class="text-3xl font-semibold text-white mt-1">—</div>
        </div>
        <div class="rounded-xl border border-white/10 p-4">
          <div class="text-sm text-gray-300">Record (W–L–D)</div>
          <div id="stat-record" class="text-3xl font-semibold text-white mt-1">—</div>
        </div>
      </div>

      <!-- Middle row: Win rate / +/- -->
      <div class="grid grid-cols-2 gap-4">
        <div class="rounded-xl border border-white/10 p-4">
          <div class="text-sm text-gray-300">Win Rate</div>
          <div id="stat-winrate" class="text-3xl font-semibold text-white mt-1">—</div>
        </div>
        <div class="rounded-xl border border-white/10 p-4">
          <div class="text-sm text-gray-300">Point Diff (±)</div>
          <div id="stat-diff" class="text-3xl font-semibold text-white mt-1">—</div>
        </div>
      </div>

      <!-- Bottom row: Scoring -->
      <div class="grid grid-cols-3 gap-4">
        <div class="rounded-xl border border-white/10 p-4">
          <div class="text-sm text-gray-300">Points For</div>
          <div id="stat-for" class="text-2xl font-semibold text-white mt-1">—</div>
        </div>
        <div class="rounded-xl border border-white/10 p-4">
          <div class="text-sm text-gray-300">Points Against</div>
          <div id="stat-against" class="text-2xl font-semibold text-white mt-1">—</div>
        </div>
        <div class="rounded-xl border border-white/10 p-4">
          <div class="text-sm text-gray-300">Highest Score</div>
          <div id="stat-high" class="text-2xl font-semibold text-white mt-1">—</div>
        </div>
      </div>

      <div class="text-xs text-gray-400 text-center">
        Last updated: <span id="stat-updated">—</span>
      </div>
    </div>
  `;
}

 // TODO finish the connection beetween the database and dashboard 
// /** Call after rendering DashboardPage() */
// export async function initDashboard(): Promise<void> {
//   /api/stats/${thisUser.id}` if that’s your route.
//   const endpoint = "/api/stats/me";