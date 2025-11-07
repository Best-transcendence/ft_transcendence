import { sidebarDisplay } from "../components/SideBar";
import { profileDivDisplay } from "../components/ProfileDiv";
import { LogOutBtnDisplay } from "../components/LogOutBtn";
import { addTheme } from "../components/Theme";
import { ModeCards } from "../components/cards/ModeCards";
import { autoConnect } from "../services/ws";
import { t } from "../services/lang/LangEngine";
import { LanguageSwitcher } from "../services/lang/LanguageSwitcher";

// Adapted function now that data extraction has been centralized
export function GameIntroPage(): string {
  autoConnect(handleWSMessage);

  return `
    ${addTheme()}
    <div class="w-full flex justify-between items-center mb-10">
		<!-- Protected pages components -->
		${ profileDivDisplay() }
		${ sidebarDisplay() }
		<!-- Group Language and Logout on the right -->
		<div class="flex gap-2 items-center">
			${LanguageSwitcher()}
			 ${LogOutBtnDisplay()}
		</div>
	 </div>

    <h1 class="text-4xl font-heading font-bold mb-4"> ${t("arcadeClash")}</h1>
    <p class="text-lg text-gray-600 max-w-xl text-center mb-10">
      ${t("introSubtitle")}
    </p>

    <div class="flex gap-6 flex-wrap justify-center">
      ${ModeCards()}
    </div>
  `;
}

function handleWSMessage(msg: any) {
  switch (msg.type) {
    case "room:start":
      console.log("Match found! Room ID:", msg.roomId);
      localStorage.setItem("roomId", msg.roomId);
      window.location.hash = `remote?room=${encodeURIComponent(msg.roomId)}`;
      break;
    case "matchmaking:searching":
      console.log(" Waiting for opponent…");
      break;
    case "invite:error":
      alert("There are not players in this moment..");
      break;
  }
}
