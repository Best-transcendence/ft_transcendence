import { thisUser } from "../router"
import { formatDate } from "../utils"

// No friend div appearance + button to go back to #intro page
export function noHistory()
{
	return `
	<div class="flex flex-col items-center justify-center">
	<br>
		<h3 class="text-2xl text-gray-400 text-center font-bold mb-5">No previous matches</h3>
		<button id="play-arcade-clash"
			class="px-6 py-3 rounded-xl font-semibold text-gray-200 transition hover:shadow cursor-pointer bg-[var(--color-button)] hover:bg-[var(--color-button-hover)]">
			Play Arcade Clash
		</button>
	</div>`;
}

// Match card display
export function matchCard(match: any)
{
	return `
	<div id="match-card"
	class="bg-[#271d35] rounded-2xl w-[36vw] min-w-[380px] p-6 z-50
	shadow-[0_0_30px_10px_#7037d3]
	text-center
	transform transition-all duration-500 ease-in-outanimate-slide-in"
	style="position: fixed; top: 50%; left: 50%;
	transform: translate(-50%, -50%); z-index: 50;
	transition: all 0.3s ease-in-out;">

	<!-- Match Info Header -->
		<h1 class="text-xl font-semibold text-gray-200 mb-2">${ match.type }</h1>
		<p class="text-gray-400 mb-10">${ formatDate(match.date, 'S') }</p>

	<!-- Players vertical cards -->
		<div class="flex justify-center" style="gap: clamp(0.5rem, 4vw, 2rem);">

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

// Players sub cards - tweaks elements according to winner/loser + friendship status
function playerCard(match: any, player: any, score: number)
{
	let winstatus = '';
	let crown = '';
	let befriendButton = ''

	if (match.winnerId == 0)
		winstatus = `<h3 class="text-gray-200 font-bold text-lg mb-4">Draw</h3>`;
	else if (match.winnerId != player.id)
		winstatus = `<h3 class="text-gray-200 font-bold text-lg mb-4">Loser</h3>`;
	else
	{
		winstatus = `<h3 class="text-gray-200 font-bold text-lg mb-4" style="text-shadow: 0 0 2px #000, 0 0 4px #000, 0 0 8px #4c1d95, 0 0 16px #7c22ce, 0 0 24px #7c22ce;">Winner</h3>`
		crown = `<div class="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10" style="font-size: clamp(1rem, 2vw, 1.875rem);">👑</div>`

	}

	if (player.id !== thisUser.id && !thisUser.friendOf.some((friend: any) => friend.id === player.id))
	{
		if (!thisUser.friends.some((friend: any) => friend.id === player.id))
		{
			befriendButton = `<div class="flex justify-end gap-3 mt-6">
					<button id="befriend--${ player.id }" class="px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 cursor-pointer">Befriend</button>
				</div>`;
		}
		else
		{
			befriendButton = `<div class="flex justify-end gap-3 mt-6">
					<p class="px-6 py-2 bg-[#4a3866]/60 text-[#a89cc6] rounded-lg">Request sent</p>
				</div>`;
		}
	}

	return `
		<div class="bg-[#32274a] backdrop-blur-md rounded-2xl p-6 w-[20vw] min-w-[120px] relative">
				${ winstatus }
			<div class="relative mb-4">
				${ crown }
				<img src="${player.profilePicture}" alt="Player Avatar" class="w-[6vw] h-[6vw] min-w-12 min-h-12 max-w-24 max-h-24 rounded-full mx-auto">
			</div>
		<h4 class="text-purple-600 font-semibold text-lg mb-2">${player.name}</h4>
		<div class="text-2xl font-bold text-gray-200">${ score }</div>
			${ befriendButton }
		</div>`;
}
