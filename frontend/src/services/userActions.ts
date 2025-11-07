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

	const response = await fetch(`${API_URL}/users/me`,
	{
		method: 'POST',
		body: JSON.stringify({ profilePicture: newPicUrl }),
		headers:
		{
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		console.error("Failed to update profile picture");
		return;
	}

	const result = await response.json();

	// Update thisUser immediately with the response from the server
	if (result.user && result.user.profilePicture) {
		thisUser.profilePicture = result.user.profilePicture;
	} else {
		// Fallback: use the value we sent if server doesn't return it
		thisUser.profilePicture = newPicUrl;
	}

	// Update DOM elements
	const img = document.querySelector<HTMLImageElement>("img#profile-picture"); //changes picture
	if (img && thisUser.profilePicture)
		img.src = thisUser.profilePicture;

	const imglogo = document.querySelector<HTMLImageElement>("#profile-logo-img"); //changes logoo
	if (imglogo && thisUser.profilePicture)
		imglogo.src = thisUser.profilePicture;
}

// Updates name + throws error if duplicate
export async function editName(newName: string)
{
	if (thisUser.name == newName)
		return ;

	const token = localStorage.getItem("jwt");

	try
	{
		const response = await fetch(`${API_URL}/users/me`,
		{
			method: 'POST',
			body: JSON.stringify({ name: newName }),
			headers:
			{
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok)
		{
			const errorData = await response.json();
			if (response.status == 400)
			{
				alert(`❌ ${errorData.error}`);
				return;
			}
			throw new Error(`HTTP ${response.status}: ${errorData.error}`);
		}

		const name = document.querySelector<HTMLElement>("#profile-name");
		if (name)
			name.textContent = newName;

		const nameCard = document.querySelector<HTMLElement>("#profile-name-card");
		if (nameCard)
			nameCard.textContent = newName;

		const nameLogo = document.querySelector<HTMLElement>("#profile-logo-name"); //changes logoo
		if (nameLogo)
			nameLogo.textContent = `${t("welcomeBack")} ${newName}`;

		const data = await getCurrentUser();
		thisUser.name = data.user.name;
	}
	catch (error)
	{
		console.log(error);
	}
}

// Edit Bio
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
