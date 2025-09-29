import { addTheme } from "../components/Theme"
import { profileDivDisplay } from "../components/ProfileDiv"
import { sidebarDisplay } from "../components/SideBar"
import { LogOutBtnDisplay } from "../components/LogOutBtn"

export function FriendsPage()
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
	<div flex items-center>
		<h1 class="text-4xl text-gray-200 text-center font-heading font-bold mb-1">Friends</h1>
		<p class="text-lg text-gray-400 max-w-xl text-center mb-16">
			Keep them close, but keep your Clasher enemies closer!
		</p>
	</div>
	`;
}
