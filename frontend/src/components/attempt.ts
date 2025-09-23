


const buttonConfigs =
[
	{ buttonId: "edit-name-button", popupId: "input-popup", handler: initInputPopup, type: "input", title: "Edit Name", placeholder: "Enter name" },
	{ buttonId: "edit-bio-button",  popupId: "input-popup", handler: initInputPopup, type: "input", title: "Edit Bio", placeholder: "Enter bio" },
	{ buttonId: "edit-pic-button",  popupId: "profile-popup", handler: initProfilePopup, type: "profile" }
];

export function TriggerPopUp()
{
	const overlay = document.getElementById("popup-overlay");

	buttonConfigs.forEach(config =>
	{
		const button = document.getElementById(config.buttonId);
		const popup = document.getElementById(config.popupId);
		if (!button || !popup || !overlay)
				return;

		button.addEventListener("click", () =>
		{
			config.handler(config);
			overlay.style.display = "block";
			popup.style.display = "block";
		});
	});
}

function initInputPopup(config: any)
{
	console.log(config.buttonId);
}

function initProfilePopup(config: any)
{
	console.log(config.buttonId);
}
