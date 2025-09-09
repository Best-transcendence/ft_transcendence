// Configure sidebar actions
export function initSidebar()
{
	const profileLogo = document.getElementById("profile-logo");
	const sideMenu = document.getElementById("side-menu");

	if (!profileLogo || !sideMenu)
		return;

	// Sidebar open+close
	profileLogo.addEventListener("click", () =>
	{
		sideMenu.classList.toggle("-translate-x-full");
		sideMenu.classList.toggle("translate-x-0");
	});

	// Option links
	sideMenu.querySelectorAll("li").forEach(item =>
	{
		item.addEventListener("click", () =>
		{
			const option = item.getAttribute("data-action");
			sideMenu.classList.add("-translate-x-full");
			sideMenu.classList.remove("translate-x-0");

			switch (option)
			{
				case "profile":
					window.location.hash = "profile";
					break;
				case "playpong":
					window.location.hash = "intro";
					break;
				case "friends":
					break;
				case "stats":
					break;
				case "history":
					break;
			}
		});
	});
}

// Handles sidebar display -> can be used as ${ sidebarDisplay } instead of repeating the whole block
export function sidebarDisplay()
{
	return `
	<div id="side-menu"
		class="fixed  w-[300px] left-0 top-[92px] h-[calc(100%-92px)]
		bg-white shadow-lg transform -translate-x-full
		transition-transform duration-300
		z-40 text-black rounded-tr-2xl rounded-br-2xl">

		<ul class="flex flex-col p-4 gap-4">
			<li data-action="playpong" class="cursor-pointer hover:text-blue-600">Play Pong</li>
			<li data-action="profile" class="cursor-pointer hover:text-blue-600">Profile</li>
			<li data-action="friends" class="cursor-pointer hover:text-blue-600">Friends</li>
			<li data-action="stats" class="cursor-pointer hover:text-blue-600">Statistics</li>
			<li data-action="history" class="cursor-pointer hover:text-blue-600">Match history</li>
		</ul>

	</div>`;
}



