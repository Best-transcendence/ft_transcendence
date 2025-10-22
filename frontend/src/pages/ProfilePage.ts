import { formatDate } from "../utils"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { profilePopup , inputPopup } from "../components/Popups"
import { thisUser, fetchUser } from "../router"
import { addTheme } from "../components/Theme"

// Manages Profile page display
export function ProfilePage()
{
	// Show refresh notification
	alert("Please refresh the page to see updated stats!");
	
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
		<h1 class="text-4xl text-gray-200 text-center font-heading font-bold mb-1">Profile</h1>
		<p class="text-lg text-gray-400 max-w-xl text-center mb-16">
			Get to know yourself, Clasher!
		</p>
	</div>

<!-- Profile header -->
	<div class="flex flex-col items-center gap-3 mb-10 ">
		<div class="rounded-full shadow-[0_0_30px_10px_#7037d3]"
			style="position: relative;
				display: inline-block; inline-block; width: 11vw; height: 11vw; min-width: 120px; min-height: 120px;">
		<img id="profile-picture" src="${thisUser.profilePicture}"
				alt="Profile picture"
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
			<span class="text-gray-300 font-medium">Username</span>
			<span id="profile-name-card" class="text-white">${thisUser.name}</span>

		</div>

<!-- Email -->
		<div class="flex justify-between items-center">
			<span class="text-gray-300 font-medium">Email</span>
			<span class="text-white">${thisUser.email}</span>
		</div>

<!-- Join Date -->
		<div class="flex justify-between items-center">
			<span class="text-gray-300 font-medium">Member Since</span>
			<span class="text-white">${formatDate(thisUser.createdAt, "M")}</span>
		</div>

	</div>
	${ inputPopup() }

	<div class="flex flex-col items-center mt-6 space-y-2">
		<p class="font-semibold center text-gray-200">
			Wins: ${thisUser.stats?.wins || 0} - Losses: ${thisUser.stats?.losses || 0}
		</p>
		${thisUser.stats?.draws > 0 ? `<p class="text-sm text-gray-400">Draws: ${thisUser.stats.draws}</p>` : ''}
		<!-- Debug info -->
		<p class="text-xs text-gray-500">Debug: ${JSON.stringify(thisUser.stats)}</p>
		<p class="text-xs text-gray-500">Full user: ${JSON.stringify(thisUser, null, 2)}</p>
	</div>`;
}
