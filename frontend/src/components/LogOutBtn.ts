// Centralize the logOut button
import { disconnectSocket } from "../services/ws";
import { t } from "../services/lang/LangEngine";

export function logOutBtn()
{
	const logoutBtn = document.getElementById("logout-btn");

	logoutBtn?.addEventListener("click", () =>
	{
		localStorage.removeItem("jwt");
		//TODO : Make sure it fits Websocket implementation
	    disconnectSocket();
		window.location.hash = "login";
	});
}

export function LogOutBtnDisplay()
{
	return `<button id="logout-btn"
		class="px-4 py-2 border border-gray-300 shadow-[0_0_30px_10px_#7037d3] rounded-md text-sm hover:bg-gray-100 hover:text-black">
		 ${t("logout")}
	</button>`
}
