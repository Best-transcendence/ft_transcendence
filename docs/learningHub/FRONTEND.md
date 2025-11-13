# npm install

- code: is the design (the unique creation).
- package.json: list of parts you need
- node_modules: toolbox your project depends on

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss -i ./public/styles.css -o ./public/output.css
```

# tailwindcss
- instead of writing long custom CSS rules, you use small utility classes directly in HTML/JSX:
```bash 
<button class="bg-blue-500 text-white p-2 rounded-lg">Click</button>
```

# autoprefixer
- This is a PostCSS plugin that automatically adds vendor prefixes for browser compatibility.
```bash 
display: flex;
```

# npm run dev
- reading from vite.config.ts

# package.json
- what my project needs (I want React version around 18)

# package-lock.json
- automatically generated, lock every dependencie from package.json

# .postcssrc.json
- Settings for the CSS processing pipeline
- tailwindcss: Plugin that generates your utility classes

# tsconfig.json
- what kind of JavaScript to output, which files to check, and how strict to be
- TypeScript rulebook

	## src/types/assets.d.ts
	- typescript understand

# tailwind.config.ts
- which files to scan, which colors/fonts to use, and what custom animations or themes you want
- Tailwind style rulebook

# index.html
- content source for tailwind.config.ts
- browser entrypoint

# main.ts
- entrypoint from index.html
- first load index.html/login, and after every hash changes

# router
- The router listens to changes in the browser’s URL (like #login, #lobby, or #tournament) and renders the correct page - only if the user is allowed to see it, also cleans up and authenticate



id="login-form"	DOM element	The form that will be handled in router.ts.
id="signup-toggle"	DOM element	Switch between login and signup.
id="google-login"	DOM element	Button to trigger Google OAuth (if implemented).
id="email-field", etc.	DOM elements	Input fields referenced by login/signup logic



| text size   | Size (approx) |
| ----------- | ------------- |
| `text-xs`   | 0.75rem       |
| `text-sm`   | 0.875rem      |
| `text-base` | 1rem          |
| `text-lg`   | 1.125rem      |
| `text-xl`   | 1.25rem       |
| `text-2xl`  | 1.5rem        |
| `text-3xl`  | 1.875rem      |
| `text-4xl`  | 2.25rem       |
| `text-5xl`  | 3rem          |
| `text-6xl`  | 3.75rem       |
| `text-7xl`  | 4.5rem        |
| `text-8xl`  | 6rem          |
| `text-9xl`  | 8rem          |

| padding                      | Meaning                       | Example → size      |
| ---------------------------- | ----------------------------- | ------------------- |
| `p-N`                        | padding all sides             | `p-8` → `2rem`      |
| `px-N` / `py-N`              | x/y axes                      | `px-4` → `1rem`     |
| `pt/pr/pb/pl-N`              | top/right/bottom/left         | `pt-6` → `1.5rem`   |
| `m-N`, `mx-N`, `my-N`, `mt…` | margin versions               | `mb-6` → `1.5rem`   |
| `top/right/bottom/left-N`    | offset on positioned elements | `top-10` → `2.5rem` |

| Shade       | Brightness | Example                     |
| ----------- | ---------- | --------------------------- |
| `50`        | very light | `bg-gray-50` = almost white |
| `100`–`300` | light      | soft tones                  |
| `400`–`600` | medium     | good for text/buttons       |
| `700`–`900` | dark       | background or dark text     |

| color logic              | What it styles   | Example           | Meaning                         |
| ------------------------ | ---------------- | ----------------- | ------------------------------- |
| `bg-{color}-{shade}`     | Background color | `bg-purple-600`   | Purple background (medium-dark) |
| `text-{color}-{shade}`   | Text color       | `text-gray-300`   | Light gray text                 |
| `border-{color}-{shade}` | Border color     | `border-gray-600` | Medium gray border              |

| manual                        | Meaning                              |
| ----------------------------- | ------------------------------------ |
| `bg-[#161220]`                | Custom hex color (dark purple-black) |
| `text-[rgb(255,0,0)]`       | Red text (RGB)                       |
| `border-[hsl(260,40%,50%)]` | Purple border (HSL)                  |

| interaction             | Effect                                   |
| ----------------------- | ---------------------------------------- |
| `hover:bg-purple-500`   | Background turns lighter purple on hover |
| `focus:ring-purple-500` | Adds a purple focus ring                 |
| `active:bg-purple-700`  | Darker background when pressed           |

| position                            | Meaning                                        |
| ----------------------------------- | ---------------------------------------------- |
| `grid`                              | grid layout                                    |
| `relative`                          | positioning context for absolute children      |
| `absolute`                          | positioned against nearest `relative` ancestor |
| `fixed`                             | fixed to viewport                              |
| `sticky`                            | sticks when crossing a threshold               |

| position form  | Display Mode            | Description                             | Common Use                                   |
| -------------- | ----------------------- | --------------------------------------- | -------------------------------------------- |
| `block`        | `display: block`        | Takes full width, starts on a new line  | `<div>`, `<p>` — default block elements      |
| `inline`       | `display: inline`       | Sits in line with text, width = content | `<span>` or icons                            |
| `inline-block` | `display: inline-block` | Like inline, but allows width/height    | Buttons or badges inside text                |
| `flex`         | `display: flex`         | Enables flexbox layout                  | Layout containers for centering or alignment |
| `inline-flex`  | `display: inline-flex`  | Flex container but stays inline         | Align buttons/icons horizontally inside text |

| flex alignment                            | Meaning                         |
| ----------------------------------------- | ------------------------------- |
| `items-start/center/end`                  | vertical alignment (cross-axis) |
| `justify-start/center/end/between/around` | horizontal (main-axis)          |
| `flex-col` / `flex-row`                   | direction                       |
| `gap-N`                                   | space between children          |

| size.                   | Example → size   |
| ----------------------- | ---------------- |
| `w-full` / `h-full`     | 100%             |
| `w-96`                  | 24rem            |
| `max-w-sm/md/lg/xl/2xl` | clamp card width |
| `min-h-screen`          | 100vh            |

| border radius  | Radius      |
| -------------- | ----------- |
| `rounded`      | 0.25rem     |
| `rounded-md`   | 0.375rem    |
| `rounded-lg`   | 0.5rem      |
| `rounded-xl`   | 0.75rem     |
| `rounded-2xl`  | 1rem        |
| `rounded-3xl`  | 1.5rem      |
| `rounded-full` | pill/circle |

| shadow         | Look                                                             |
| -------------- | ---------------------------------------------------------------- |
| `shadow`       | small                                                            |
| `shadow-md`    | medium                                                           |
| `shadow-lg`    | large                                                            |
| `shadow-xl`    | extra large                                                      |
| `shadow-2xl`   | biggest preset                                                   |
| `shadow-none`  | none                                                             |
| `shadow-inner` | inner shadow                                                     |
| `shadow-[…]`   | **custom** → `shadow-[0_0_30px_10px_#7037d3]` (blur/spread glow) |

| blur                                       | Meaning                   |
| ------------------------------------------ | ------------------------- |
| `backdrop-blur`                            | small blur behind element |
| `backdrop-blur-sm/md/lg/xl/2xl`            | stronger versions         |
| (normal `blur-*` blurs the element itself) |                           |

| transitions                        | Meaning         |
| ---------------------------------- | --------------- |
| `transition` / `transition-colors` | animate changes |
| `duration-200` / `ease-in-out`     | timing curve    |
| `hover:*` / `focus:*`              | state variants  |

# Translation
## Translation.ts
- Stores all the actual text translations
## LangEngine.ts
- Provides the t() function and get the word from Translation.ts
## LanguageSwitcher.ts
- The user interface (dropdown) to change the language and call LangEngine to get the word

# Tournament
1. TournamentLobby.ts UI
2. InitTournamentLobby.ts wire with listeners, everytime somebody change something on TournamentLobby.ts (utils: ensureMeFirst. rendering, sorting)
3. Tournament.ts from startAndGoTournament after trigger InitTournamentLobby.ts from clicking on let's start on TournamentLobby.ts
4. InitGameTournament: put game logic in the game area
5. TournamentFlow.ts ensure round logic (utils: ensureMeFirst)

# Log - printf

| C-style                              | JavaScript equivalent                                 |
| ------------------------------------ | ----------------------------------------------------- |
| `printf("Hello %d", x);`             | `console.log("Hello", x);`                            |
| `printf("x=%d, y=%d", x, y);`        | `console.log("x=", x, "y=", y);`                      |
| `printf("x=%d", x); fflush(stdout);` | `console.log("x=", x);` (flush happens automatically) |

# String protection logic
```bash
/^[a-z0-9._-]+$/
```

| Part          | Meaning                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| `/` ... `/`   | Marks the start and end of the regex                                                                         |
| `^`           | Start of the string                                                                                          |
| `[a-z0-9._-]` | Allowed characters: lowercase letters (`a–z`), digits (`0–9`), dot (`.`), underscore (`_`), and hyphen (`-`) |
| `+`           | One or more of those allowed characters                                                                      |
| `$`           | End of the string                                                                                            |


# Data types

| **Type**      | **Meaning**                                             |
| ------------- | ------------------------------------------------------- |
| **number**    | Any numeric value (integers, floats, `NaN`, `Infinity`) |
| **string**    | Text values (`"hello"`)                                 |
| **boolean**   | `true` or `false`                                       |
| **null**      | “Empty value” (intentional absence)                     |
| **undefined** | “Value not provided yet”                                |
| **symbol**    | Unique identifiers                                      |
| **bigint**    | Arbitrarily large integers (`123n`)                     |

| **TS Type**                                  | **Meaning (Short)**                                   |
| -------------------------------------------- | ----------------------------------------------------- |
| **`any`**                                    | Anything allowed; no type checking.                   |
| **`unknown`**                                | Like `any`, but you must check the type before using. |
| **`void`**                                   | Function returns nothing.                             |
| **`never`**                                  | Impossible value (unreachable).                       |
| **`string[]`**                               | Array of strings.                                     |
| **`Record<string, number>`**                 | Object with string keys and number values.            |
| **Union** (`number \| string`)               | Value can be one of several types.                    |
| **Literal** (`"easy" \| "medium" \| "hard"`) | Value must be exactly one of these fixed strings.     |
