// File aimed at holding popups
import { thisUser } from "../router"
import { editProfilePicture, uploadProfilePicture } from "../services/userActions"

// Manages profile picture change popup
export function triggerPopup()
{
	const editBtn = document.getElementById("edit-pic-button");
	const popUp = document.getElementById("profile-popup");
	const overlay = document.getElementById("popup-overlay");

	if (!editBtn || !overlay || !popUp)
		return ;

	editBtn.addEventListener("click", () =>
	{
		overlay.style.display = "block";
		popUp.style.display = "block";
	});

	popUp.querySelectorAll("li").forEach(item =>
	{
		item.addEventListener("click", () =>
		{
			const option = item.getAttribute("data-action");
			switch (option)
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
			overlay.style.display = "none";
			popUp.style.display = "none";
		});
	});

}

// Display for hidden popup + hidden fileselector
export function profilePopUp()
{
	return `
	<div id="popup-overlay"
		class="fixed inset-0"
		style="display: none; backdrop-filter: blur(4px); background: rgba(0,0,0,0.2); z-index: 40;"></div>
	<div id="profile-popup"
		class="bg-white rounded-2xl w-[300px] p-3 space-y-6 z-40
			shadow-[0_0_30px_10px_#7037d3]
			text-center text-black
			transition duration-300 scale-95"
		style="display: none; position: fixed; top: 50%; left: 50%;
			transform: translate(-50%, -50%); z-index: 50;">

		<ul class="flex flex-col p-4 gap-4">
			<li data-action="edit" class="cursor-pointer hover:text-blue-600">Edit picture</li>
			<li data-action="remove" class="cursor-pointer hover:text-blue-600">Remove picture</li>
			<li data-action="cancel" class="cursor-pointer hover:text-blue-600">Cancel</li>
		</ul>

	<!-- Hidden filesystem picker -->
		<input type="file" id="profile-pic-input" accept="image/*" style="display:none" />

	</div>`;
}
