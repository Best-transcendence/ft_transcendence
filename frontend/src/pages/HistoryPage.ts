import { thisUser, protectedPage } from "../router"
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
		protectedPage(() => HistoryPage(), slideEvents);
	}, 150);
}

export function slideEvents()
{
	document.getElementById('prev-match')?.addEventListener('click', () => slideMatches('prev'));
	document.getElementById('next-match')?.addEventListener('click', () => slideMatches('next'));
}

function leftArrow()
{
	if (currentMatch <= 0)
		return '';

	return `<button id="prev-match"
	class="text-6xl text-gray-300 hover:text-white cursor-pointer font-bold"
	style="position: fixed; top: 50%; left: 28%; transform: translateY(-50%); z-index: 51;">
	‹</button>`;
}

function rightArrow()
{
	if (currentMatch == thisUser.matches.length -1)
		return '';

	return `<button id="next-match"
	class="text-6xl text-gray-300 hover:text-white cursor-pointer font-bold"
	style="position: fixed; top: 50%; right: 28%; transform: translateY(-50%); z-index: 51;">
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
	<div flex items-center>
		<h1 class="text-4xl text-gray-200 text-center font-heading font-bold mb-1">Match History</h1>
		<p class="text-lg text-gray-400 max-w-xl text-center mb-24">
			Let's take a trip down Memory Lane!
		</p>
	</div>

		${ leftArrow() }

		${ loadMatches() }

		${ rightArrow() }`;
}
