import { formatDate } from "../utils"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { profilePopup , inputPopup } from "../components/Popups"
import { thisUser, fetchUser } from "../router"
import { addTheme } from "../components/Theme"
import { t } from "../services/lang/LangEngine";
import { LanguageSwitcher } from "../services/lang/LanguageSwitcher";

// Manages Profile page display
export function ProfilePage()
{
	return `
<!-- Theme -->
		${ addTheme() }

<!-- Header with user info -->
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

<!-- Title -->
	<div flex items-center>
		<h1 class="text-4xl text-gray-200 text-center font-heading font-bold mb-1">Profile</h1>
		<p class="text-lg text-gray-400 max-w-xl text-center mb-16">
			${t("profileSubtitle")}
		</p>
	</div>

<!-- Profile header -->
	<div class="flex flex-col items-center gap-3 mb-10 ">
		<div class="rounded-full shadow-[0_0_30px_10px_#7037d3]"
			style="position: relative;
				display: inline-block; inline-block; width: 11vw; height: 11vw; min-width: 120px; min-height: 120px;">
		<img id="profile-picture" src="${thisUser.profilePicture}"
				alt="Profile Picture"
				class="rounded-full"
				style="width: 100%; height: 100%;"/>
				<button id="edit-pic-button"
				style="position: absolute; bottom: 0px; right: 0px;"
				onclick>🖍</button>
		  </div>
		<div class="flex items-center gap-1.5">
			<h1 id="profile-name" class="text-2xl font-semibold text-gray-200">
			${thisUser.name}
			</h1>
			<button id="edit-name-button" class="ml-1.5" onclick>🖍</button>
			</p>
		</div>
		<div class="flex items-center gap-1.5">
			<p id="profile-bio" class="text-gray-300">
				<i>${thisUser.bio}</i>
			</p>
			<button id="edit-bio-button" class="ml-1.5" onclick>🖍</button>
		</div>
	</div>
	${ profilePopup() }

<!-- Profile info card -->
	<div class="bg-slate-900 backdrop-blur-md
	rounded-2xl w-[100%] max-w-[500px] p-6 space-y-6 shadow-[0_0_30px_10px_#7037d3]">

<!-- Username -->
		<div class="flex justify-between items-center">
			<span class="text-gray-300 font-medium">${t("username")}</span>
			<span id="profile-name-card" class="text-white">${thisUser.name}</span>

		</div>

<!-- Email -->
		<div class="flex justify-between items-center">
			<span class="text-gray-300 font-medium">${t("email")}</span>
			<span class="text-white">${thisUser.email}</span>
		</div>

<!-- Join Date -->
		<div class="flex justify-between items-center">
			<span class="text-gray-300 font-medium">${t("memberSince")}</span>
			<span class="text-white">${formatDate(thisUser.createdAt || new Date().toISOString(), "M")}</span>
		</div>

	</div>
	${ inputPopup() }

	<!-- Game Statistics -->
		<!-- Game Statistics (single-stat carousel, starts on Wins) -->
	<div class="relative flex justify-center items-center w-full mt-6">

	<!-- CARD -->
	<div id="stats-card"
		class="bg-slate-900 backdrop-blur-md rounded-2xl w-[100%] max-w-[500px]
				p-6 shadow-[0_0_30px_10px_#7037d3]">
		<div class="flex justify-between items-center min-h-[70px] px-8">
		<span id="stat-label" class="text-gray-300 font-medium">Wins</span>
		<span id="stat-value" class="text-white font-semibold">
			${thisUser.stats?.wins ?? 0}
		</span>
		</div>
	</div>
	</div>

	<!--  Arrows as FIXED (not inside the card wrapper) -->
	<button id="stats-prev"
	type="button"
	class="fixed text-3xl text-gray-400 hover:text-white hidden z-40"
	aria-label="Previous">‹</button>

	<button id="stats-next"
	type="button"
	class="fixed text-3xl text-gray-400 hover:text-white z-40"
	aria-label="Next">›</button>`;
}

type UserStats = {
  wins?: number;
  losses?: number;
  draws?: number;
  gamesPlayed?: number;
  highestScore?: number;
  pointsFor?: number;
  pointsAgainst?: number;
};

export function profileStatsEvents() {
  const stats = (thisUser?.stats ?? {}) as UserStats;

  const items: { label: string; value: number }[] = [
	{ label: t("wins"),          value: stats.wins || 0 },
	{ label: t("losses"),        value: stats.losses || 0 },
	{ label: t("draws"),         value: stats.draws || 0 },
	{ label: t("gamesPlayed"),   value: stats.gamesPlayed || 0 },
	{ label: t("bestScore"),     value: stats.highestScore || 0 },
	{ label: t("pointsFor"),     value: stats.pointsFor || 0 },
	{ label: t("pointsAgainst"), value: stats.pointsAgainst || 0 },
  ];

  let i = 0;
  const labelEl = document.getElementById("stat-label");
  const valueEl = document.getElementById("stat-value");
  const prevBtn = document.getElementById("stats-prev") as HTMLButtonElement | null;
  const nextBtn = document.getElementById("stats-next") as HTMLButtonElement | null;
  const cardEl  = document.getElementById("stats-card");

function placeArrows() {
  if (!cardEl || !prevBtn || !nextBtn) return;
  const rect = cardEl.getBoundingClientRect();

  const gap = 8;      // px gap between arrow and card edge
  const arrowW = 18;  // approx width of ‹ ›

  // vertical center of card (not viewport), adjusted slightly up
  const y = rect.top + rect.height / 2 - 20;

  // left arrow
  prevBtn.style.top = `${y}px`;
  prevBtn.style.left = `${Math.max(0, rect.left - gap - arrowW)}px`;

  // right arrow
  nextBtn.style.top = `${y}px`;
  nextBtn.style.left = `${rect.right + gap}px`;
}

  function render() {
    if (!labelEl || !valueEl) return;
    labelEl.textContent = items[i].label;
    valueEl.textContent = String(items[i].value);

    // show/hide like your history page
    prevBtn?.classList.toggle("hidden", i === 0);
    nextBtn?.classList.toggle("hidden", i === items.length - 1);

    // reposition arrows for current layout
    placeArrows();
  }

  prevBtn?.addEventListener("click", () => { if (i > 0) { i--; render(); } });
  nextBtn?.addEventListener("click", () => { if (i < items.length - 1) { i++; render(); } });

  // Keep arrows stuck to the card on resize
  window.addEventListener("resize", placeArrows, { passive: true });

  render(); // show Wins first + place arrows
}