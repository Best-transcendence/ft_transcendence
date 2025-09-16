// Centralize the logOut button
export function logOutBtn()
{
	const logoutBtn = document.getElementById("logout-btn");

	logoutBtn?.addEventListener("click", () =>
	{
		localStorage.removeItem("jwt");
		window.location.hash = "login";
	});
}

export function LogOutBtnDisplay()
{
	return `<button id="logout-btn"
				class="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
				Logout
			</button>`
}
