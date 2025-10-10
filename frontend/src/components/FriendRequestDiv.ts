import { protectedPage } from "../router"
import { Friend, FriendsPage } from "../pages/Friends"
import { removeFriend, addFriend } from "../services/friendsActions"
import { triggerPopup } from "../components/Popups"

export function friendRequest()
{
	const overlay = document.getElementById("popup-overlay");
	const popup = document.querySelector('[id^="friend-request"]') as HTMLElement;
	if (!overlay || !popup)
		return;

	const friendId = popup.id.split('--')[1];
	if (!friendId)
		return ;

	overlay.style.display = "block";
	popup.style.display = "block";

	popup.querySelectorAll("button").forEach(item =>
	{

		item.addEventListener("click", () =>
		{
			const action = item.getAttribute("data-action");
			switch (action)
			{
				case "decline":
					removeFriend(friendId);
					break;

				case "accept":
					addFriend(friendId, () => protectedPage(() => FriendsPage(), triggerPopup, friendRequest));
					break;
			}
			overlay.style.display = "none";
			popup.style.display = "none";
		});
	});
}

// Friend request popup
export function friendRequestCard(friend: Friend)
{
	return `
	<div id="popup-overlay"
		class="fixed inset-0"
		style="backdrop-filter: blur(4px); background: rgba(0,0,0,0.2); z-index: 40;">
	</div>

	<div id="friend-request--${friend.id}"
	class="bg-gray-200 rounded-2xl w-[400px] p-6  z-50
	shadow-[0_0_30px_10px_#7037d3]
	text-center
	transition duration-300 scale-95"
	style="position: fixed; top: 50%; left: 50%;
	transform: translate(-50%, -50%); z-index: 50;">

		<h3 class="text-lg font-semibold text-gray-800 mb-2">You have a friend request</h3>
		<p class=" text-sm text-gray-500 max-w-l text-center mb-10">
			Is this a popularity contest?
		</p>

		<div class="bg-gray-300 backdrop-blur-md rounded-2xl p-4 h-[140px] relative overflow-hidden">
		<div class="flex items-start gap-4 absolute left-5 top-5 ">
			<img src=${ friend.profilePicture }  alt="Friend Avatar" class="w-24 h-24 rounded-full">
				<div class="mr-3">
				<h3 class="text-purple-700 font-semibold text-left">
					${ friend.name }</h3>
				<p class="text-gray-500 text-sm break-words text-left"
				style="word-break: break-word; overflow-wrap: break-word;"><i>${ friend.bio }</i></p>
				</div>
			</div>
		</div>

		<div class="flex justify-end gap-3 mt-6">
			<button data-action="decline" class="px-4 py-2 text-black hover:text-purple-700 cursor-pointer">Decline</button>
			<button data-action="accept" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">Accept</button>
		</div>
	</div>`;
}
