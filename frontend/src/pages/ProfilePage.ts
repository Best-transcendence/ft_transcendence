import { formatDate } from "../utils"
import { sidebarDisplay } from "../components/SideBar"
import { profileDivDisplay } from "../components/ProfileDiv"
import { LogOutBtnDisplay } from "../components/LogOutBtn"

export function ProfilePage(user: any)
{
	return `
<!-- Theme -->
	<div class="min-h-screen
		flex flex-col
		items-center justify-start
		bg-gradient-to-b from-theme-bg1 to-theme-bg2
		text-theme-text p-8">

<!-- Header with user info -->
		<div class="w-full
			flex justify-between items-center
			mb-10">

<!-- Protected pages components -->
			${ profileDivDisplay(user) }
			${ sidebarDisplay() }
			${ LogOutBtnDisplay() }

		</div>

<!-- Title -->
	<h1 class="text-4xl font-heading font-bold mb-4">My Pong Profile<br><br></h1>

<!-- Profile header -->
	<div class="flex flex-col items-center gap-3 mb-10">
		<div class="w-[150] h-[150] rounded-full bg-theme-button flex items-center justify-center text-white text-3xl font-bold shadow">
			${user.name[0].toUpperCase()}
		</div>
		<h1 class="text-2xl font-semibold">${user.name}</h1>
		<p class="text-gray-500 text-sm">It's all about you <3</p>
	</div>

<!-- Profile info card -->
	<div class="bg-white shadow rounded-2xl w-full max-w-lg p-6 space-y-6">

<!-- Username -->
		<div class="flex justify-between items-center">
			<span class="text-gray-500 font-medium">Username</span>
			<span class="text-gray-900">${user.name}</span>
		</div>

<!-- Email -->
		<div class="flex justify-between items-center">
			<span class="text-gray-500 font-medium">Email</span>
			<span class="text-gray-900">${user.email}</span>
		</div>

<!-- Join Date -->
		<div class="flex justify-between items-center">
			<span class="text-gray-500 font-medium">Member Since</span>
			<span class="text-gray-900">${formatDate(user.createdAt, "M")}</span>
		</div>

<!-- Join Date -->

	</div>`;
}
