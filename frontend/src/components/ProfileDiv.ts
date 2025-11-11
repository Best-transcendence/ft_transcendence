import { thisUser } from "../router"
import { t } from "../services/lang/LangEngine";

// Centralizes the profile logo button + text
export function profileDivDisplay()
{
	const profilePicture = thisUser.profilePicture || "/assets/default-avatar.jpeg";
	return `
		<div class="flex items-center gap-3">
			<div id="profile-logo">
				<img id="profile-logo-img" src="${profilePicture}"
				alt="Profile picture"
				class="w-10 h-10 rounded-full shadow-[0_0_30px_10px_#7037d3]
				cursor-pointer relative"/>
			</div>

				<div>
					<p id="profile-logo-name" class="font-semibold"> ${t("welcomeBack")} ${thisUser.name || "User"} </p>
					<p class="text-sm text-gray-500">${thisUser.email || ""}</p>
				</div>
			</div>`
}
