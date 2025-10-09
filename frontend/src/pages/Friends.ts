import { thisUser } from "../router"
import { addTheme } from "../components/Theme"
import { profileDivDisplay } from "../components/ProfileDiv"
import { sidebarDisplay } from "../components/SideBar"
import { LogOutBtnDisplay } from "../components/LogOutBtn"
import { friendRequestCard } from "../components/FriendRequestDiv"
import { confirmPopup } from "../components/Popups"

// Interface for friend (safer than using "any")
export interface Friend
{
	id: number,
	name: string,
	profilePicture: string,
	bio: string
}

// Review user's connections in friends and friendOf
// if userA has userB in BOTH friends and friendof = Mutual friends
// if userA has userB ONLY in friendOf = Friend request from userB for userA to accept/decline
export function loadFriend(): string
{
	if (!thisUser.friendOf || thisUser.friendOf.length === 0)
		return noFriends();

	let cards = '';
	let friendRequests = '';

	for (let i = 0; i < thisUser.friendOf.length; i++)
	{
		const friend = thisUser.friendOf[i];

		if (!thisUser.friends.find((f: Friend) => f.id === friend.id))
			friendRequests = friendRequestCard(friend);
		else
			cards += friendCard(thisUser.friendOf[i]);
	}

	return (cards + friendRequests);
}

// No friend div appearance
function noFriends()
{
	return `
	</div>
	<div flex items-center>
	<br>
		<h3 class="text-2xl text-gray-400 text-center font-bold mb-5">No friends yet</h3>
		<h1 class="text-7xl text-gray-400 text-center font-bold mb-1">:'(</h1>
	</div>
	<div>`
}

// Friend card appearance
function friendCard(friend: Friend)
{
	return `
	<div class="bg-[#271d35] backdrop-blur-md rounded-2xl p-4 shadow-[0_0_30px_10px_#7037d3] h-[170px] relative overflow-hidden">
		<div class="flex items-start gap-4 absolute left-5 top-5">
			<img src=${ friend.profilePicture }  alt="Friend Avatar" class="w-24 h-24 rounded-full">
				<div class="mr-3">
				<h3 class="text-white font-semibold">
					${ friend.name }
					<span class="inline-block ml-1 text-sm">🟢</span></h3>
				<p class="text-gray-400 text-sm break-words"
				style="word-break: break-word; overflow-wrap: break-word;"><i>${ friend.bio }</i></p>
				</div>
			</div>
			<div class="absolute bottom-5 right-6">
				<button id="friend-button--${friend.id}" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
				Unfriend</button>
			</div>
		</div>`;
}

// Handles friends page appearance
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
	${ loadFriend() }

	${ confirmPopup() }

	</div>`
};
