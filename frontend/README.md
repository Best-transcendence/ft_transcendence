# 🎮 ft\_transcendence – Frontend

This branch contains the **frontend part** of the ft\_transcendence project.
We are building a **vanilla TypeScript SPA** with **TailwindCSS** (Frontend module) and using **Parcel** as bundler.

# ONLY FOR TINA (not compatible with my PC setup 😔)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 22.12.0
nvm use 22.12.0
nvm alias default 22.12.0

---

- [1. Usage (setup & run)](#usage)
- [2. Overview](#overview)

---

# Usage

# Device compatibility

Run and connect to the network from your phone
```bash
npm run dev -- --host 0.0.0.0 --port 4000
```
Or connect to the link from localtunnel

```bash
npx localtunnel --port 4000
curl https://loca.lt/mytunnelpassword
```

## ⚙️ Setup & Run (Local Dev)

### 0. Clear cache in browser if needed

Hard Refresh
Mac: Cmd + Shift + R
Windows/Linux: Ctrl + Shift + F5 or Ctrl + F5



### 1. Install dependencies

```bash
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss -i ./public/styles.css -o ./public/output.css
```

### 2. Run the server

*In case you changed something on the frontend*
```bash
rm -rf dist .parcel-cache
```

```bash
npm run dev
```

SPA will be available at 👉 `http://localhost:3000` (configurable via `FRONTEND_PORT` and `FRONTEND_URL` in root `.env`)


## 📦 Available Scripts

* `npm run start` → Runs Parcel dev server (hot reload).
* `npm run build` → Bundles frontend for production.
* `npm run tailwind:build` → Rebuilds Tailwind CSS.

---

### Workflow:

1. Start from latest `develop`:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/login-page
   ```
2. Do your work & commit often.
3. Push your branch:

   ```bash
   git push origin feature/login-page
   ```
4. Open a Pull Request into `develop`.
5. Another teammate reviews → then merge.
6. When a sprint ends, `develop` → `main` (stable release).

---

## 🎯 Roadmap (Frontend Leader)

* [x] SPA skeleton with router.
* [x] TailwindCSS setup.
* [ ] Login Page.
* [ ] Lobby Page (choose PvP, AI, Tournament).
* [ ] Tournament system UI.
* [ ] Pong2D prototype.

---

# Overview

## 1. ROOT

## .env
- backend API URL for frontend calls

## vite.config.ts
- server settings
- npm run dev - Vite serves the root index.html -> processes files in src/main.ts (entry point file)

FAVICON 'trick'
```bash
<!-- 1. Hard reload with cache disabled (during development)
Open DevTools (F12 or Ctrl+Shift+I / Cmd+Opt+I on Mac).
Go to the Network tab.
Check "Disable cache" (checkbox at the top).
Refresh with Ctrl+Shift+R or Cmd+Shift+R. -->
```

DOM tree:
```bash
Document
└── html
    ├── head
    │   └── title → "My Page"
    └── body
        ├── div#root
        └── p → "Hello World!"
```

HTML tag beomes a DOM node, which JavaScript can access and manipulate dinamically
```html
<div id="root"></div> → This entire <div> is a DOM element.
<p>Hello World!</p> → This <p> tag is another DOM element.
```

In JavaScript, you can interact with these using the document object:
```bash
const rootElement = document.getElementById("root");
console.log(rootElement);
// Logs: <div id="root"></div>
```

## tailwind.config.ts
- import tailwind, satisfies config-> typescript will catch mistakes in tailwind configs (e.g.:exnted: {}, // ❌ typo! should be 'extend')

## 2. src folder

## main.ts - index.html entrypoint

- hashchange → Fires when the URL hash (#/home, #/about, etc.) changes
- DOMContentLoaded → Fires once the initial HTML is fully loaded

bootstrapping your routing system, meaning it's hooking up event listeners so your SPA (Single Page Application) knows when to update the view

User loads http://example.com/#/home → DOMContentLoaded fires → router() runs → show home page.

User clicks link to http://example.com/#/about → hashchange fires → router() runs again → show about page.
The # lets you update the URL without triggering a full page reload.

User clicks browser back button → hashchange fires again → router() runs → show previous page.

## router.ts

- Handling navigation in your Single Page Application (SPA).
- Mapping URLs (hashes) to the correct page or component.
- Ensuring protected pages (like profile or game) check if the user is logged in before rendering.

The router decides what to show on the screen, but it doesn't contain the actual pages or components itself.

import { getCurrentUser } from "./services/api";

- This is a service function that contacts your backend to fetch the currently logged-in user.
- It’s used by fetchUser() inside router.ts to:
- Check if the user is logged in.
- Protect pages that require authentication.

Without protectedPage:
Anyone could access protected routes like #/pong2d without logging in.
Your app would have no security layer between public and private pages.

With protectedPage:
All authentication logic is centralized in one place.
Your router stays clean and simple:

```bash
case "intro":
  protectedPage(() => GameIntroPage());
  break;
```
