// Import two functions from the LangEngine module:
// - setLang: updates the current language
// - getLang: returns the currently active language
import { setLang, getLang } from "./LangEngine";

// This function returns the HTML markup (as a string) for the language selector dropdown.
export function LanguageSwitcher(): string {

// Get the currently active language so we can mark the matching <option> as "selected"
  const current = getLang();

  // Return the HTML of a <select> element containing all supported languages.
  // Whichever language matches `current` gets the "selected" attribute.
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

// This function attaches an event listener so the app reacts when the user changes the language.
export function setupLanguageSwitcher() {
	 // If it exists, listen for the "change" event => When the user picks a new language, call setLang() with the new language code
  document.getElementById("langSwitcher")?.addEventListener("change", (e) =>
    setLang((e.target as HTMLSelectElement).value as any)
  );
}
