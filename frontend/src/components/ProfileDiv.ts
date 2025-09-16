import { thisUser } from "../router"

// Centralizes the profile logo button + text
export function profileDivDisplay()
{
	return `
		<div class="flex items-center gap-3">
			<div id="profile-logo">
				<img src="${thisUser.profilePicture}"
				alt="Profile picture"
				class="w-10 h-10 rounded-full
				cursor-pointer relative"/>
			</div>

				<div>
					<p class="font-semibold">Welcome back, ${thisUser.name} </p>
					<p class="text-sm text-gray-500">${thisUser.email}</p>
				</div>
			</div>`
}
