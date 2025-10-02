import { API_URL } from "./config";
import { thisUser, protectedPage } from "../router"
import { getCurrentUser } from "../services/api";
import { FriendsPage } from "../pages/Friends"
import { triggerPopup } from "../components/Popups"
import { friendRequest } from "../components/FriendRequestDiv"


// Adds friend - if only
export async function addFriend(friendId: string, refreshPage?: () => void) //pass your page to refresh
{
	const token = localStorage.getItem("jwt");

	const response = await fetch(`${API_URL}/users/me`,
	{
		method: 'POST',
		body: JSON.stringify(
		{
			action: 'add_friend',
			friendId: parseInt(friendId)
		}),
		headers:
		{
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});

	if (response.ok)
	{
		const data = await getCurrentUser();
		thisUser.friends = data.user.friends;
		thisUser.friendOf = data.user.friendOf;

		if (refreshPage)
			refreshPage();
	}
}

// Remove friend
export async function removeFriend(friendId: string)
{
	const token = localStorage.getItem("jwt");

	const response = await fetch(`${API_URL}/users/me`,
	{
		method: 'POST',
		body: JSON.stringify(
		{
			action: 'remove_friend',
			friendId: parseInt(friendId)
		}),
		headers:
		{
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});

	if (response.ok)
	{
		const data = await getCurrentUser();
		thisUser.friends = data.user.friends;
		thisUser.friendOf = data.user.friendOf;

		protectedPage(() => FriendsPage(), triggerPopup, friendRequest);
	}
}
