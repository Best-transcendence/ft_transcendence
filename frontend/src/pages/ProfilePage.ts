import { formatDate } from "../utils"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { profilePopup , inputPopup } from "../components/Popups"
import { thisUser, fetchUser } from "../router"
import { addTheme } from "../components/Theme"
import { t } from "../i18n/Lang";
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";

// Manages Profile page display
export function ProfilePage()
{
	return `
<!-- Theme -->
		${ addTheme() }

<!-- Header with user info -->
		<div class="w-full flex justify-between items-center mb-10">

	<!-- Protected pages components -->
		${ profileDivDisplay() }
		${ sidebarDisplay() }
        <!-- Group Language and Logout on the right -->
        <div class="flex gap-2 items-center">
            ${LanguageSwitcher()}
             ${LogOutBtnDisplay()}
        </div>
     </div>

<!-- Title -->
	<div flex items-center>
		<h1 class="text-4xl text-gray-200 text-center font-heading font-bold mb-1">Profile</h1>
		<p class="text-lg text-gray-400 max-w-xl text-center mb-16">
			${t("profileSubtitle")}
		</p>
	</div>

<!-- Profile header -->
	<div class="flex flex-col items-center gap-3 mb-10 ">
		<div class="rounded-full shadow-[0_0_30px_10px_#7037d3]"
			style="position: relative;
				display: inline-block; inline-block; width: 11vw; height: 11vw; min-width: 120px; min-height: 120px;">
		<img id="profile-picture" src="${thisUser.profilePicture}"
				alt="${t("profilePictureAlt")}"
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
			<span class="text-gray-300 font-medium">${t("username")}</span>
			<span id="profile-name-card" class="text-white">${thisUser.name}</span>

		</div>

<!-- Email -->
		<div class="flex justify-between items-center">
			<span class="text-gray-300 font-medium"${t("email")}</span>
			<span class="text-white">${thisUser.email}</span>
		</div>

<!-- Join Date -->
		<div class="flex justify-between items-center">
			<span class="text-gray-300 font-medium">${t("memberSince")}</span>
			<span class="text-white">${formatDate(thisUser.createdAt || new Date().toISOString(), "M")}</span>
		</div>

	</div>
	${ inputPopup() }

<!-- Game Statistics -->
	<div class="bg-slate-900 backdrop-blur-md rounded-2xl w-[100%] max-w-[500px] p-6 shadow-[0_0_30px_10px_#7037d3] mt-6">
		<div class="grid grid-cols-2 gap-4">
			<div class="flex justify-between items-center">
				<span class="text-gray-300 font-medium">Wins</span>
				<span class="text-green-400 font-semibold">${thisUser.stats?.wins || 0}</span>
			</div>

			<div class="flex justify-between items-center">
				<span class="text-gray-300 font-medium">Losses</span>
				<span class="text-red-400 font-semibold">${thisUser.stats?.losses || 0}</span>
			</div>

			<div class="flex justify-between items-center">
				<span class="text-gray-300 font-medium">Draws</span>
				<span class="text-yellow-400 font-semibold">${thisUser.stats?.draws || 0}</span>
			</div>

			<div class="flex justify-between items-center">
				<span class="text-gray-300 font-medium">Games</span>
				<span class="text-white">${thisUser.stats?.gamesPlayed || 0}</span>
			</div>

			<div class="flex justify-between items-center">
				<span class="text-gray-300 font-medium">Best Score</span>
				<span class="text-white">${thisUser.stats?.highestScore || 0}</span>
			</div>

			<div class="flex justify-between items-center">
				<span class="text-gray-300 font-medium">Points For</span>
				<span class="text-blue-400">${thisUser.stats?.pointsFor || 0}</span>
			</div>

			<div class="flex justify-between items-center">
				<span class="text-gray-300 font-medium">Points Against</span>
				<span class="text-purple-400">${thisUser.stats?.pointsAgainst || 0}</span>
			</div>
		</div>
	</div>

	<!-- Bottom spacing for proper scrolling -->
	<div class="h-20"></div>
	`;
}
