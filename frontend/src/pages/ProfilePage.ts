import { formatDate } from "../utils"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { profilePopup , inputPopup } from "../components/Popups"
import { thisUser } from "../router"
import { addTheme } from "../components/Theme"

// Manages Profile page display
export function ProfilePage()
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
	<h1 class="text-3xl text-gray-200 font-bold mb-4">Profile<br><br></h1>

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
		<h1 class="text-2xl font-semibold text-gray-200">${thisUser.name}</h1>
		<p class="text-white text-sm">
			It's all about you <3
			<button id="edit-bio-button" class="ml-1.5" onclick>🖍</button>
		</p>
	</div>
	${ profilePopup() }

<!-- Profile info card -->
	<div class="bg-[#271d35] backdrop-blur-md
	rounded-2xl w-[100%] max-w-[500px] p-6 space-y-6 shadow-[0_0_30px_10px_#7037d3]">

<!-- Username -->
		<div class="flex justify-between items-center">
			<span class="text-gray-300 font-medium">Username</span>
			<span class="text-white">${thisUser.name}
			<button id="edit-name-button" class="ml-1.5" onclick>🖍</button></span>
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
		<p class="font-semibold center text-gray-200">Wins:   -  Losses: </p>
		<p class="font-semibold center text-gray-200">Average game duration: </p>
	</div>`;
}
