---

# 🎮 ft\_transcendence – Frontend

This branch contains the **frontend part** of the ft\_transcendence project.
We are building a **vanilla TypeScript SPA** with **TailwindCSS** (Frontend module) and using **Parcel** as bundler.

---

## 🗂️ Project Structure

```
frontend/
│── public/
│    ├── index.html         # Root HTML entry
│    ├── styles.css         # Tailwind entry
│    └── assets/            # Images, logos, icons
│
│── src/
│    ├── app.ts             # SPA bootstrap
│    ├── router.ts          # Simple router
│    │
│    ├── pages/             # Screens of the app
│    │    ├── LoginPage.ts
│    │    ├── LobbyPage.ts
│    │    ├── TournamentPage.ts
│    │    └── GamePage.ts
│    │
│    ├── components/        # Reusable UI widgets
│    │    ├── Button.ts
│    │    ├── InputField.ts
│    │    └── ScoreBoard.ts
│    │
│    ├── game/              # Game logic
│    │    ├── Pong2D.ts
│    │    └── Pong3D.ts
│    │
│    └── services/          # API + WebSockets
│         ├── api.ts
│         ├── ws.ts
│         └── auth.ts
│
│── package.json
│── tsconfig.json
│── tailwind.config.js
│── Dockerfile
```

---

## ⚙️ Setup & Run (Local Dev)

### 1. Install dependencies

```bash
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
```

### 2. Run the server

```bash
npm run dev
```

SPA will be available at 👉 `http://localhost:1234`


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
* [ ] Upgrade to Pong3D (Babylon.js).

---

💡 *This README is only for the **frontend branch**. The full project will also include backend, DB, blockchain, and devops services.*

---
