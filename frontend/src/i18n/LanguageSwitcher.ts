import { setLang, getLang } from "./lang";

export function LanguageSwitcher(): string {
  const current = getLang();
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

export function setupLanguageSwitcher() {
  document.getElementById("langSwitcher")?.addEventListener("change", (e) =>
    setLang((e.target as HTMLSelectElement).value as any)
  );
}