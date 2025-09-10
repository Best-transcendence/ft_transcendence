// Centralizes the profile logo button + text
export function profileDivDisplay(user: any)
{
	return `
		<div class="flex items-center gap-3">
			<div id="profile-logo"
				class="w-10 h-10 rounded-full bg-theme-button flex items-center justify-center text-white font-bold cursor-pointer relative">
				${user.name[0].toUpperCase()}
			</div>

				<div>
					<p class="font-semibold">Welcome back, ${user.name} </p>
					<p class="text-sm text-gray-500">${user.email}</p>
				</div>
			</div>`
}
