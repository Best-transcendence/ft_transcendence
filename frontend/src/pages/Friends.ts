import { addTheme } from "../components/Theme"
import { profileDivDisplay } from "../components/ProfileDiv"
import { sidebarDisplay } from "../components/SideBar"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { thisUser } from "../router"

export function FriendsPage()
{
	return `
<!-- Theme -->
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
		<h1 class="text-4xl text-gray-200 text-center font-heading font-bold mb-1">Friends</h1>
		<p class="text-lg text-gray-400 max-w-xl text-center mb-16">
			Keep them close, but keep your Clasher enemies closer!
		</p>
	</div>

<!-- Friends Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-14 gap-y-14 w-full max-w-7xl mx-auto">

<!-- Friend Card 1 -->
		<div class="bg-[#271d35] backdrop-blur-md rounded-2xl p-4 shadow-[0_0_30px_10px_#7037d3] h-[170px] relative overflow-hidden">
			<div class="flex items-start gap-4 absolute left-5 top-5">
			<img src=${ thisUser.profilePicture }  alt="Friend Avatar" class="w-24 h-24 rounded-full">
				<div class="pr-6">
				<h3 class="text-white font-semibold">
					${ thisUser.name }
					<span class="inline-block ml-1 text-sm">🟢</span></h3>
				<p class="text-gray-400 text-sm break-words"
				style="word-break: break-word; overflow-wrap: break-word;"><i>${ thisUser.bio }</i></p>
				</div>
			</div>
			<div class="absolute bottom-5 right-6">
				<button class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
				Unfriend</button>
			</div>
		</div>

		<div class="bg-[#271d35] backdrop-blur-md rounded-2xl p-4 shadow-[0_0_30px_10px_#7037d3] h-[170px] relative overflow-hidden">
			<div class="flex items-start gap-4">
			<img src=${ thisUser.profilePicture }  alt="Friend Avatar" class="w-24 h-24 rounded-full">
				<div class="mr-3">
				<h3 class="text-white font-semibold">
					${ thisUser.name }
					<span class="inline-block ml-1 text-sm">⚫</span></h3>
				<p class="text-gray-400 text-sm break-words"
				style="word-break: break-word; overflow-wrap: break-word;"><i>${ thisUser.bio }</i></p>
				</div>
			</div>
			<div class="absolute bottom-5 right-6">
				<button class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
				Unfriend</button>
			</div>
		</div>

	<div class="bg-[#271d35] backdrop-blur-md rounded-2xl p-4 shadow-[0_0_30px_10px_#7037d3] h-[170px] relative overflow-hidden">
			<div class="flex items-start gap-4">
			<img src=${ thisUser.profilePicture }  alt="Friend Avatar" class="w-24 h-24 rounded-full">
				<div class="mr-3">
				<h3 class="text-white font-semibold">
					${ thisUser.name }
					<span class="inline-block ml-1 text-sm">⚫</span></h3>
				<p class="text-gray-400 text-sm break-words"
				style="word-break: break-word; overflow-wrap: break-word;"><i>${ thisUser.bio }</i></p>
				</div>
			</div>
			<div class="absolute bottom-5 right-6">
				<button class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
				Unfriend</button>
			</div>
		</div>

	<div class="bg-[#271d35] backdrop-blur-md rounded-2xl p-4 shadow-[0_0_30px_10px_#7037d3] h-[170px] relative overflow-hidden">
			<div class="flex items-start gap-4">
			<img src=${ thisUser.profilePicture }  alt="Friend Avatar" class="w-24 h-24 rounded-full">
				<div class="mr-3">
				<h3 class="text-white font-semibold">
					${ thisUser.name }
					<span class="inline-block ml-1 text-sm">⚫</span></h3>
				<p class="text-gray-400 text-sm break-words"
				style="word-break: break-word; overflow-wrap: break-word;"><i>Roses are red - Violets are blue - Unexpected '}' on line 32}</i></p>
				</div>
			</div>
			<div class="absolute bottom-5 right-6">
				<button class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
				Unfriend</button>
			</div>
		</div>

		<div class="bg-[#271d35] backdrop-blur-md rounded-2xl p-4 shadow-[0_0_30px_10px_#7037d3] h-[170px] relative overflow-hidden">
			<div class="flex items-start gap-4">
			<img src=${ thisUser.profilePicture }  alt="Friend Avatar" class="w-24 h-24 rounded-full">
				<div class="mr-3">
				<h3 class="text-white font-semibold">
					${ thisUser.name }
					<span class="inline-block ml-1 text-sm">⚫</span></h3>
				<p class="text-gray-400 text-sm break-words"
				style="word-break: break-word; overflow-wrap: break-word;"><i>${ thisUser.bio }</i></p>
				</div>
			</div>
			<div class="absolute bottom-5 right-6">
				<button class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
				Unfriend</button>
			</div>
		</div>

		<div class="bg-[#271d35] backdrop-blur-md rounded-2xl p-4 shadow-[0_0_30px_10px_#7037d3] h-[170px] relative overflow-hidden">
			<div class="flex items-start gap-4">
			<img src=${ thisUser.profilePicture }  alt="Friend Avatar" class="w-24 h-24 rounded-full">
				<div class="mr-3">
				<h3 class="text-white font-semibold">
					${ thisUser.name }
					<span class="inline-block ml-1 text-sm">⚫</span></h3>
				<p class="text-gray-400 text-sm break-words"
				style="word-break: break-word; overflow-wrap: break-word;"><i>${ thisUser.bio }</i></p>
				</div>
			</div>
			<div class="absolute bottom-5 right-6">
				<button class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
				Unfriend</button>
			</div>
		</div>`
};
