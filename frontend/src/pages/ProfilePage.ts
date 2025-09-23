import { formatDate } from "../utils"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { profilePopUp } from "../components/PopUps"
import { thisUser } from "../router"
import { addTheme } from "../components/Theme"
import { triggerPopup } from "../components/PopUps"

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
	<h1 class="text-4xl font-heading font-bold mb-4">My Pong Profile<br><br></h1>

<!-- Profile header -->
	<div class="flex flex-col items-center gap-3 mb-10 ">
		<div class="rounded-full shadow-[0_0_30px_10px_#7037d3]"
			style="position: relative; display: inline-block; width: 160px; height: 160px;">
		<img id="profile-picture" src="${thisUser.profilePicture}"
				alt="Profile picture"
				class="rounded-full"
				style="width: 160px; height: 160px;"/>
				<button id="edit-pic-button"
				style="position: absolute; bottom: 1px; right: 1px;"
				onclick>🖍</button>
		  </div>
		<h1 class="text-2xl font-semibold ">${thisUser.name}</h1>
		<p class="text-gray-500 text-sm">It's all about you <3</p>
	</div>
	${ profilePopUp() }

	<!-- Profile info card -->
		<div class="bg-[#271d35] backdrop-blur-md rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-[0_0_30px_10px_#7037d3] border border-gray-300">

	<!-- Username -->
			<div class="flex justify-between items-center">
				<span class="text-gray-300 font-medium">Username</span>
				<span class="text-white">${thisUser.name}
				<button onClick={editName} style="margin-left: 5px;">🖍</button></span>
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

	<div class="flex flex-col items-center mt-6 space-y-2">
		<p class="font-semibold center">Change password</p>
		<p class="font-semibold center">Delete account</p>
	</div>`;
}
