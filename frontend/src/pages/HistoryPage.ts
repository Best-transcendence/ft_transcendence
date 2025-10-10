import { thisUser, protectedPage } from "../router"
import { addFriend } from "../services/friendsActions"
import { addTheme } from "../components/Theme"
import { profileDivDisplay } from "../components/ProfileDiv"
import { sidebarDisplay } from "../components/SideBar"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { matchCard, noHistory } from "../components/MatchDiv"

let currentMatch = 0;

export function loadMatches()
{
	let userMatches = thisUser.matches;
	if (!userMatches || userMatches.length === 0)
		return noHistory();

	return matchCard(userMatches[currentMatch]);
}

function slideMatches(direction: 'prev' | 'next')
{
	const matchCard = document.getElementById('match-card');
	matchCard?.classList.add('opacity-0', 'scale-95');

	setTimeout(() =>
	{
		if (direction === 'prev' && currentMatch > 0)
			currentMatch--;
		else if (direction === 'next' && currentMatch < thisUser.matches.length -1)
			currentMatch++;
		protectedPage(() => HistoryPage(), matchesEvents);
	}, 200);
}

export function matchesEvents()
{
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
	if (currentMatch <= 0 || thisUser.matches.length == 0)
		return '';

	return `<button id="prev-match"
	class="text-6xl text-gray-300 hover:text-white cursor-pointer font-bold"
	style="position: fixed; top: clamp(4rem, 50%, calc(100vh - 4rem)); left: calc(50% - 14vw - 9rem); transform: translateY(-50%); z-index: 51; font-size: clamp(1.5rem, 8vw, 3.75rem);">
	‹</button>`;
}

function rightArrow()
{
	if (currentMatch == thisUser.matches.length -1 || thisUser.matches.length === 0)
		return '';

	return `<button id="next-match"
	class="text-6xl text-gray-300 hover:text-white cursor-pointer font-bold"
	style="position: fixed; top: clamp(4rem, 50%, calc(100vh - 4rem)); right: calc(50% - 14vw - 9rem); transform: translateY(-50%); z-index: 51; font-size: clamp(1.5rem, 8vw, 3.75rem);">

	›</button>`;
}

export function HistoryPage()
{
	return `<!-- Theme -->
			${ addTheme() }

	<!-- Header with user info -->
		<div class="w-full
			flex justify-between items-center
			mb-10">

	<!-- Protected pages components -->
			${ profileDivDisplay() }
			${ sidebarDisplay() }
			${ LogOutBtnDisplay() }
		</div>

	<!-- Title -->
		<div class="flex flex-col items-center mb-8">
			<h1 class="text-4xl text-gray-200 text-center font-heading font-bold mb-1">Match History</h1>
			<p class="text-lg text-gray-400 max-w-xl text-center mb-8">
			Let's take a trip down Memory Lane!</p>
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
