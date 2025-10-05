import { thisUser } from "../router"
import { addTheme } from "../components/Theme"
import { profileDivDisplay } from "../components/ProfileDiv"
import { sidebarDisplay } from "../components/SideBar"
import { LogOutBtnDisplay } from "../components/LogOutBtn"

export function loadMatches()
{
	let userMatches = thisUser.matches;
	if (!userMatches || userMatches.length === 0)
		return noHistory();

	let cards = '';
	for (let i = 0; i < userMatches.length; i++)
	{
			//if (i === 0)
			// remove "<" arrow button
			//if (i == thisUser.matches.length)
			// remove ">" arrow button
		cards += matchCard(userMatches[i]);
	}

	return (cards);
}

// No friend div appearance
function noHistory()
{
	return `
	</div>
	<div flex items-center>
	<br>
		<h3 class="text-2xl text-gray-400 text-center font-bold mb-5">No previous matches</h3>
		<h1 class="text-7xl text-gray-400 text-center font-bold mb-1">:'(</h1>
	</div>
	<div>`;
}

function playerCard(match: any, player: any, score: number)
{
	let winstatus = '';
	let crown = '';
	let befriendButton = ''

	console.log(`WINNER IS ${ match.winnerId}`);
	if (match.winnerId == 0)
		winstatus = `<h3 class="text-gray-200 font-bold text-lg mb-4">Draw</h3>`;
	else if (match.winnerId != player.id)
		winstatus = `<h3 class="text-gray-200 font-bold text-lg mb-4">Loser</h3>`;
	else
	{
		winstatus = `<h3 class="text-gray-200 font-bold text-lg mb-4" style="text-shadow: 0 0 2px #000, 0 0 4px #000, 0 0 8px #4c1d95, 0 0 16px #7c22ce, 0 0 24px #7c22ce;">Winner</h3>`
		crown = `<div class="text-3xl absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">👑</div>`
	}

	if (player === thisUser)
		befriendButton = `<div class="flex justify-end gap-3 mt-6">
					<button data-action="accept" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">Befriend</button>
				</div>`;

	return `
		<div class="bg-[#32274a] backdrop-blur-md rounded-2xl p-6 w-[280px] relative">
				${ winstatus }
			<div class="relative mb-4">
				${ crown }
				<img src="${player.profilePicture}" alt="Player Avatar" class="w-24 h-24 rounded-full mx-auto">
			</div>
		<h4 class="text-purple-600 font-semibold text-lg mb-2">${player.name}</h4>
		<div class="text-2xl font-bold text-gray-200">${ score }</div>
			${ befriendButton }
		</div>`;
}

function matchCard(match: any)
{
	return `
	<div id="match-card"
	class="bg-[#271d35] backdrop-blur-md rounded-2xl w-[700px] p-6 z-50
	shadow-[0_0_30px_10px_#7037d3]
	text-center
	transition duration-300 scale-95"
	style="position: fixed; top: 50%; left: 50%;
	transform: translate(-50%, -50%); z-index: 50;">

	<!-- Match Info Header -->
		<h1 class="text-xl font-semibold text-gray-200 mb-2">Tournament Match</h1>
		<p class="text-gray-400 mb-10">04/10/2025 15:45:02</p>

	<!-- Players vertical cards -->
		<div class="flex justify-center gap-8">

			${ playerCard(match, match.player1, match.player1Score) }

	<!-- VS Divider -->
			<div class="flex items-center">
				<span class="text-3xl font-bold text-gray-300">VS</span>
			</div>

			${ playerCard(match, match.player2, match.player2Score) }

		</div>
	</div>
	`;
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

	<button id="prev-match"
	class="text-6xl text-gray-300 hover:text-white cursor-pointer font-bold"
	style="position: fixed; top: 50%; left: 28%; transform: translateY(-50%); z-index: 51;">
	‹</button>
		${ loadMatches() }

	<button id="prev-match"
	class="text-6xl text-gray-300 hover:text-white cursor-pointer font-bold"
	style="position: fixed; top: 50%; right: 28%; transform: translateY(-50%); z-index: 51;">
	›</button>`;
}
