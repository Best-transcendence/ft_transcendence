import { getCurrentUser } from "../services/api";
import { thisUser } from "../router"
import { API_URL } from "./config";

// Loads picture from fileselector + turns into url
export function uploadProfilePicture()
{
	const fileInput = document.getElementById("profile-pic-input") as HTMLInputElement;

	if (!fileInput)
		return ;

	fileInput.click();

	fileInput.addEventListener("change", async () =>
	{
		const file = fileInput.files?.[0];
		if (!file)
			return;

		const reader = new FileReader();
		reader.onload = async () =>
		{
			const newPicUrl = reader.result as string; // file into url string
			await editProfilePicture(newPicUrl);
		};
		reader.readAsDataURL(file);
	},
	{ once: true });
}

//saves new picture url into db
export async function editProfilePicture(newPicUrl: string)
{
	if (thisUser.profilePicture == newPicUrl && newPicUrl == "/assets/default-avatar.jpeg")
		return ;

	const token = localStorage.getItem("jwt");

	await fetch(`${API_URL}/users/me`,
	{
		method: 'POST',
		body: JSON.stringify({ profilePicture: newPicUrl }),
		headers:
		{
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});

	const img = document.querySelector<HTMLImageElement>("img#profile-picture"); //changes picture
	if (img)
		img.src = newPicUrl;

	const imglogo = document.querySelector<HTMLImageElement>("#profile-logo-img"); //changes logoo
	if (imglogo)
		imglogo.src = newPicUrl;

	const data = await getCurrentUser();
	thisUser.profilePicture = data.user.profilePicture;
}

export async function editName(newName: string)
{
	const token = localStorage.getItem("jwt");

	try
	{
		const authResponse = await fetch(`${API_URL}/auth/update-username`,
		{
			method: 'POST',
			body: JSON.stringify({ name: newName }),
			headers:
			{
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		});

		if (!authResponse.ok)
		{
			const error = await authResponse.json();
			throw (new Error(error.message || "Username already taken"));
		}
	}
	catch (error)
	{
		console.error("Failed to update username:", error);
		return;
	}

	await fetch(`${API_URL}/users/me`,
	{
		method: 'POST',
		body: JSON.stringify({ bio: newName }),
		headers:
		{
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});

	const name = document.querySelector<HTMLElement>("#profile-name");
	if (name)
		name.textContent = newName;

	const data = await getCurrentUser();
	thisUser.name = data.user.name;
}

export async function editBio(newBio: string)
{
	const token = localStorage.getItem("jwt");

	await fetch(`${API_URL}/users/me`,
	{
		method: 'POST',
		body: JSON.stringify({ bio: newBio }),
		headers:
		{
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});

	const bio = document.querySelector<HTMLElement>("#profile-bio");
	if (bio)
		bio.textContent = newBio;

	const data = await getCurrentUser();
	thisUser.bio = data.user.bio;
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
