import { getCurrentUser } from "../services/api";
import { thisUser } from "../router"
import { API_URL } from "./config";

export async function editProfilePicture()
{
	const newPicUrl = "/assets/google.svg";
	const token = localStorage.getItem("jwt");

	await fetch(`${API_URL}/users/me/profile-picture`,
	{
		method: 'POST',
		body: JSON.stringify({ profilePicture: newPicUrl }),
		headers:
		{
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});

	// Fetch updated user profile from backend
	const data = await getCurrentUser();
	thisUser.profilePicture = data.user.profilePicture;
}

export async function removeProfilePicture()
{
	if (thisUser.profilePicture == "/assets/default-avatar.jpeg")
		return ;

	const defaultUrl = "/assets/google.svg";
	const token = localStorage.getItem("jwt");

	await fetch(`${API_URL}/users/me/profile-picture`,
	{
		method: 'POST',
		body: JSON.stringify({ profilePicture: defaultUrl }),
		headers:
		{
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});

	const data = await getCurrentUser();
	thisUser.profilePicture = data.user.profilePicture;
}

export function updateName(newName: string)
{

}

export function checkOldPass(oldPass: string)
{

}

export function updatePass(newPass: string)
{

}

export function deleteAccount()
{

}
