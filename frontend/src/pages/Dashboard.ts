/**
 * DASHBOARD PAGE MODULE
 * 
 * This file implements the user statistics dashboard functionality.
 * The dashboard displays game statistics, charts, and match history in a carousel format.
 * 
 * WHAT IS A DASHBOARD?
 * A dashboard is a visual display of important information, like statistics and charts.
 * This dashboard shows:
 * - Game statistics (wins, losses, draws, scores)
 * - Visual charts (pie chart for outcomes, bar chart for match types, line chart for performance)
 * - Recent match history
 * 
 * HOW IT WORKS:
 * 1. DashboardPage() - Creates the HTML structure for the dashboard
 * 2. initDashboard() - Initializes the dashboard with user data and sets up the carousel
 * 3. setupDashboardCarousel() - Manages navigation between different views
 * 4. Chart functions - Create visual charts using HTML5 Canvas
 * 5. View renderers - Generate HTML for each dashboard view
 * 
 * CAROUSEL SYSTEM:
 * The dashboard uses a carousel (like a slideshow) to show different views:
 * - View 1: Statistics Overview (numbers and metrics)
 * - View 2: Game Outcomes (pie chart showing wins/losses/draws)
 * - View 3: Match Types Distribution (bar chart showing match types)
 * - View 4: Performance Over Time (line chart showing win rate progression)
 * - View 5: Recent Matches (list of recent games)
 * 
 * Users can navigate between views using arrow buttons.
 */

// Import UI components (header, sidebar, profile, logout button)
import { addTheme } from "../components/Theme";
import { sidebarDisplay } from "../components/SideBar";
import { profileDivDisplay } from "../components/ProfileDiv";
import { LogOutBtnDisplay } from "../components/LogOutBtn";
// Import user data and types from router
import { thisUser, UserStats } from "../router";
// Import utility function for date formatting
import { formatDate } from "../utils";
// Import translation function for multi-language support
import { t } from "../services/lang/LangEngine";

/**
 * FUNCTION: DashboardPage()
 * 
 * Purpose: Creates the HTML structure for the dashboard page
 * 
 * This function returns a string containing HTML that will be inserted into the page.
 * It creates:
 * - Page header with title and subtitle
 * - Dashboard card container (where content will be displayed)
 * - Navigation arrows (previous/next buttons for carousel)
 * 
 * NOTE: The actual dashboard content is populated later by initDashboard()
 *       This function only creates the "shell" or structure.
 * 
 * Returns: HTML string for the dashboard page structure
 */
export function DashboardPage(): string {
  return `
    ${ addTheme() }

    <!-- ========================================================================
         PAGE HEADER
         ========================================================================
         Contains navigation elements: profile, sidebar menu, and logout button
         These are displayed at the top of every page for easy access.
    -->
    <div class="w-full flex justify-between items-center mb-10">
      ${ profileDivDisplay() }    <!-- User profile picture and name -->
      ${ sidebarDisplay() }        <!-- Navigation menu (dashboard, history, friends, etc.) -->
      ${ LogOutBtnDisplay() }      <!-- Logout button -->
    </div>

    <!-- ========================================================================
         PAGE TITLE SECTION
         ========================================================================
         Displays the dashboard title and subtitle.
         Uses translation function t() to support multiple languages.
    -->
    <div class="flex items-center flex-col text-center mb-8">
      <h1 class="text-4xl text-gray-200 font-heading font-bold mb-1">${t("dashboard")}</h1>
      <p class="text-lg text-gray-400 max-w-xl mb-12">${t("dashboardSubtitle")}</p>
    </div>

    <!-- ========================================================================
         DASHBOARD CAROUSEL CONTAINER
         ========================================================================
         This is the main container for the dashboard content.
         It uses a "card" design with a purple glow effect.
         The content inside will change as users navigate through different views.
    -->
    <div class="relative flex justify-center items-center w-full min-h-[60vh]">
      <!-- CARD: The main dashboard card with rounded corners and shadow -->
      <div id="dashboard-card"
        class="bg-slate-900 backdrop-blur-md rounded-2xl w-[90%] max-w-[700px]
          p-6 shadow-[0_0_30px_10px_#7037d3] transition-all duration-300"
        style="min-height: 550px;">
        <!-- CONTENT AREA: Where dashboard views are displayed -->
        <!-- This div will be populated by initDashboard() with different views -->
        <!-- overflow-y-auto allows scrolling if content is too tall -->
        <div id="dashboard-content" class="overflow-y-auto" style="min-height: 500px;">
          <!-- Content will be dynamically inserted here by JavaScript -->
        </div>
      </div>
    </div>

    <!-- ========================================================================
         NAVIGATION ARROWS
         ========================================================================
         These buttons allow users to navigate between dashboard views.
         They are positioned outside the card (fixed position) so they stay visible.
         - Previous arrow: Hidden on first view, shown on others
         - Next arrow: Hidden on last view, shown on others
         - Uses clamp() for responsive font sizing (scales with viewport)
    -->
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

// ============================================================================
// DASHBOARD STATE MANAGEMENT
// ============================================================================

/**
 * CAROUSEL STATE VARIABLES
 * 
 * currentView: Tracks which view is currently displayed (0 = first view, 4 = last view)
 * views: Array of all available dashboard views in order
 *        - "stats": Statistics overview with numbers
 *        - "outcomes": Pie chart showing wins/losses/draws
 *        - "matchTypes": Bar chart showing distribution of match types
 *        - "performance": Line chart showing win rate over time
 *        - "recentMatches": List of recent games
 */
let currentView = 0;
const views = ["stats", "outcomes", "matchTypes", "performance", "recentMatches"];

/**
 * FUNCTION: resetDashboardState()
 * 
 * Purpose: Resets the dashboard to show the first view (Statistics Overview)
 * 
 * This is called by the router when navigating to the dashboard page.
 * It ensures users always start at the first view, not where they left off.
 * 
 * Why this is useful:
 * - Provides consistent experience when navigating to dashboard
 * - Prevents confusion if user was on a different view before
 */
export function resetDashboardState(): void {
  currentView = 0;
}

/**
 * FUNCTION: initDashboard()
 * 
 * Purpose: Initializes the dashboard with user data and sets up the carousel
 * 
 * This function is called AFTER DashboardPage() HTML is inserted into the page.
 * It:
 * 1. Gets user statistics and match history from thisUser (loaded from API)
 * 2. Calculates additional metrics (win rate, average score, win streak, etc.)
 * 3. Sets up the carousel navigation system
 * 4. Renders the first view (Statistics Overview)
 * 
 * NOTE: thisUser comes from the router and contains data fetched from the backend API.
 *       If the user hasn't played any games, default values (0) are used.
 */
export function initDashboard(): void {
  // ========================================================================
  // STEP 1: GET USER DATA
  // ========================================================================
  // Get statistics and match history from the current user
  // If user data doesn't exist or is incomplete, use default values (0)
  // The ?. operator safely accesses properties (won't crash if thisUser is null)
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

  // ========================================================================
  // STEP 2: CALCULATE ADDITIONAL METRICS
  // ========================================================================
  // Extract basic statistics (with fallback to 0 if undefined)
  const gamesPlayed = stats.gamesPlayed || 0;
  const wins = stats.wins || 0;
  const losses = stats.losses || 0;
  const draws = stats.draws || 0;
  const pointsFor = stats.pointsFor || 0;
  const pointsAgainst = stats.pointsAgainst || 0;
  const highestScore = stats.highestScore || 0;
  
  // Calculate derived metrics (metrics computed from basic stats)
  const winStreak = calculateWinStreak(matches);  // Current consecutive wins
  const avgScore = gamesPlayed > 0 ? Math.round(pointsFor / gamesPlayed) : 0;  // Average points per game
  const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : "0.0";  // Win percentage
  const diff = pointsFor - pointsAgainst;  // Point difference (positive = scored more than received)

  // ========================================================================
  // STEP 3: FIND MOST RECENT MATCH DATE
  // ========================================================================
  // Sort matches by date (newest first) and get the most recent one
  // This is displayed in the Statistics Overview to show when data was last updated
  let lastMatchDate: string | null = null;
  if (matches && matches.length > 0) {
    const sortedMatches = [...matches].sort(
      (a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
    );
    lastMatchDate = sortedMatches[0].date || sortedMatches[0].createdAt || null;
  }

  // ========================================================================
  // STEP 4: SETUP CAROUSEL NAVIGATION
  // ========================================================================
  // Pass all the data (stats, matches, calculated metrics) to the carousel setup function
  // This function will handle rendering views and navigation
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

/**
 * FUNCTION: setupDashboardCarousel()
 * 
 * Purpose: Sets up the carousel navigation system for the dashboard
 * 
 * This function:
 * 1. Gets references to HTML elements (content area, card, navigation buttons)
 * 2. Sets up event listeners for previous/next buttons
 * 3. Handles rendering different views based on currentView index
 * 4. Manages arrow button visibility (hide prev on first view, hide next on last view)
 * 5. Positions arrows dynamically based on card position
 * 
 * HOW THE CAROUSEL WORKS:
 * - Users click arrow buttons to navigate between views
 * - Each view shows different information (stats, charts, matches)
 * - The content area is updated with new HTML when view changes
 * - Charts are created after a small delay to ensure canvas elements are ready
 * 
 * @param stats - User statistics from the database
 * @param matches - Array of all user's matches
 * @param calculated - Pre-calculated metrics (win rate, average score, etc.)
 */
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
  // ========================================================================
  // STEP 1: GET HTML ELEMENT REFERENCES
  // ========================================================================
  // These are the DOM elements we'll manipulate:
  // - contentEl: Where dashboard views are displayed
  // - cardEl: The card container (used for positioning arrows)
  // - prevBtn/nextBtn: Navigation arrow buttons
  const contentEl = document.getElementById("dashboard-content");
  const cardEl = document.getElementById("dashboard-card");
  const prevBtn = document.getElementById("dashboard-prev") as HTMLButtonElement | null;
  const nextBtn = document.getElementById("dashboard-next") as HTMLButtonElement | null;

  // Safety check: If any required element is missing, exit early
  // This prevents errors if the HTML structure is wrong
  if (!contentEl || !cardEl || !prevBtn || !nextBtn) return;

  /**
   * FUNCTION: placeArrows()
   * 
   * Purpose: Positions the navigation arrows next to the dashboard card
   * 
   * This function calculates where to place the arrow buttons based on the card's position.
   * It's called:
   * - Initially when dashboard loads
   * - When window is resized (to keep arrows in correct position)
   * - After rendering a new view (in case card size changed)
   * 
   * HOW IT WORKS:
   * - Gets the card's position and size using getBoundingClientRect()
   * - Calculates vertical center (y position)
   * - Places prev arrow to the left of card (with gap)
   * - Places next arrow to the right of card (with gap)
   */
  function placeArrows() {
    if (!cardEl || !prevBtn || !nextBtn) return;

    // Get card's position and dimensions on the page
    const rect = cardEl.getBoundingClientRect();
    const gap = 16;  // Space between card and arrows (in pixels)
    const arrowW = 24;  // Arrow width (for left positioning calculation)
    const y = rect.top + rect.height / 2;  // Vertical center of card

    // Position previous arrow to the left of the card
    prevBtn.style.top = `${y}px`;
    prevBtn.style.left = `${Math.max(0, rect.left - gap - arrowW)}px`;

    // Position next arrow to the right of the card
    nextBtn.style.top = `${y}px`;
    nextBtn.style.left = `${rect.right + gap}px`;
  }

  /**
   * FUNCTION: renderView()
   * 
   * Purpose: Renders the current dashboard view based on currentView index
   * 
   * This function:
   * 1. Determines which view to show based on currentView (0-4)
   * 2. Calls the appropriate render function to generate HTML
   * 3. For chart views, schedules chart creation after a delay (so canvas is ready)
   * 4. Updates the content area with the new HTML
   * 5. Repositions arrows and updates their visibility
   * 
   * WHY THE DELAY FOR CHARTS?
   * - Charts use HTML5 Canvas elements
   * - Canvas elements need to be in the DOM before we can draw on them
   * - setTimeout gives the browser time to render the HTML before we try to draw
   * - 100ms is usually enough for the browser to render
   */
  function renderView() {
    if (!contentEl) return;

    let html = "";
    
    // ========================================================================
    // RENDER APPROPRIATE VIEW BASED ON currentView INDEX
    // ========================================================================
    switch (views[currentView]) {
      case "stats":
        // View 1: Statistics Overview - Shows numbers and metrics in cards
        html = renderStatsView(calculated, stats);
        break;
      case "outcomes":
        // View 2: Game Outcomes - Pie chart showing wins/losses/draws
        html = renderOutcomesView(calculated);
        // Create chart after HTML is rendered (canvas needs to exist first)
        setTimeout(() => createOutcomesChart(calculated.wins, calculated.losses, calculated.draws), 100);
        break;
      case "matchTypes":
        // View 3: Match Types Distribution - Bar chart showing different match types
        html = renderMatchTypesView();
        setTimeout(() => createMatchTypesChart(matches), 100);
        break;
      case "performance":
        // View 4: Performance Over Time - Line chart showing win rate progression
        html = renderPerformanceView();
        setTimeout(() => createPerformanceChart(matches), 100);
        break;
      case "recentMatches":
        // View 5: Recent Matches - List of the 3 most recent games
        html = renderRecentMatchesView(matches);
        break;
    }

    // Update the content area with the new HTML
    contentEl.innerHTML = html;
    
    // Reposition arrows (in case card size changed)
    placeArrows();

    // ========================================================================
    // UPDATE ARROW VISIBILITY
    // ========================================================================
    // Hide previous arrow on first view (can't go back)
    // Hide next arrow on last view (can't go forward)
    if (prevBtn) prevBtn.classList.toggle("hidden", currentView === 0);
    if (nextBtn) nextBtn.classList.toggle("hidden", currentView === views.length - 1);
  }

  // ========================================================================
  // SETUP EVENT LISTENERS FOR NAVIGATION
  // ========================================================================
  
  // Previous button: Go to previous view (if not on first view)
  prevBtn.addEventListener("click", () => {
    if (currentView > 0) {
      currentView--;  // Decrease view index
      renderView();   // Render the new view
    }
  });

  // Next button: Go to next view (if not on last view)
  nextBtn.addEventListener("click", () => {
    if (currentView < views.length - 1) {
      currentView++;  // Increase view index
      renderView();   // Render the new view
    }
  });

  // Window resize: Reposition arrows when window size changes
  // This keeps arrows aligned with the card even if user resizes browser
  window.addEventListener("resize", placeArrows, { passive: true });

  // ========================================================================
  // INITIAL RENDER
  // ========================================================================
  // Render the first view (Statistics Overview) when dashboard loads
  renderView();
}

/**
 * FUNCTION: renderStatsView()
 * 
 * Purpose: Renders the Statistics Overview view (View 1)
 * 
 * This view displays key game statistics in a grid of cards:
 * - Games played and win/loss/draw record
 * - Win rate and point difference
 * - Points for, points against, and highest score
 * - Win streak and average score
 * - Last match date (if available)
 * 
 * The layout uses a responsive grid that adapts to screen size.
 * All text uses clamp() for responsive font sizing.
 * 
 * @param calculated - Pre-calculated metrics (win rate, average score, etc.)
 * @param stats - Raw statistics from the database
 * @returns HTML string for the statistics overview view
 */
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

/**
 * FUNCTION: renderOutcomesView()
 * 
 * Purpose: Renders the Game Outcomes view (View 2) with a pie chart
 * 
 * This view displays:
 * - A donut/pie chart showing the proportion of wins, losses, and draws
 * - Three cards below the chart showing the actual numbers for each outcome
 * 
 * The chart is created by createOutcomesChart() after the HTML is rendered.
 * The canvas element is created here, and the chart is drawn on it later.
 * 
 * @param calculated - Pre-calculated metrics (wins, losses, draws)
 * @returns HTML string for the outcomes view
 */
function renderOutcomesView(calculated: any): string {
  return `
    <div class="space-y-4">
      <h2 class="text-2xl text-gray-200 font-heading font-bold text-center mb-4" style="font-size: clamp(1.25rem, 3vw, 1.75rem);">${t("gameOutcomes")}</h2>
      <!-- Canvas element where the pie chart will be drawn -->
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

/**
 * FUNCTION: renderMatchTypesView()
 * 
 * Purpose: Renders the Match Types Distribution view (View 3) with a bar chart
 * 
 * This view displays a bar chart showing how many matches of each type the user has played:
 * - ONE_VS_ONE (regular matches)
 * - TOURNAMENT_1V1 (tournament preliminary rounds)
 * - TOURNAMENT_INTERMEDIATE (tournament intermediate rounds)
 * - TOURNAMENT_FINAL (tournament final rounds)
 * - AI (matches against AI opponent)
 * 
 * The chart is created by createMatchTypesChart() after the HTML is rendered.
 * 
 * @returns HTML string for the match types view
 */
function renderMatchTypesView(): string {
  return `
    <div class="space-y-4">
      <h2 class="text-2xl text-gray-200 font-heading font-bold text-center mb-4" style="font-size: clamp(1.25rem, 3vw, 1.75rem);">${t("matchTypesDistribution")}</h2>
      <!-- Canvas element where the bar chart will be drawn -->
      <div class="flex justify-center items-center" style="height: 400px;">
        <canvas id="match-types-chart" style="max-width: 100%; max-height: 380px; width: 100%; height: 380px;"></canvas>
      </div>
    </div>
  `;
}

/**
 * FUNCTION: renderPerformanceView()
 * 
 * Purpose: Renders the Performance Over Time view (View 4) with a line chart
 * 
 * This view displays a line chart showing how the user's win rate has changed over time.
 * It shows the last 10 matches and calculates cumulative win rate after each match.
 * 
 * The chart shows:
 * - X-axis: Match number (1, 2, 3, ... up to 10)
 * - Y-axis: Win rate percentage (0% to 100%)
 * - Line: Cumulative win rate progression
 * - Filled area: Visual representation of the win rate trend
 * 
 * The chart is created by createPerformanceChart() after the HTML is rendered.
 * 
 * @returns HTML string for the performance view
 */
function renderPerformanceView(): string {
  return `
    <div class="space-y-4">
      <h2 class="text-2xl text-gray-200 font-heading font-bold text-center mb-4" style="font-size: clamp(1.25rem, 3vw, 1.75rem);">${t("performanceOverTime")}</h2>
      <!-- Canvas element where the line chart will be drawn -->
      <div class="flex justify-center items-center mb-4" style="height: 380px;">
        <canvas id="performance-chart" style="max-width: 100%; max-height: 360px; width: 100%; height: 360px;"></canvas>
      </div>
      <p class="text-xs text-gray-400 text-center" style="font-size: clamp(0.625rem, 1.5vw, 0.75rem);">${t("showingLastMatches")}</p>
    </div>
  `;
}

/**
 * FUNCTION: renderRecentMatchesView()
 * 
 * Purpose: Renders the Recent Matches view (View 5) showing the 3 most recent games
 * 
 * This view displays:
 * - The 3 most recent matches (sorted by date, newest first)
 * - For each match: opponent name, avatar, match type, date, score, and result
 * - A link to view full match history
 * 
 * If the user has no matches, it shows a message encouraging them to play.
 * 
 * @param matches - Array of all user's matches
 * @returns HTML string for the recent matches view
 */
function renderRecentMatchesView(matches: any[]): string {
  // If user has no matches, show a message encouraging them to play
  if (!matches || matches.length === 0) {
    return `
      <div class="text-center text-gray-400 py-12">
        <p class="text-xl mb-3" style="font-size: clamp(1rem, 2.5vw, 1.5rem);">${t("noMatchesYet")}</p>
        <p class="text-base mb-4" style="font-size: clamp(0.875rem, 2vw, 1rem);">${t("startPlayingHistory")}</p>
        <a href="#intro" class="text-purple-400 hover:text-purple-300 underline" style="font-size: clamp(0.875rem, 2vw, 1rem);">${t("playArcadeClashCta")}</a>
      </div>
    `;
  }

  // Get the 3 most recent matches
  // Sort by date (newest first) and take the first 3
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

/**
 * FUNCTION: calculateWinStreak()
 * 
 * Purpose: Calculates the current win streak (consecutive wins)
 * 
 * HOW IT WORKS:
 * 1. Sorts matches by date (most recent first)
 * 2. Goes through matches from newest to oldest
 * 3. Counts consecutive wins starting from the most recent match
 * 4. Stops counting when it encounters a loss or draw
 * 
 * EXAMPLES:
 * - If last 3 matches were wins: streak = 3
 * - If last match was a loss: streak = 0
 * - If last match was a draw, then 2 wins before: streak = 2 (draw doesn't break streak)
 * 
 * NOTE: A draw doesn't break the streak, but it also doesn't count as a win.
 *       Only consecutive wins count toward the streak.
 * 
 * @param matches - Array of all user's matches
 * @returns The number of consecutive wins (starting from most recent match)
 */
function calculateWinStreak(matches: any[]): number {
  // If no matches, streak is 0
  if (!matches || matches.length === 0) return 0;

  // Sort matches by date (most recent first)
  // We need to check from newest to oldest to find the current streak
  const sortedMatches = [...matches].sort((a, b) => 
    new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
  );

  let streak = 0;
  
  // Go through matches from most recent to oldest
  for (const match of sortedMatches) {
    // Determine if current user was player 1 or player 2
    const isPlayer1 = match.player1Id === thisUser.id;
    const playerScore = isPlayer1 ? match.player1Score : match.player2Score;
    const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;

    if (match.winnerId === thisUser.id) {
      // User won this match - increment streak
      streak++;
    } else if (match.winnerId === null || match.winnerId === 0) {
      // Draw - streak continues but doesn't increase
      // We continue to the next match (don't break the streak)
      continue;
    } else {
      // User lost this match - streak breaks
      // Stop counting and return current streak
      break;
    }
  }

  return streak;
}

/**
 * FUNCTION: createOutcomesChart()
 * 
 * Purpose: Creates a donut/pie chart showing game outcomes (wins, losses, draws)
 * 
 * HOW IT WORKS:
 * 1. Gets the canvas element from the DOM
 * 2. Sets up the canvas size and drawing context
 * 3. Calculates angles for each segment based on proportions
 * 4. Draws each segment as a donut slice (arc with inner radius)
 * 5. Uses different colors for wins (purple), losses (red), and draws (gray)
 * 
 * CHART TYPE: Donut chart (pie chart with a hole in the center)
 * - Each segment represents the proportion of that outcome
 * - Size of segment = (outcome count / total games) * 360 degrees
 * 
 * @param wins - Number of games won
 * @param losses - Number of games lost
 * @param draws - Number of games that ended in a draw
 */
function createOutcomesChart(wins: number, losses: number, draws: number): void {
  // Get the canvas element where we'll draw the chart
  const canvas = document.getElementById("outcomes-chart") as HTMLCanvasElement;
  if (!canvas) return;

  // Get the 2D drawing context (needed to draw on canvas)
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Handle empty data - don't render chart if user hasn't played any games
  if (wins === 0 && losses === 0 && draws === 0) {
    return; // Don't render chart if no data
  }

  // Small delay to ensure canvas is fully rendered in the DOM
  // This prevents errors if we try to draw before the canvas is ready
  setTimeout(() => {
    if (!canvas || !ctx) return;

    // ========================================================================
    // SETUP CANVAS AND CALCULATE DIMENSIONS
    // ========================================================================
    // Set canvas to a square size (smaller dimension to keep it circular)
    const size = Math.min(400, 300);
    canvas.width = size;
    canvas.height = size;

    // Calculate center point and radii for the donut chart
    const centerX = size / 2;  // Horizontal center
    const centerY = size / 2;   // Vertical center
    const radius = size * 0.35;      // Outer radius (35% of canvas size)
    const innerRadius = size * 0.2;  // Inner radius (20% of canvas size) - creates the "hole"
    const total = wins + losses + draws;  // Total games for calculating proportions

    // ========================================================================
    // DEFINE COLORS FOR EACH OUTCOME
    // ========================================================================
    // Each outcome gets a different color for visual distinction
    const colors = [
      { fill: "rgba(124, 58, 237, 0.8)", stroke: "rgba(124, 58, 237, 1)" }, // purple for wins
      { fill: "rgba(239, 68, 68, 0.8)", stroke: "rgba(239, 68, 68, 1)" }, // red for losses
      { fill: "rgba(156, 163, 175, 0.8)", stroke: "rgba(156, 163, 175, 1)" } // gray for draws
    ];

    const data = [wins, losses, draws];
    let currentAngle = -Math.PI / 2; // Start at top (12 o'clock position)

    // ========================================================================
    // DRAW EACH SEGMENT OF THE DONUT CHART
    // ========================================================================
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      if (!value || value === 0) continue;  // Skip if this outcome has no games

      const color = colors[i];
      if (!color) continue;

      // Calculate the angle this segment should occupy
      // Formula: (value / total) * 2π radians (full circle)
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

/**
 * FUNCTION: createMatchTypesChart()
 * 
 * Purpose: Creates a bar chart showing the distribution of match types
 * 
 * HOW IT WORKS:
 * 1. Counts how many matches of each type the user has played
 * 2. Creates a bar chart with one bar for each match type
 * 3. Bar height represents the number of matches of that type
 * 4. Draws grid lines, labels, and values on top of bars
 * 
 * CHART TYPE: Bar chart (vertical bars)
 * - X-axis: Match types (ONE_VS_ONE, TOURNAMENT_1V1, etc.)
 * - Y-axis: Number of matches
 * - Each bar shows how many matches of that type were played
 * 
 * @param matches - Array of all user's matches
 */
function createMatchTypesChart(matches: any[]): void {
  // Get the canvas element where we'll draw the chart
  const canvas = document.getElementById("match-types-chart") as HTMLCanvasElement;
  if (!canvas) return;

  // Get the 2D drawing context
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // ========================================================================
  // COUNT MATCH TYPES
  // ========================================================================
  // Go through all matches and count how many of each type exist
  const typeCounts: { [key: string]: number } = {};
  matches.forEach(match => {
    const type = match.type || "UNKNOWN";
    typeCounts[type] = (typeCounts[type] || 0) + 1;  // Increment count for this type
  });

  const labels = Object.keys(typeCounts);  // Array of match type names
  const data = Object.values(typeCounts);   // Array of counts for each type

  // Handle empty data - don't render chart if user has no matches
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

/**
 * FUNCTION: createPerformanceChart()
 * 
 * Purpose: Creates a line chart showing win rate progression over time
 * 
 * HOW IT WORKS:
 * 1. Takes the last 10 matches (sorted by date, oldest first)
 * 2. Calculates cumulative win rate after each match
 * 3. Plots these win rates as points on a line chart
 * 4. Draws a smooth curve connecting the points
 * 5. Fills the area under the curve for visual effect
 * 
 * CHART TYPE: Line chart with filled area
 * - X-axis: Match number (1, 2, 3, ... up to 10)
 * - Y-axis: Win rate percentage (0% to 100%)
 * - Line: Shows how win rate changes as more matches are played
 * 
 * CUMULATIVE WIN RATE:
 * After each match, we calculate: (total wins so far / total matches so far) * 100
 * This shows how the user's overall performance changes over time.
 * 
 * @param matches - Array of all user's matches
 */
function createPerformanceChart(matches: any[]): void {
  // Get the canvas element where we'll draw the chart
  const canvas = document.getElementById("performance-chart") as HTMLCanvasElement;
  if (!canvas) return;

  // Get the 2D drawing context
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // ========================================================================
  // PREPARE DATA: GET LAST 10 MATCHES
  // ========================================================================
  // Sort matches by date (oldest first) and take the last 10
  // This shows the most recent progression
  const sortedMatches = [...matches]
    .sort((a, b) => new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime())
    .slice(-10); // Last 10 matches

  // Handle empty data - don't render chart if user has no matches
  if (sortedMatches.length === 0) {
    return; // Don't render chart if no data
  }

  // ========================================================================
  // CALCULATE CUMULATIVE WIN RATE OVER TIME
  // ========================================================================
  // For each match, calculate the win rate up to that point
  // Example: After match 1 (win) = 100%, after match 2 (loss) = 50%, etc.
  const winRates: number[] = [];
  let totalWins = 0;
  let totalMatches = 0;

  sortedMatches.forEach(match => {
    totalMatches++;
    if (match.winnerId === thisUser.id) {
      totalWins++;
    }
    // Calculate win rate as percentage: (wins / total matches) * 100
    const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
    winRates.push(winRate);  // Store this win rate for plotting
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

/**
 * FUNCTION: getMatchTypeLabel()
 * 
 * Purpose: Converts match type code to a human-readable label
 * 
 * This function translates internal match type codes (like "ONE_VS_ONE")
 * into user-friendly labels that can be displayed in the UI.
 * 
 * It uses the translation function t() to support multiple languages.
 * 
 * @param type - Match type code (e.g., "ONE_VS_ONE", "TOURNAMENT_FINAL")
 * @returns Translated, human-readable label for the match type
 */
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
      // If type is unknown, return it as-is (fallback)
      return type;
  }
}