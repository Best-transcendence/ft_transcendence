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

export function editName(input: string)
{
}

export async function editBio(input: string)
{
	const token = localStorage.getItem("jwt");

	await fetch(`${API_URL}/users/me`,
	{
		method: 'POST',
		body: JSON.stringify({ bio: input }),
		headers:
		{
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});

	const bio = document.querySelector<HTMLElement>("#profile-bio");
	if (bio)
		bio.textContent = input;

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
