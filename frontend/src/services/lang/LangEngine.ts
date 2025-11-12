import { translations, Lang } from "./Translations";

// Always fall back to English if missing
const DEFAULT_LANG: Lang = "en";

// Get current chosen language from localStorage
export function getLang(): Lang {
	return (localStorage.getItem("lang") as Lang) || DEFAULT_LANG;
}

// Update language and reload UI
export function setLang(lang: Lang) {
	localStorage.setItem("lang", lang);
	window.location.reload();
}

// Translator helper
export function t(key: string): string {
	const lang = getLang();
	// Return key value or default or the string if doesn't find
	return translations[lang][key] || translations[DEFAULT_LANG][key] || key;
}