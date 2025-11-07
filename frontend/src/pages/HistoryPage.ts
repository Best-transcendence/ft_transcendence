import { thisUser, protectedPage } from "../router"
import { addFriend } from "../services/friendsActions"
import { addTheme } from "../components/Theme"
import { profileDivDisplay } from "../components/ProfileDiv"
import { sidebarDisplay } from "../components/SideBar"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { matchCard, noHistory } from "../components/MatchDiv"
import { t } from "../services/lang/LangEngine";
import { LanguageSwitcher } from "../services/lang/LanguageSwitcher";

// Track current match index (reset to 0 on fresh page load)
let currentMatch = 0;
let isNavigating = false; // Flag to track if we're navigating within the page

// Track if this is the first load of the page (not a prev/next navigation)
// This gets reset to true when router navigates to history page
let isFirstLoad = true;

// Export function to reset first load flag (called by router)
export function resetHistoryPageState() {
	isFirstLoad = true;
	isNavigating = false;
	currentMatch = 0;
}

export function loadMatches()
{
	// Reset to latest match (index 0) on fresh page load (first call or not navigating)
	if (isFirstLoad || !isNavigating) {
		currentMatch = 0;
		isNavigating = false;
		isFirstLoad = false; // Mark that we've loaded once
	}
	
	let userMatches = thisUser.matches;
	
	if (!userMatches || userMatches.length === 0)
		return noHistory();

	// Ensure currentMatch is within valid bounds
	if (currentMatch >= userMatches.length)
		currentMatch = userMatches.length - 1;
	if (currentMatch < 0)
		currentMatch = 0;

	return matchCard(userMatches[currentMatch]);
}

function slideMatches(direction: 'prev' | 'next')
{
	const matchCard = document.getElementById('match-card');
	matchCard?.classList.add('opacity-0', 'scale-95');

	setTimeout(async () =>
	{
		const matchesLength = thisUser.matches?.length || 0;
		if (direction === 'prev' && currentMatch > 0) {
			currentMatch--;
		} else if (direction === 'next' && currentMatch < matchesLength - 1) {
			currentMatch++;
		}

		isNavigating = true; // Set flag before navigation
		await protectedPage(() => HistoryPage(), matchesEvents);
		isNavigating = false; // Reset flag after navigation completes
	}, 200);
}

export function matchesEvents()
{
	// Reset firstLoad flag so next time we load we know it's a fresh navigation
	isFirstLoad = false;
	
	document.getElementById('prev-match')?.addEventListener('click', () => slideMatches('prev'));
	document.getElementById('next-match')?.addEventListener('click', () => slideMatches('next'));
	document.getElementById('play-arcade-clash')?.addEventListener('click', () => window.location.hash = "intro");

	document.querySelectorAll('button[id^="befriend--"]').forEach(btn =>
	{
		btn.addEventListener('click', () =>
		{
			const friendId = btn.id.split('--')[1];
			if (!friendId)
				return ;
			addFriend(friendId, () => protectedPage(() => HistoryPage(), matchesEvents));
		});
	});
}

function leftArrow()
{
	if (currentMatch <= 0 || !thisUser.matches || thisUser.matches.length == 0)
		return '';

	return `<button id="prev-match"
	class="text-6xl text-gray-300 hover:text-white cursor-pointer font-bold fixed"
	style="top: clamp(4rem, 50%, calc(100vh - 4rem)); left: calc(50% - 14vw - 9rem); transform: translateY(-50%); z-index: 10; font-size: clamp(1.5rem, 8vw, 3.75rem);">
	‹</button>`;
}

function rightArrow()
{
	if (currentMatch == (thisUser.matches?.length ?? 0) - 1 || !thisUser.matches || thisUser.matches.length === 0)
		return '';

	return `<button id="next-match"
	class="text-6xl text-gray-300 hover:text-white cursor-pointer font-bold fixed"
	style="top: clamp(4rem, 50%, calc(100vh - 4rem)); right: calc(50% - 14vw - 9rem); transform: translateY(-50%); z-index: 10; font-size: clamp(1.5rem, 8vw, 3.75rem);">

	›</button>`;
}

export function HistoryPage()
{
	return `<!-- Theme -->
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
		<div class="flex flex-col items-center mb-8">
			<h1 class="text-4xl text-gray-200 text-center font-heading font-bold mb-1">${t("matchHistoryTitle")}</h1>
			<p class="text-lg text-gray-400 max-w-xl text-center mb-8">
				${t("matchHistorySubtitle")}
			</p>
		</div>

<!-- Match section - like the arcade game section -->
		<div class="flex justify-center w-full">
			<div class="relative">
			${ leftArrow() }
			${ loadMatches() }
			${ rightArrow() }
			</div>
		</div>`;
}
