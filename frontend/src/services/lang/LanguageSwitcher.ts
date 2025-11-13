import { setLang, getLang } from "./LangEngine";
import { Lang } from "./Translations";


// Returns the HTML markup (as a string) for the language selector dropdown
export function LanguageSwitcher(): string {

	// Get the currently selected
	const current = getLang();

	// Return the HTML with the selected element
	// Shows the one with the keyword selected
	return `
		<select id="langSwitcher"
			class="px-4 py-2 border border-gray-300 shadow-[0_0_30px_10px_#7037d3] rounded-md text-sm bg-black text-white hover:bg-gray-100 hover:text-black cursor-pointer appearance-none"
			style="margin-right: 10px;">
			<option value="en" ${current === "en" ? "selected" : ""}>English</option>
			<option value="fr" ${current === "fr" ? "selected" : ""}>Français</option>
			<option value="de" ${current === "de" ? "selected" : ""}>Deutsch</option>
			<option value="es" ${current === "es" ? "selected" : ""}>Español</option>
			<option value="pt" ${current === "pt" ? "selected" : ""}>Português</option>
			<option value="hu" ${current === "hu" ? "selected" : ""}>Magyar</option>
		</select>
	`;
}

// Attaches an event listener, reacts when the user changes the language
export function setupLanguageSwitcher() {
  const dropdown = document.getElementById("langSwitcher") as HTMLSelectElement | null;
  if (!dropdown) return;

  dropdown.addEventListener("change", () => {
    const selectedLang = dropdown.value; // e.g.: en (as below)
    setLang(selectedLang as Lang); // cast once to your custom Lang type for function
  });
}
