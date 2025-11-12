import { addTheme } from "../components/Theme";
import { sidebarDisplay } from "../components/SideBar";
import { profileDivDisplay } from "../components/ProfileDiv";
import { LogOutBtnDisplay } from "../components/LogOutBtn";
import { thisUser, UserStats } from "../router";
import { formatDate } from "../utils";
import { t } from "../services/lang/LangEngine";

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
        style="min-height: 550px;">
        <!-- Content will be populated by initDashboard -->
        <div id="dashboard-content" class="overflow-y-auto" style="min-height: 500px;">
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

// Export function to reset dashboard state (called by router)
export function resetDashboardState(): void {
  currentView = 0;
}

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

  // Calculate most recent match date
  let lastMatchDate: string | null = null;
  if (matches && matches.length > 0) {
    const sortedMatches = [...matches].sort(
      (a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
    );
    lastMatchDate = sortedMatches[0].date || sortedMatches[0].createdAt || null;
  }

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
    diff,
    lastMatchDate
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
    lastMatchDate: string | null;
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

      ${calculated.lastMatchDate ? `
        <div class="text-xs text-gray-400 text-center mt-3" style="font-size: clamp(0.625rem, 1.5vw, 0.75rem);">
          ${t("lastUpdated")} ${formatDate(calculated.lastMatchDate, "H")}
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
    .slice(0, 3);

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
            <div class="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 shadow-[0_0_20px_5px_#7037d3] border border-white/10 mb-4 last:mb-0">
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

  // Handle empty data
  if (wins === 0 && losses === 0 && draws === 0) {
    return; // Don't render chart if no data
  }

  // Small delay to ensure canvas is rendered
  setTimeout(() => {
    if (!canvas || !ctx) return;

    // Set canvas size
    const size = Math.min(400, 300);
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;
    const innerRadius = size * 0.2;
    const total = wins + losses + draws;

    // Colors
    const colors = [
      { fill: "rgba(124, 58, 237, 0.8)", stroke: "rgba(124, 58, 237, 1)" }, // purple for wins
      { fill: "rgba(239, 68, 68, 0.8)", stroke: "rgba(239, 68, 68, 1)" }, // red for losses
      { fill: "rgba(156, 163, 175, 0.8)", stroke: "rgba(156, 163, 175, 1)" } // gray for draws
    ];

    const data = [wins, losses, draws];
    let currentAngle = -Math.PI / 2; // Start at top

    // Draw each segment
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      if (!value || value === 0) continue;

      const color = colors[i];
      if (!color) continue;

      const sliceAngle = (value / total) * 2 * Math.PI;
      const endAngle = currentAngle + sliceAngle;

      // Draw outer arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = color.fill;
      ctx.fill();
      ctx.strokeStyle = color.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle = endAngle;
    }
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

  // Handle empty data
  if (labels.length === 0 || data.every(val => val === 0)) {
    return; // Don't render chart if no data
  }

  // Small delay to ensure canvas is rendered
  setTimeout(() => {
    if (!canvas || !ctx) return;

    // Set canvas size
    const width = canvas.offsetWidth || 600;
    const height = 380;
    canvas.width = width;
    canvas.height = height;

    const padding = { top: 20, right: 20, bottom: 60, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = Math.max(...data, 1);
    const barWidth = chartWidth / labels.length * 0.7;
    const barSpacing = chartWidth / labels.length;

	// Y line

	// Set styles for grid lines and text
	ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; // light transparent grid lines
	ctx.lineWidth = 1;
	ctx.fillStyle = "#e5e7eb"; // light gray text color
	ctx.font = "12px sans-serif";
	ctx.textAlign = "right"; // align text to the right side
	ctx.textBaseline = "middle"; // text will be vertically centered

	// If maxValue = 3 -> 4 lines (for 0, 1, 2, 3)
	const step = 1; // go up by 1 each time
	const maxY = Math.ceil(maxValue); // safety round

	for (let v = 0; v <= maxY; v += step) {
	//  Y position for this grid line.
	// The higher the value (v), the lower the line on the chart
	const y = padding.top + chartHeight - (v / maxY) * chartHeight;

	// Draw the horizontal grid line
	ctx.beginPath();
	ctx.moveTo(padding.left, y); // start on the left
	ctx.lineTo(padding.left + chartWidth, y); // draw to the right
	ctx.stroke();
	// Draw the Y-axis label (number) next to the line
	ctx.fillText(v.toString(), padding.left - 10, y);

	}

    // Draw vertical grid lines
    for (let i = 0; i <= labels.length; i++) {
      const x = padding.left + (chartWidth / labels.length) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }

    // Draw bars
    const barColor = "rgba(124, 58, 237, 0.8)";
    const borderColor = "rgba(124, 58, 237, 1)";

    labels.forEach((label, index) => {
      const value = data[index];
      if (value === undefined) return;

      const barHeight = (value / maxValue) * chartHeight;
      const x = padding.left + barSpacing * index + (barSpacing - barWidth) / 2;
      const y = padding.top + chartHeight - barHeight;

      // Draw bar
      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, barWidth, barHeight);

      // Draw label
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const labelText = getMatchTypeLabel(label);
      const labelX = padding.left + barSpacing * index + barSpacing / 2;
      const labelY = padding.top + chartHeight + 10;
      ctx.fillText(labelText, labelX, labelY);

      // Draw value on top of bar
      ctx.textBaseline = "bottom";
      ctx.fillText(value.toString(), labelX, y);
    });
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
    .slice(-10); // Last 10 matches

  // Handle empty data
  if (sortedMatches.length === 0) {
    return; // Don't render chart if no data
  }

  // Calculate cumulative win rate over time
  const winRates: number[] = [];
  let totalWins = 0;
  let totalMatches = 0;

  sortedMatches.forEach(match => {
    totalMatches++;
    if (match.winnerId === thisUser.id) {
      totalWins++;
    }
    // Calculate win rate as percentage
    const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
    winRates.push(winRate);
  });

  // Small delay to ensure canvas is rendered
  setTimeout(() => {
    if (!canvas || !ctx) return;

    // Set canvas size
    const width = canvas.offsetWidth || 600;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    const padding = { top: 20, right: 20, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const dataLength = sortedMatches.length;
    const maxValue = 100; // Win rate percentage (0-100%)

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (0%, 25%, 50%, 75%, 100%)
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines
    const verticalLines = Math.min(dataLength, 10);
    for (let i = 0; i <= verticalLines; i++) {
      const x = padding.left + (chartWidth / verticalLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }

    // Draw win rate line
    const points: { x: number; y: number }[] = [];
    
    winRates.forEach((rate, index) => {
      const x = padding.left + (chartWidth / (dataLength - 1 || 1)) * index;
      const y = padding.top + chartHeight - (rate / maxValue) * chartHeight;
      points.push({ x, y });
    });

    if (points.length > 0) {
      const firstPoint = points[0];
      if (firstPoint) {
        // Draw filled area with smooth curve matching the line
        ctx.beginPath();
        ctx.moveTo(firstPoint.x, padding.top + chartHeight);
        ctx.lineTo(firstPoint.x, firstPoint.y);
        // Use the same smooth curve as the line
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          if (prev && curr) {
            // Smooth curve using quadratic bezier
            const cpX = (prev.x + curr.x) / 2;
            ctx.quadraticCurveTo(cpX, prev.y, curr.x, curr.y);
          }
        }
        const lastPoint = points[points.length - 1];
        if (lastPoint) {
          ctx.lineTo(lastPoint.x, padding.top + chartHeight);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(124, 58, 237, 0.2)";
        ctx.fill();

        // Draw line
        ctx.beginPath();
        ctx.moveTo(firstPoint.x, firstPoint.y);
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          if (prev && curr) {
            // Smooth curve using quadratic bezier
            const cpX = (prev.x + curr.x) / 2;
            ctx.quadraticCurveTo(cpX, prev.y, curr.x, curr.y);
          }
        }
        ctx.strokeStyle = "rgba(124, 58, 237, 1)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw points
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(124, 58, 237, 1)";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Draw Y-axis labels (0%, 25%, 50%, 75%, 100%)
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= gridLines; i++) {
      const value = 100 - (i * 25);
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.fillText(`${value}%`, padding.left - 10, y);
    }

    // Draw Y-axis label (rotated)
    ctx.save();
    ctx.translate(15, padding.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(t("winRateLabel"), 0, 0);
    ctx.restore();

    // Draw X-axis labels (match numbers)
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "12px sans-serif";
    const labelY = padding.top + chartHeight + 10;
    for (let i = 0; i < dataLength; i++) {
      const x = padding.left + (chartWidth / (dataLength - 1 || 1)) * i;
      // Only show labels for every few matches to avoid crowding
      if (dataLength <= 10 || i % Math.ceil(dataLength / 10) === 0 || i === dataLength - 1) {
        ctx.fillText((i + 1).toString(), x, labelY);
      }
    }

    // Draw X-axis label
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(t("matchNumberLabel"), padding.left + chartWidth / 2, padding.top + chartHeight + 35);
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