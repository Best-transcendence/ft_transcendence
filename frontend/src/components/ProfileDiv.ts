import { thisUser } from "../router"

// Centralizes the profile logo button + text
export function profileDivDisplay()
{
	return `
		<div class="flex items-center gap-3">
			<div id="profile-logo">
				<img id="profile-logo-img" src="${thisUser.profilePicture || "/assets/default-avatar.jpeg"}"
				alt="Profile picture"
				class="w-10 h-10 rounded-full shadow-[0_0_30px_10px_#7037d3] border border-gray-300
				cursor-pointer relative"/>
			</div>

				<div>
					<p class="font-semibold">Welcome back, ${thisUser.name} </p>
					<p class="text-sm text-gray-500">${thisUser.email}</p>
				</div>
			</div>`
}
