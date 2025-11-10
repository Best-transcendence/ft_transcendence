import { addTheme } from "../components/Theme";
import { sidebarDisplay } from "../components/SideBar";
import { profileDivDisplay } from "../components/ProfileDiv";
import { LogOutBtnDisplay } from "../components/LogOutBtn";
import { thisUser, UserStats } from "../router";
import { formatDate } from "../utils";
import { t } from "../services/lang/LangEngine";
// @ts-ignore - Chart.js types will be available after npm install
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

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
    <div class="flex items-center flex-col text-center mb-8">
      <h1 class="text-4xl text-gray-200 font-heading font-bold mb-1">${t("dashboard")}</h1>
      <p class="text-lg text-gray-400 max-w-xl mb-12">${t("dashboardSubtitle")}</p>
    </div>

    <!-- Dashboard Carousel Container -->
    <div class="relative flex justify-center items-center w-full min-h-[60vh]">
      <!-- CARD -->
      <div id="dashboard-card"
        class="bg-slate-900 backdrop-blur-md rounded-2xl w-[90%] max-w-[700px]
          p-6 shadow-[0_0_30px_10px_#7037d3] transition-all duration-300"
        style="height: 550px;">
        <!-- Content will be populated by initDashboard -->
        <div id="dashboard-content" class="overflow-y-auto" style="height: 500px;">
          <!-- Content will be dynamically inserted here -->
        </div>
      </div>
    </div>

    <!-- Arrows as FIXED (not inside the card wrapper) -->
    <button id="dashboard-prev"
      type="button"
      class="fixed text-5xl text-gray-400 hover:text-white hidden z-40 cursor-pointer"
      aria-label="Previous"
      style="font-size: clamp(2rem, 6vw, 4rem);">‹</button>

    <button id="dashboard-next"
      type="button"
      class="fixed text-5xl text-gray-400 hover:text-white z-40 cursor-pointer"
      aria-label="Next"
      style="font-size: clamp(2rem, 6vw, 4rem);">›</button>
  `;
}

// Dashboard carousel state
let currentView = 0;
const views = ["stats", "outcomes", "matchTypes", "performance", "recentMatches"];

/** Call after rendering DashboardPage() */
export function initDashboard(): void {
  const stats: UserStats = thisUser?.stats || {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    highestScore: 0
  };
  const matches = thisUser?.matches || [];

  // Calculate additional metrics
  const gamesPlayed = stats.gamesPlayed || 0;
  const wins = stats.wins || 0;
  const losses = stats.losses || 0;
  const draws = stats.draws || 0;
  const pointsFor = stats.pointsFor || 0;
  const pointsAgainst = stats.pointsAgainst || 0;
  const highestScore = stats.highestScore || 0;
  const winStreak = calculateWinStreak(matches);
  const avgScore = gamesPlayed > 0 ? Math.round(pointsFor / gamesPlayed) : 0;
  const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : "0.0";
  const diff = pointsFor - pointsAgainst;

  // Setup carousel navigation
  setupDashboardCarousel(stats, matches, {
    gamesPlayed,
    wins,
    losses,
    draws,
    pointsFor,
    pointsAgainst,
    highestScore,
    winStreak,
    avgScore,
    winRate,
    diff
  });
}

function setupDashboardCarousel(
  stats: UserStats,
  matches: any[],
  calculated: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    pointsFor: number;
    pointsAgainst: number;
    highestScore: number;
    winStreak: number;
    avgScore: number;
    winRate: string;
    diff: number;
  }
): void {
  const contentEl = document.getElementById("dashboard-content");
  const cardEl = document.getElementById("dashboard-card");
  const prevBtn = document.getElementById("dashboard-prev") as HTMLButtonElement | null;
  const nextBtn = document.getElementById("dashboard-next") as HTMLButtonElement | null;

  if (!contentEl || !cardEl || !prevBtn || !nextBtn) return;

  function placeArrows() {
    if (!cardEl || !prevBtn || !nextBtn) return;
    const rect = cardEl.getBoundingClientRect();
    const gap = 16;
    const arrowW = 24;
    const y = rect.top + rect.height / 2;

    prevBtn.style.top = `${y}px`;
    prevBtn.style.left = `${Math.max(0, rect.left - gap - arrowW)}px`;

    nextBtn.style.top = `${y}px`;
    nextBtn.style.left = `${rect.right + gap}px`;
  }

  function renderView() {
    if (!contentEl) return;

    // Clear previous charts
    const existingCharts = ["outcomesChart", "matchTypesChart", "performanceChart"];
    existingCharts.forEach(chartName => {
      const chart = (window as any)[chartName];
      if (chart) chart.destroy();
    });

    let html = "";
    switch (views[currentView]) {
      case "stats":
        html = renderStatsView(calculated, stats);
        break;
      case "outcomes":
        html = renderOutcomesView(calculated);
        setTimeout(() => createOutcomesChart(calculated.wins, calculated.losses, calculated.draws), 100);
        break;
      case "matchTypes":
        html = renderMatchTypesView();
        setTimeout(() => createMatchTypesChart(matches), 100);
        break;
      case "performance":
        html = renderPerformanceView();
        setTimeout(() => createPerformanceChart(matches), 100);
        break;
      case "recentMatches":
        html = renderRecentMatchesView(matches);
        break;
    }

    contentEl.innerHTML = html;
    placeArrows();

    // Show/hide arrows
    if (prevBtn) prevBtn.classList.toggle("hidden", currentView === 0);
    if (nextBtn) nextBtn.classList.toggle("hidden", currentView === views.length - 1);
  }

  prevBtn.addEventListener("click", () => {
    if (currentView > 0) {
      currentView--;
      renderView();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentView < views.length - 1) {
      currentView++;
      renderView();
    }
  });

  window.addEventListener("resize", placeArrows, { passive: true });

  // Initial render
  renderView();
}

function renderStatsView(calculated: any, stats: UserStats): string {
  return `
    <div class="space-y-4">
      <h2 class="text-2xl text-gray-200 font-heading font-bold text-center mb-4" style="font-size: clamp(1.25rem, 3vw, 1.75rem);">${t("statisticsOverview")}</h2>
      
      <!-- Top row: Games / Record -->
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl border border-white/10 p-4 bg-slate-800/50">
          <div class="text-sm text-gray-300 mb-1" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${t("gamesPlayedLabel")}</div>
          <div class="text-3xl font-semibold text-white" style="font-size: clamp(1.5rem, 4vw, 2.5rem);">${calculated.gamesPlayed}</div>
        </div>
        <div class="rounded-xl border border-white/10 p-4 bg-slate-800/50">
          <div class="text-sm text-gray-300 mb-1" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${t("recordLabel")}</div>
          <div class="text-3xl font-semibold text-white" style="font-size: clamp(1.5rem, 4vw, 2.5rem);">${calculated.wins}–${calculated.losses}–${calculated.draws}</div>
        </div>
      </div>

      <!-- Middle row: Win rate / +/- -->
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl border border-white/10 p-4 bg-slate-800/50">
          <div class="text-sm text-gray-300 mb-1" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${t("winRate")}</div>
          <div class="text-3xl font-semibold text-white" style="font-size: clamp(1.5rem, 4vw, 2.5rem);">${calculated.winRate}%</div>
        </div>
        <div class="rounded-xl border border-white/10 p-4 bg-slate-800/50">
          <div class="text-sm text-gray-300 mb-1" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${t("pointDiff")}</div>
          <div class="text-3xl font-semibold text-white" style="font-size: clamp(1.5rem, 4vw, 2.5rem);">${calculated.diff >= 0 ? `+${calculated.diff}` : calculated.diff}</div>
        </div>
      </div>

      <!-- Bottom row: Scoring -->
      <div class="grid grid-cols-3 gap-3">
        <div class="rounded-xl border border-white/10 p-4 bg-slate-800/50">
          <div class="text-sm text-gray-300 mb-1" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${t("pointsFor")}</div>
          <div class="text-2xl font-semibold text-white" style="font-size: clamp(1.25rem, 3vw, 2rem);">${calculated.pointsFor}</div>
        </div>
        <div class="rounded-xl border border-white/10 p-4 bg-slate-800/50">
          <div class="text-sm text-gray-300 mb-1" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${t("pointsAgainst")}</div>
          <div class="text-2xl font-semibold text-white" style="font-size: clamp(1.25rem, 3vw, 2rem);">${calculated.pointsAgainst}</div>
        </div>
        <div class="rounded-xl border border-white/10 p-4 bg-slate-800/50">
          <div class="text-sm text-gray-300 mb-1" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${t("highestScore")}</div>
          <div class="text-2xl font-semibold text-white" style="font-size: clamp(1.25rem, 3vw, 2rem);">${calculated.highestScore}</div>
        </div>
      </div>

      <!-- Additional Metrics Row -->
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl border border-white/10 p-4 bg-slate-800/50">
          <div class="text-sm text-gray-300 mb-1" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${t("winStreak")}</div>
          <div class="text-3xl font-semibold text-white" style="font-size: clamp(1.5rem, 4vw, 2.5rem);">${calculated.winStreak}</div>
        </div>
        <div class="rounded-xl border border-white/10 p-4 bg-slate-800/50">
          <div class="text-sm text-gray-300 mb-1" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${t("averageScore")}</div>
          <div class="text-3xl font-semibold text-white" style="font-size: clamp(1.5rem, 4vw, 2.5rem);">${calculated.avgScore}</div>
        </div>
      </div>

      ${thisUser.updatedAt ? `
        <div class="text-xs text-gray-400 text-center mt-3" style="font-size: clamp(0.625rem, 1.5vw, 0.75rem);">
          ${t("lastUpdated")} ${formatDate(thisUser.updatedAt, "H")}
        </div>
      ` : ""}
    </div>
  `;
}

function renderOutcomesView(calculated: any): string {
  return `
    <div class="space-y-4">
      <h2 class="text-2xl text-gray-200 font-heading font-bold text-center mb-4" style="font-size: clamp(1.25rem, 3vw, 1.75rem);">${t("gameOutcomes")}</h2>
      <div class="flex justify-center items-center mb-4" style="height: 300px;">
        <canvas id="outcomes-chart" style="max-width: 400px; max-height: 300px; width: 100%; height: auto;"></canvas>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div class="rounded-xl border border-white/10 p-4 bg-slate-800/50 text-center">
          <div class="text-3xl font-bold text-purple-400 mb-1" style="font-size: clamp(1.5rem, 4vw, 2.5rem);">${calculated.wins}</div>
          <div class="text-sm text-gray-300" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${t("wins")}</div>
        </div>
        <div class="rounded-xl border border-white/10 p-4 bg-slate-800/50 text-center">
          <div class="text-3xl font-bold text-red-400 mb-1" style="font-size: clamp(1.5rem, 4vw, 2.5rem);">${calculated.losses}</div>
          <div class="text-sm text-gray-300" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${t("losses")}</div>
        </div>
        <div class="rounded-xl border border-white/10 p-4 bg-slate-800/50 text-center">
          <div class="text-3xl font-bold text-gray-400 mb-1" style="font-size: clamp(1.5rem, 4vw, 2.5rem);">${calculated.draws}</div>
          <div class="text-sm text-gray-300" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${t("draws")}</div>
        </div>
      </div>
    </div>
  `;
}

function renderMatchTypesView(): string {
  return `
    <div class="space-y-4">
      <h2 class="text-2xl text-gray-200 font-heading font-bold text-center mb-4" style="font-size: clamp(1.25rem, 3vw, 1.75rem);">${t("matchTypesDistribution")}</h2>
      <div class="flex justify-center items-center" style="height: 400px;">
        <canvas id="match-types-chart" style="max-width: 100%; max-height: 380px; width: 100%; height: 380px;"></canvas>
      </div>
    </div>
  `;
}

function renderPerformanceView(): string {
  return `
    <div class="space-y-4">
      <h2 class="text-2xl text-gray-200 font-heading font-bold text-center mb-4" style="font-size: clamp(1.25rem, 3vw, 1.75rem);">${t("performanceOverTime")}</h2>
      <div class="flex justify-center items-center mb-4" style="height: 380px;">
        <canvas id="performance-chart" style="max-width: 100%; max-height: 360px; width: 100%; height: 360px;"></canvas>
      </div>
      <p class="text-xs text-gray-400 text-center" style="font-size: clamp(0.625rem, 1.5vw, 0.75rem);">${t("showingLastMatches")}</p>
    </div>
  `;
}

function renderRecentMatchesView(matches: any[]): string {
  if (!matches || matches.length === 0) {
    return `
      <div class="text-center text-gray-400 py-12">
        <p class="text-xl mb-3" style="font-size: clamp(1rem, 2.5vw, 1.5rem);">${t("noMatchesYet")}</p>
        <p class="text-base mb-4" style="font-size: clamp(0.875rem, 2vw, 1rem);">${t("startPlayingHistory")}</p>
        <a href="#intro" class="text-purple-400 hover:text-purple-300 underline" style="font-size: clamp(0.875rem, 2vw, 1rem);">${t("playArcadeClashCta")}</a>
      </div>
    `;
  }

  const recentMatches = [...matches]
    .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
    .slice(0, 6);

  return `
    <div class="space-y-4">
      <h2 class="text-2xl text-gray-200 font-heading font-bold text-center mb-4" style="font-size: clamp(1.25rem, 3vw, 1.75rem);">${t("recentMatches")}</h2>
      <div class="space-y-3 overflow-y-auto" style="height: 400px;">
        ${recentMatches.map(match => {
          const isPlayer1 = match.player1Id === thisUser.id;
          const playerScore = isPlayer1 ? match.player1Score : match.player2Score;
          const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
          const opponent = isPlayer1 ? match.player2 : match.player1;
          const opponentName = opponent?.name || (match.type === "AI" ? t("aiOpponent") : t("guest"));
          const opponentAvatar = opponent?.profilePicture || 
            (match.type === "AI" ? "/assets/ai-avatar.jpeg" : "/assets/guest-avatar.jpeg");

          let result = "";
          if (match.winnerId === thisUser.id) {
            result = `<span class="text-green-400 font-semibold">${t("winner")}</span>`;
          } else if (match.winnerId === null || match.winnerId === 0) {
            result = `<span class="text-gray-400 font-semibold">${t("draw")}</span>`;
          } else {
            result = `<span class="text-red-400 font-semibold">${t("loser")}</span>`;
          }

          return `
            <div class="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 shadow-[0_0_20px_5px_#7037d3] border border-white/10">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <img src="${opponentAvatar}" alt="${opponentName}" class="w-14 h-14 rounded-full" style="width: clamp(3rem, 6vw, 3.5rem); height: clamp(3rem, 6vw, 3.5rem);">
                  <div>
                    <div class="text-lg text-gray-200 font-semibold" style="font-size: clamp(1rem, 2.5vw, 1.125rem);">${opponentName}</div>
                    <div class="text-sm text-gray-400" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${getMatchTypeLabel(match.type)} • ${formatDate(match.date || match.createdAt, "H")}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold text-gray-200" style="font-size: clamp(1.5rem, 4vw, 2.5rem);">${playerScore} - ${opponentScore}</div>
                  <div class="text-sm mt-1" style="font-size: clamp(0.75rem, 2vw, 0.875rem);">${result}</div>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="text-center mt-4">
        <a href="#history" class="text-purple-400 hover:text-purple-300 underline" style="font-size: clamp(0.875rem, 2vw, 1rem);">${t("viewFullHistory")}</a>
      </div>
    </div>
  `;
}

function calculateWinStreak(matches: any[]): number {
  if (!matches || matches.length === 0) return 0;

  // Sort matches by date (most recent first)
  const sortedMatches = [...matches].sort((a, b) => 
    new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
  );

  let streak = 0;
  for (const match of sortedMatches) {
    const isPlayer1 = match.player1Id === thisUser.id;
    const playerScore = isPlayer1 ? match.player1Score : match.player2Score;
    const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;

    if (match.winnerId === thisUser.id) {
      streak++;
    } else if (match.winnerId === null || match.winnerId === 0) {
      // Draw - streak continues but doesn't increase
      continue;
    } else {
      // Loss - streak breaks
      break;
    }
  }

  return streak;
}

function createOutcomesChart(wins: number, losses: number, draws: number): void {
  const canvas = document.getElementById("outcomes-chart") as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Destroy existing chart if it exists
  const existingChart = (window as any).outcomesChart;
  if (existingChart) existingChart.destroy();

  // Handle empty data
  if (wins === 0 && losses === 0 && draws === 0) {
    return; // Don't render chart if no data
  }

  // Small delay to ensure canvas is rendered
  setTimeout(() => {
    if (!canvas || !ctx) return;

  const chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [t("wins"), t("losses"), t("draws")],
      datasets: [{
        data: [wins, losses, draws],
        backgroundColor: [
          "rgba(124, 58, 237, 0.8)", // purple for wins
          "rgba(239, 68, 68, 0.8)", // red for losses
          "rgba(156, 163, 175, 0.8)" // gray for draws
        ],
        borderColor: [
          "rgba(124, 58, 237, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(156, 163, 175, 1)"
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#e5e7eb",
            font: {
              size: 12
            }
          }
        }
      }
    }
  });

    (window as any).outcomesChart = chart;
  }, 50);
}

function createMatchTypesChart(matches: any[]): void {
  const canvas = document.getElementById("match-types-chart") as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Count match types
  const typeCounts: { [key: string]: number } = {};
  matches.forEach(match => {
    const type = match.type || "UNKNOWN";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const labels = Object.keys(typeCounts);
  const data = Object.values(typeCounts);

  // Destroy existing chart if it exists
  const existingChart = (window as any).matchTypesChart;
  if (existingChart) existingChart.destroy();

  // Handle empty data
  if (labels.length === 0 || data.every(val => val === 0)) {
    return; // Don't render chart if no data
  }

  // Small delay to ensure canvas is rendered
  setTimeout(() => {
    if (!canvas || !ctx) return;

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels.map(type => getMatchTypeLabel(type)),
      datasets: [{
        label: "Matches",
        data: data,
        backgroundColor: "rgba(124, 58, 237, 0.8)",
        borderColor: "rgba(124, 58, 237, 1)",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#e5e7eb",
            stepSize: 1
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)"
          }
        },
        x: {
          ticks: {
            color: "#e5e7eb"
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)"
          }
        }
      }
    }
  });

    (window as any).matchTypesChart = chart;
  }, 50);
}

function createPerformanceChart(matches: any[]): void {
  const canvas = document.getElementById("performance-chart") as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Sort matches by date (oldest first)
  const sortedMatches = [...matches]
    .sort((a, b) => new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime())
    .slice(-15); // Last 15 matches

  // Handle empty data
  if (sortedMatches.length === 0) {
    return; // Don't render chart if no data
  }

  const labels = sortedMatches.map((match, index) => `Match ${index + 1}`);
  const wins = sortedMatches.map(match => match.winnerId === thisUser.id ? 1 : 0);
  const losses = sortedMatches.map(match => 
    match.winnerId && match.winnerId !== thisUser.id ? 1 : 0
  );

  // Destroy existing chart if it exists
  const existingChart = (window as any).performanceChart;
  if (existingChart) existingChart.destroy();

  // Small delay to ensure canvas is rendered
  setTimeout(() => {
    if (!canvas || !ctx) return;

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: t("wins"),
          data: wins,
          borderColor: "rgba(124, 58, 237, 1)",
          backgroundColor: "rgba(124, 58, 237, 0.2)",
          tension: 0.4,
          fill: true
        },
        {
          label: t("losses"),
          data: losses,
          borderColor: "rgba(239, 68, 68, 1)",
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: "#e5e7eb"
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: {
            color: "#e5e7eb",
            stepSize: 1
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)"
          }
        },
        x: {
          ticks: {
            color: "#e5e7eb"
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)"
          }
        }
      }
    }
  });

    (window as any).performanceChart = chart;
  }, 50);
}

function getMatchTypeLabel(type: string): string {
  switch (type) {
    case "ONE_VS_ONE":
      return t("matchTypeOneVOne");
    case "TOURNAMENT_1V1":
      return t("matchTypeTournament1v1");
    case "TOURNAMENT_INTERMEDIATE":
      return t("matchTypeTournamentIntermediate");
    case "TOURNAMENT_FINAL":
      return t("matchTypeTournamentFinal");
    case "AI":
      return t("matchTypeAI");
    default:
      return type;
  }
}