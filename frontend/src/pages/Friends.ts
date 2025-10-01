import { addTheme } from "../components/Theme"
import { profileDivDisplay } from "../components/ProfileDiv"
import { sidebarDisplay } from "../components/SideBar"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { friendCard } from "../components/FriendCard"
import { confirmPopup } from "../components/Popups"
import { thisUser } from "../router"


export interface Friend
{
	id: string,
	name: string,
	profilePicture: string,
	bio: string
}

export function loadFriend(friendRequest: Boolean): string
{
	if (!thisUser.friendOf || thisUser.friendOf.length === 0)
		return `<p class="text-gray-400">No friends yet!</p>`;

	let cards = '';

	for (let i = 0; i < thisUser.friendOf.length; i++)
	{
		const friend = thisUser.friendOf[i];

		if (!friendRequest)
			if (!thisUser.friends.find((f: Friend) => f.id === friend.id))
				continue ;

		cards += friendCard(thisUser.friendOf[i]);
	}

	return (cards);
}

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

<!-- Friends Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-14 gap-y-14 w-full max-w-7xl mx-auto">
	${ loadFriend(false) }

	${ confirmPopup() }
	</div>`
};
