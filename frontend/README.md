---

# 🎮 ft\_transcendence – Frontend

This branch contains the **frontend part** of the ft\_transcendence project.
We are building a **vanilla TypeScript SPA** with **TailwindCSS** (Frontend module) and using **Parcel** as bundler.

---

## ⚙️ Setup & Run (Local Dev)

### 1. Install dependencies

```bash
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
```

### 2. Run the server

*In case you changed something on the frontend*
```bash
rm -rf dist .parcel-cache
```

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
