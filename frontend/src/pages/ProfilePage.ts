import { sidebarDisplay } from "../components/SideBar"

export function ProfilePage()
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

<!-- Profile button -->
			<div class="flex items-center gap-3">
				<div id="profile-logo"
					class="w-10 h-10 rounded-full bg-theme-button flex items-center justify-center text-white font-bold cursor-pointer relative">
					?
				</div>

<!-- Profile text -->
				<div>
					<p class="font-semibold">Welcome back, NAME!</p>
					<p class="text-sm text-gray-500">NAME</p>
				</div>
			</div>

<!-- Sidebar -->
			${ sidebarDisplay() }

<!-- Logout button -->
			<button id="logout-btn"
				class="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
				Logout
			</button>
		</div>

<!-- Title -->
	<h1 class="text-4xl font-heading font-bold mb-4">My Pong Profile<br><br></h1>

<!-- Profile header -->
	<div class="flex flex-col items-center gap-3 mb-10">
		<div class="w-[150] h-[150] rounded-full bg-theme-button flex items-center justify-center text-white text-3xl font-bold shadow">
			?
		</div>
		<h1 class="text-2xl font-semibold">NAME</h1>
		<p class="text-gray-500 text-sm">It's all about you <3</p>
	</div>

<!-- Profile info card -->
	<div class="bg-white shadow rounded-2xl w-full max-w-lg p-6 space-y-6">

<!-- Username -->
		<div class="flex justify-between items-center">
			<span class="text-gray-500 font-medium">Username</span>
			<span class="text-gray-900">NAME</span>
		</div>

<!-- Email -->
		<div class="flex justify-between items-center">
			<span class="text-gray-500 font-medium">Email</span>
			<span class="text-gray-900">EMAIL</span>
		</div>

<!-- Join Date -->
		<div class="flex justify-between items-center">
			<span class="text-gray-500 font-medium">Member Since</span>
			<span class="text-gray-900">DATE</span>
		</div>

<!-- Join Date -->

	</div>`;
}
