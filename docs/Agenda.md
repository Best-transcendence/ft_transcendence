# 📌 PROJECT SEGMENTS

## 🎨 Frontend & UI
- [ ] Sets up TypeScript SPA (React or Vanilla + Router).
- [ ] Implements UI for login, register, tournament flow, Pong canvas.
- [ ] Adds TailwindCSS if you choose that module.
- [ ] Works closely with Game dev.
- [ ] Provides **end-game screen** and **rules/manual/help** for Pong.
- [ ] Ensures SPA works with **Back/Forward buttons** and runs on **latest Chrome** without console errors.

---

## 🕹️ Game & Mechanics
- [ ] Builds the Pong game engine (local keyboard first).
- [ ] Adds tournament & matchmaking logic.
- [ ] Later: extends to remote players, multiplayer, AI opponent.
- [ ] Works with Frontend to integrate canvas/game state.
- [ ] Ensures game **feels like classic Pong (1972)**.
- [ ] Handles **lag/disconnects gracefully** (pause, timeout, rejoin) so the game never crashes.

---

## 🗄️ Backend & Security/User Management
- [ ] Sets up API (Fastify/Node.js) or pure PHP if you stay default.
- [ ] Implements login, registration, profiles, match history.
- [ ] Connects to SQLite DB (if that module chosen).
- [ ] Adds JWT + 2FA if chosen.
- [ ] Responsible for form validation & security (SQLi/XSS).
- [ ] Hashes **all stored passwords** and validates/sanitizes all user inputs.
- [ ] Ensures HTTPS/wss is used for all routes and realtime features.

---

## ⚙️ Infrastructure & DevOps
- [ ] Writes Dockerfiles + docker-compose (must run with one command).
- [ ] Sets up HTTPS/TLS with certs.
- [ ] Manages .env + secrets.
- [ ] Implements logging, monitoring, microservices if chosen modules.
- [ ] Double-checks eval sheet compliance (acts as internal evaluator).
- [ ] Provides **`.env.example`** and ensures `.env` is **gitignored**.
- [ ] Verifies **docker-compose.yml is at repo root** and launches full stack via `docker-compose up --build`.





# 📅 PROJECT ROADMAP

## 🟢 Week 0 — Setup & Alignment
- [ ] Create repo + branches (`main`, `develop`).
- [ ] Add `.gitignore`, `.env.example`, `README.md`.
- [ ] Ensure `.env` is **gitignored** (eval rule).
- [ ] Split tasks or roles: Frontend, Game, Backend, Infra.
- [ ] Create folder skeleton:
	/docker-compose.yml
	/frontend/
	/backend/
	/proxy/ # nginx/caddy/traefik TLS termination
	/db/ # migrations or seed for SQLite if used
	/docs/ # architecture, runbook, eval notes

**Goal:** Everyone aligned, repo structure ready.

---

## 🟢 Week 1 — Infrastructure & SPA Skeleton
**Infra**
- [ ] Write `docker-compose.yml` at repo root (frontend + backend + proxy).
- [ ] Add TLS termination (self-signed/dev certs).
- [ ] Verify `docker-compose up --build` works.

**Frontend**
- [ ] Setup TypeScript SPA scaffold (React + Router).
- [ ] Add routes `/login`, `/register`, `/tournament`, `/play`.

**Backend**
- [ ] Create simple server (Fastify or PHP).
- [ ] Add `GET /health`.

**Game**
- [ ] Canvas placeholder (static Pong field).

**Goal:** One-command stack launches; SPA shell visible.

---

## 🟢 Week 2 — Authentication & Local Pong
**Backend**
- [ ] Implement register/login API with hashed passwords.
- [ ] Validate/sanitize inputs (server-side).
- [ ] Add JWT/cookie sessions.

**Frontend**
- [ ] Build register/login forms.
- [ ] Handle errors & redirects.
- [ ] Navbar updates when logged in.

**Game**
- [ ] Build local Pong (2 players, keyboard split).
- [ ] Add scoring & win condition.
- [ ] Add **end-game screen** + **rules/manual**.

**Infra**
- [ ] Confirm HTTPS works.
- [ ] Test `.env` injection in containers.

**Goal:** Auth + Local Pong fully working inside SPA.

---

## 🟢 Week 3 — Tournament & Stability
**Backend**
- [ ] Tournament API: create, join (with alias), next match, report result.
- [ ] Store match history in DB.

**Frontend**
- [ ] Tournament UI (brackets/list).
- [ ] Integrate with API.

**Game**
- [ ] Connect tournament to Pong matches.
- [ ] Add basic handling for lag/disconnects (pause/rejoin).

**Infra**
- [ ] Polish Dockerfile layers & build speed.
- [ ] Add healthchecks to containers.

**Goal:** Play full tournament locally → SPA + Auth + Pong + Tournament.

---

## 🟢 Week 4 — Security & Eval Readiness
- [ ] Double-check `.env` policy (no secrets in repo).
- [ ] Ensure SPA works with **Back/Forward** buttons.
- [ ] Verify **latest Chrome** compatibility (no console errors).
- [ ] Check HTTPS + WSS works everywhere.
- [ ] Test lag/disconnects: no crash.
- [ ] Prepare checklist vs eval sheet.

**Goal:** Mandatory part ✅ ready for defense.

---

# 🔵 Module Execution (Pick 7 Majors worth)

Each module is built in this order for safety:

## 🟦 Week 5
- **Game Dev**: Add Remote Players (Major).
- **Frontend**: Add TailwindCSS (Minor).
- **Backend**: Add Extended User Management (Major).

## 🟦 Week 6
- **Game Dev**: Add Multiplayer (Major).
- **Backend**: Add JWT + 2FA (Major).
- **Infra**: Add Prometheus monitoring (Minor).

## 🟦 Week 7
- **Game Dev**: Add AI Opponent (Major).
- **Frontend**: Add Multi-language support (Minor).

## 🟦 Week 8
- **Infra**: Add Microservices split (Major).
- **Frontend**: Add Stats Dashboard (Minor).
- **All**: Prepare defense demos + documentation.

---

# ✅ Final Defense Prep
- [ ] All modules tested against eval sheet (no visible errors).
- [ ] Document “what/why/how” for every module in `/docs/` + README.
- [ ] Run full stack from scratch with `docker-compose up --build`.
