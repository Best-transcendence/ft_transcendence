# Overview

## LangEngine.ts

- Holds the current language state and the t(key: string) function.
- Provides APIs to get/set language and broadcast changes via window.dispatchEvent(new CustomEvent("lang:changed", …)).
- Simple, key-based lookups into the translations object.

## Translations.ts

- Exports:
	- type Lang = "en" | "fr" | "de" | "es" | "pt" | "hu"
	- translations: Record<Lang, Record<string,string>>

- Contains every UI string, e.g.:
	- Auth (signIn, signUp, login, password, dontHaveAccount, …)
	- Game UI (pressStart, youWon, aiWon, itsATie, …)
	- Popups (confirm, cancel, areYouSureTitle, …)

## LanguageSwitcher.ts

- Renders a language dropdown/buttons.

```bash
<div class="fixed top-2 right-6 z-50">
  ${LanguageSwitcher()}
</div>
```

- On change, it calls the engine setter (e.g. setLang("fr")) and dispatches the global "lang:changed" event.
- Minimal UI; placement is up to you (commonly fixed in the top-right).

# Application 

1. Import t and translate text
```bash
import { t } from "../i18n/LangEngine";

// In a template string:
const title = `<h1>${t("arcadeClash")}</h1>`;
```

2. Translate labels/placeholders

```bash
<input placeholder="${t("email")}" />
<button>${t("login")}</button>
```

3. Combine translated label + dynamic value

```bash
// Avoid embedding variables *inside* the translation if you don't need to.
const welcome = `${t("welcomeBack")}${thisUser.name || t("username")}`;
```

4. Use the Language Switcher

```bash
import { LanguageSwitcher } from "../i18n/LanguageSwitcher";

const header = `
  <div class="fixed top-2 right-6 z-50">
    ${LanguageSwitcher()}
  </div>
`;
```

5. React to language changes (auto re-render)
- We dispatch a global lang:changed event when the language changes.
- Pages that register a listener re-render automatically.

```bash
// Example: in outer/protected page bootstrap
window.addEventListener("lang:changed", () => {
  //re-render logic here (e.g., protectedPage(() => Page(), eventsBinder))
});
```
