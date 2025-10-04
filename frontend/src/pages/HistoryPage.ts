import { thisUser } from "../router"
import { addTheme } from "../components/Theme"
import { profileDivDisplay } from "../components/ProfileDiv"
import { sidebarDisplay } from "../components/SideBar"
import { LogOutBtnDisplay } from "../components/LogOutBtn"

function winnerCrown(/* match: any */)
{
	/* if (match.winner != thisUser.id)
		return ``; */

	return `
	<div class="text-3xl absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
	👑</div>`;
}

function matchCard()
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

	<!-- User -->
			<div class="bg-[#32274a] backdrop-blur-md rounded-2xl p-6 w-[280px] relative">
				<h3 class="text-gray-200 font-bold text-lg mb-4" style="text-shadow: 0 0 2px #000, 0 0 4px #000, 0 0 8px #4c1d95, 0 0 16px #7c22ce, 0 0 24px #7c22ce;">Winner</h3>
				<div class="relative mb-4">
					${ winnerCrown() }
					<img src="${thisUser.profilePicture}" alt="User Avatar" class="w-24 h-24 rounded-full mx-auto">
				</div>

				<h4 class="text-purple-600 font-semibold text-lg mb-2">${thisUser.name}</h4>
				<div class="text-2xl font-bold text-gray-200">5</div>
			</div>

	<!-- VS Divider -->
			<div class="flex items-center">
				<span class="text-3xl font-bold text-gray-300">VS</span>
			</div>

	<!-- Opponent -->
			<div class="bg-[#32274a] backdrop-blur-md rounded-2xl p-6 w-[280px] relative">
				<h3 class="text-gray-200 font-bold text-lg mb-4">Loser</h3>

				<div class="relative mb-4">
					<img src="assets/default-avatar.jpeg" alt="Opponent Avatar" class="w-24 h-24 rounded-full mx-auto">
				</div>

				<h4 class="text-purple-600 font-semibold text-lg mb-2">Opponent</h4>
				<div class="text-2xl font-bold text-gray-00">2</div>

				<div class="flex justify-end gap-3 mt-6">
					<button data-action="accept" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">Befriend</button>
				</div>
			</div>

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

		${ matchCard() }

	<button id="prev-match"
	class="text-6xl text-gray-300 hover:text-white cursor-pointer font-bold"
	style="position: fixed; top: 50%; right: 28%; transform: translateY(-50%); z-index: 51;">
	›</button>
	`
	;
}

