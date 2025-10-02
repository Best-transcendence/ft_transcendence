// File aimed at holding popups

import { editProfilePicture, uploadProfilePicture, editName, editBio } from "../services/userActions"
import { removeFriend } from "../services/friendsActions"

// Buttons configurations
const buttonConfigs =
[
	{ buttonId: "edit-name-button", popupId: "input-popup", handler: initInputPopup, options: "button", title: "Edit Name", placeholder: "Enter name", len: "13"},
	{ buttonId: "edit-bio-button",  popupId: "input-popup", handler: initInputPopup, options: "button", title: "Edit Bio", placeholder: "Enter bio", len: "60" },
	{ buttonId: "edit-pic-button",  popupId: "profile-popup", handler: initProfilePopup, options: "li" },
	{ buttonId: "friend-button", popupId: "confirm-popup", handler: initConfirmPopup, options: "button"},
	{ buttonId: "", popupId: "confirm-popup", handler: initConfirmPopup, options: "button"}
];

// General popup trigger
export function triggerPopup()
{
	const overlay = document.getElementById("popup-overlay");

	buttonConfigs.forEach(config =>
	{
		const buttons = document.querySelectorAll(`[id*="${config.buttonId}"]`);
		const popup = document.getElementById(config.popupId);

		if (!buttons || !popup || !overlay)
				return;

		buttons.forEach((button: Element) =>
		{
			button.addEventListener("click", () =>
			{
				overlay.style.display = "block";
				popup.style.display = "block";

				setupInputPopup(popup, config);

				popup.querySelectorAll(config.options!).forEach(item =>
				{
					const newItem = item.cloneNode(true);
					item.parentNode?.replaceChild(newItem, item);
					newItem.addEventListener("click", () =>
					{
						const action = item.getAttribute("data-action");
						if (action)
							config.handler(action, popup, config );

						overlay.style.display = "none";
						popup.style.display = "none";
					});
				});
			});
		});
	});
}

// Sets up input popup info
function setupInputPopup(popup: HTMLElement, config: any)
{
	if (config.popupId != "input-popup")
		return;

	const input = popup.querySelector("input") as HTMLInputElement;
	if (input)
		input.value = "";

	popup.querySelector("h3")!.textContent = config.title;
	popup.querySelector("input")!.placeholder = config.placeholder;
	popup.querySelector("input")!.setAttribute("maxlength", config.len);
}

// Specific input popup actions
function initInputPopup(action: string, popup: HTMLElement, config: any)
{
	switch (action)
	{
		case "save":
			const input = popup.querySelector("input") as HTMLInputElement;
			if (input.value.trim() == "")
				return;

			if (config.buttonId == "edit-name-button")
				editName(input.value);
			else if (config.buttonId == "edit-bio-button")
				editBio(input.value);
			break;

		case "cancel":
			break;
	}
}

// Specific profile picture popup actions
function initProfilePopup(action: any)
{
	switch (action)
	{
		case "edit":
			uploadProfilePicture();
				break;

		case "remove":
			editProfilePicture("/assets/default-avatar.jpeg");
				break;

			case "cancel":
				break;
	}
}

// Confirm/cancel popup
function initConfirmPopup(action: any, popup: HTMLElement)
{
	const clickedButton = document.querySelector('[id^="friend-button--"]:focus')
						|| document.querySelector('[id^="friend-button--"]'); // Retrieves the friend id
	if (!clickedButton)
		return ;

	const friendId = clickedButton.id.split('--')[1];
	if (!friendId)
		return ;

	switch (action)
	{
		case "confirm":
			removeFriend(friendId);

		case "cancel":
			break;
	}
}

// Input popup appearance
export function inputPopup(): string
{
	return `
	<div id="input-popup"
	class="bg-gray-200 rounded-2xl w-[400px] p-6 space-y-4 z-50
	shadow-[0_0_30px_10px_#7037d3]
	text-center
	transition duration-300 scale-95"
	style="display: none; position: fixed; top: 50%; left: 50%;
	transform: translate(-50%, -50%); z-index: 50;">

		<h3 class="text-lg font-semibold text-gray-800 mb-4"></h3>

		<input id="name"
		class="w-full p-3 rounded-lg border border-gray-300
		outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
		text-gray-800 bg-gray-300
		placeholder-gray-600"
		type="text"
		maxlength="13"
		placeholder="Name" />

		<div class="flex justify-end gap-3 mt-6">
			<button data-action="cancel" class="px-4 py-2 text-black hover:text-purple-700 cursor-pointer">Cancel</button>
			<button data-action="save" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">Save</button>
		</div>
	</div>`;
}

// Profile picture popup appearance
export function profilePopup(): string
{
	return `
	<div id="popup-overlay"
		class="fixed inset-0"
		style="display: none; backdrop-filter: blur(4px); background: rgba(0,0,0,0.2); z-index: 40;">
	</div>

	<div id="profile-popup"
	class="bg-gray-200 rounded-2xl w-[300px] p-3 space-y-6 z-40
		shadow-[0_0_30px_10px_#7037d3]
		text-center text-black
		transition duration-300 scale-95"
	style="display: none; position: fixed; top: 50%; left: 50%;
		transform: translate(-50%, -50%); z-index: 50;">

	<ul class="flex flex-col p-4 gap-4">
		<li data-action="edit" class="cursor-pointer hover:text-purple-700">Edit picture</li>
		<li data-action="remove" class="cursor-pointer hover:text-purple-700">Remove picture</li>
		<li data-action="cancel" class="cursor-pointer hover:text-purple-700">Cancel</li>
	</ul>

	<input type="file" id="profile-pic-input" accept="image/*" style="display:none" />

	</div>`;
}

// "Are you sure?"" picture popup appearance
export function confirmPopup(): string
{
	return `
	<div id="popup-overlay"
		class="fixed inset-0"
		style="display: none; backdrop-filter: blur(4px); background: rgba(0,0,0,0.2); z-index: 40;">
	</div>

	<div id="confirm-popup"
		class="bg-gray-200 rounded-2xl p-8 space-y-4 z-50
		shadow-[0_0_30px_10px_#7037d3]
		text-center
		transition duration-300 scale-95"
		style="display: none; position: fixed; top: 50%; left: 50%;
		transform: translate(-50%, -50%); z-index: 50;">

		<h3 class="text-lg font-semibold text-gray-800 mb-8">Are you sure?<br></h3>

		<div class="flex justify-end gap-3 mt-6">
			<button data-action="cancel" class="px-4 py-2 text-black hover:text-purple-700 cursor-pointer">Cancel</button>
			<button data-action="confirm" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">Confirm</button>
		</div>

	</div>`;
}

