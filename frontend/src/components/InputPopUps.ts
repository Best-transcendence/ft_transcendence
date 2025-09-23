// File aimed at holding popups for user input

// Camille add comment
export function triggerInputPopup()
{
	const editName = document.getElementById("edit-name-button");
	const editBio = document.getElementById("edit-bio-button");
	const popUp = document.getElementById("input-popup");
	const overlay = document.getElementById("popup-overlay");

	if (!editName || ! editBio || !popUp || !overlay)
		return ;

	editName.addEventListener("click", () =>
	{
		overlay.style.display = "block";
		popUp.style.display = "block";
	});

	editBio.addEventListener("click", () =>
	{
		overlay.style.display = "block";
		popUp.style.display = "block";
	});

	popUp.querySelectorAll("button").forEach(item =>
	{
		item.addEventListener("click", () =>
		{
			const option = item.getAttribute("data-action");
			switch (option)
			{
				case "Name":
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
export function inputPopup()
{
	return `
	<div id="input-popup"
	class="bg-gray-200 rounded-2xl w-[400px] p-6 space-y-4 z-50
	shadow-[0_0_30px_10px_#7037d3]
	text-center
	transition duration-300 scale-95"
	style="display: none; position: fixed; top: 50%; left: 50%;
	transform: translate(-50%, -50%); z-index: 50;">

		<h3 class="text-lg font-semibold text-gray-800 mb-4">Edit Name</h3>

		<input id="name"
		class="w-full p-3 rounded-lg border border-gray-300
		outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
		text-gray-800 bg-gray-400
		placeholder-gray-600"
		type="text"
		placeholder="Name" />

		<div class="flex justify-end gap-3 mt-6">
			<button data-action="cancel" class="px-4 py-2 text-black hover:text-purple-700 cursor-pointer">Cancel</button>
			<button data-action="save" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">Save</button>
		</div>
	</div>`;
}
