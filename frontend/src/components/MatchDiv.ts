import { thisUser } from "../router"
import { formatDate } from "../utils"

// Map database enum values to human-readable titles
function getMatchTypeDisplay(type: string): string {
  switch (type) {
    case 'ONE_VS_ONE':
      return '1 vs 1 Match';
    case 'TOURNAMENT_1V1':
      return '1v1 Tournament';
    case 'TOURNAMENT_INTERMEDIATE':
      return 'Tournament Match';
    case 'TOURNAMENT_FINAL':
      return 'Tournament Final';
    case 'AI':
      return 'AI Match';
    default:
      return type;
  }
}

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
		<h1 class="text-xl font-semibold text-gray-200 mb-2">${ getMatchTypeDisplay(match.type) }</h1>
		<p class="text-gray-400 mb-10">${ formatDate(match.date, 'S') }</p>

	<!-- Players vertical cards -->
		<div class="flex justify-center" style="gap: clamp(0.5rem, 4vw, 2rem);">

			${ playerCard(match, getSpecialPlayer(match.player1, match), match.player1Score) }

	<!-- VS Divider -->
			<div class="flex items-center">
				<span class="text-3xl font-bold text-gray-300">VS</span>
			</div>

			${ playerCard(match, getSpecialPlayer(match.player2, match), match.player2Score) }

		</div>
	</div>
	`;
}

// Players sub cards - tweaks elements according to winner/loser + friendship status
function playerCard(match: any, player: any, score: number)
{
	let winstatus = getWinner(match, player);

	let crown = '';
	if (winstatus.includes('Winner'))
		crown = `<div class="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10" style="font-size: clamp(1rem, 2vw, 1.875rem);">👑</div>`

	let befriendButton = checkFriendCondition(player.id);

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

// Gets winner + determines winner/loser/draw for current player
function getWinner(match: any, player: any)
{
	let winnerId = 0; // draw

	if (match.player1Score > match.player2Score)
		winnerId = match.player1.id;
	else if (match.player1Score < match.player2Score)
		winnerId = match.player2.id;

	if (winnerId === 0)
		return `<h3 class="text-gray-200 font-bold text-lg mb-4">Draw</h3>`;

	if (winnerId != player.id)
		return `<h3 class="text-gray-200 font-bold text-lg mb-4">Loser</h3>`;

	return `<h3 class="text-gray-200 font-bold text-lg mb-4" style="text-shadow: 0 0 2px #000, 0 0 4px #000, 0 0 8px #4c1d95, 0 0 16px #7c22ce, 0 0 24px #7c22ce;">Winner</h3>`;

}

// Checks if "Befriend" conditions are applicable
function checkFriendCondition(playerId: number)
{
	if (playerId > 0 && playerId !== thisUser.id && !thisUser.friendOf.some((friend: any) => friend.id === playerId))
	{
		if (!thisUser.friends.some((friend: any) => friend.id === playerId))
			return `<div class="flex justify-end gap-3 mt-6">
					<button id="befriend--${ playerId }" class="px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 cursor-pointer">Befriend</button>
				</div>`;
		else
			return `<div class="flex justify-end gap-3 mt-6">
					<p class="px-6 py-2 bg-[#4a3866]/60 text-[#a89cc6] rounded-lg">Request sent</p>
				</div>`;
	}

	return '';
}

// Returns fields applicable for Guest or AI player display
function getSpecialPlayer(player: any, match: any)
{
	if (player.id == null)
	{
		if (match.type == "AI Match")
			return { id: -1, name: "AI Opponent", profilePicture: "/assets/ai-avatar.jpeg" };
		return { id: -2, name: "Guest", profilePicture: "/assets/guest-avatar.jpeg" };
	}

	return player;
}
