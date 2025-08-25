# 📌 PROJECT SEGMENTS

## 🎨 Frontend (Next.js + TypeScript)
- [ ] Sets up **Next.js SPA/SSR hybrid** with TypeScript.
- [ ] Implements UI for login, register, tournament flow, Pong canvas, chat.
- [ ] Ensures **responsive design** (desktop, tablet, mobile).
- [ ] Adds **accessibility features** (WCAG compliance).
- [ ] Works closely with Game dev for seamless canvas integration.
- [ ] Provides **stats dashboard**, **rules/manual/help**, and **end-game screen**.
- [ ] Ensures smooth navigation (Back/Forward support) and **cross-browser compatibility**.

---

## 🕹️ Game & Mechanics
- [ ] Builds Pong engine (keyboard 2-player first).
- [ ] Extends to matchmaking, tournaments, multiplayer, AI opponent.
- [ ] Adds **live chat** during matches (WebSockets).
- [ ] Ensures game **feels like classic Pong** while supporting extensions.
- [ ] Handles **lag/disconnects gracefully** (pause, rejoin, timeout).
- [ ] Provides customization options (later module).

---

## 🗄️ Backend (NestJS + Postgres + Prisma)
- [ ] Sets up **NestJS backend** with REST + WebSocket endpoints.
- [ ] Connects to **Postgres via Prisma ORM**.
- [ ] Implements **Auth (JWT + 2FA)** with secure cookies.
- [ ] Manages users, profiles, tournament data, match history.
- [ ] Exposes APIs for chat, tournaments, stats.
- [ ] Validates & sanitizes all inputs, protects against **SQLi/XSS**.
- [ ] Expands later with **OAuth/SAML (remote auth)** and GDPR tooling.

---

## ⚙️ Infrastructure & DevOps
- [ ] Dockerize all services (`docker-compose up --build` at repo root).
- [ ] Proxy + TLS termination (Nginx or Traefik).
- [ ] Manages **secrets** with `.env` and Vault later.
- [ ] Sets up **logging + monitoring** stack.
- [ ] Provides `.env.example` (ensures `.env` is gitignored).
- [ ] Adds CI checks for linting, formatting, and type safety.
- [ ] Ensures HTTPS + WSS across stack.

---

# 📅 PROJECT ROADMAP

## 🟢 Week 0 — Foundations
- [ ] Create repo + branches (`main`, `develop`).
- [ ] Add `.gitignore`, `.env.example`, `README.md`.
- [ ] Ensure `.env` is gitignored (eval rule).
- [ ] Split ownership: Frontend, Game, Backend, Infra.
- [ ] Create folder skeleton:
	/docker-compose.yml
	/frontend/
	/backend/
	/proxy/ # nginx/caddy/traefik TLS termination
	/db/ # migrations or seed for SQLite if used
	/docs/ # architecture, runbook, eval notes

**Goal:** Everyone aligned, repo structure ready.

---
## 🟢 Week 1 — Base Infra & Scaffolds
**Infra**
- [ ] Docker-compose with services (frontend, backend, db, proxy).
- [ ] TLS termination with self-signed certs.
- [ ] Verify `docker-compose up --build` works.

**Backend**
- [ ] Init NestJS project with health check route.
- [ ] Connect Postgres + Prisma schema init.

**Frontend**
- [ ] Setup Next.js + TS scaffold with routes `/login`, `/register`, `/tournament`, `/play`.

**Game**
- [ ] Static Pong canvas placeholder.

**Goal:** One-command stack launches; SPA + backend health check visible.

---

## 🟢 Week 2 — Authentication & Local Pong
**Backend**
- [ ] Implement register/login APIs (hashed passwords).
- [ ] Add JWT + session cookies.
- [ ] Add 2FA module.

**Frontend**
- [ ] Build login/register pages with error handling.
- [ ] Navbar updates on auth state.

**Game**
- [ ] Implement local Pong (2 players, scoring, win condition).
- [ ] Add **rules/manual** + **end-game screen**.

**Infra**
- [ ] Test `.env` injection + secrets.
- [ ] Confirm HTTPS works across services.

**Goal:** Auth + Local Pong working inside SPA.

---

## 🟢 Week 3 — Tournament & WebSockets
**Backend**
- [ ] Tournament APIs (create/join/report).
- [ ] Store match history in Postgres.
- [ ] WebSocket gateway for chat/game sync.

**Frontend**
- [ ] Tournament UI (brackets/list).
- [ ] Integrate with API.
- [ ] Live chat panel.

**Game**
- [ ] Connect tournament matches to Pong.
- [ ] WebSocket integration for multiplayer sync.

**Infra**
- [ ] Add container healthchecks.
- [ ] Improve Dockerfile build speed.

**Goal:** Play full tournament locally, multiplayer scaffolding set.

---

## 🟢 Week 4 — Stability & Eval Readiness
- [ ] Check HTTPS + WSS end-to-end.
- [ ] Ensure SPA works with browser nav + is responsive.
- [ ] Verify Postgres schema migrations are reproducible.
- [ ] Test lag/disconnect handling.
- [ ] Run eval sheet checklist.

**Goal:** Core features ✅ ready for defense.

---

# 🔵 Module Execution (Majors & Minors)

## 🟦 Week 5
- **Backend**: Advanced Auth (OAuth/SAML) (Major).
- **Frontend**: Tailored responsive UI polish (Minor).
- **Infra**: Centralized logging & monitoring (Minor).

## 🟦 Week 6
- **Game**: Multiplayer (>2 players) (Major).
- **Frontend**: Accessibility features (Minor).
- **Infra**: Secrets mgmt (Vault, WAF) (Major).

## 🟦 Week 7
- **Game**: AI Opponent (Major).
- **Frontend**: Stats dashboard (Major).

## 🟦 Week 8
- **Infra**: Microservices split (Major).
- **Frontend**: Multi-language support (Minor).
- **All**: Documentation + defense prep.

---

# ✅ Final Defense Prep
- [ ] All modules tested against eval sheet (no visible errors).
- [ ] Document “what/why/how” in `/docs/` + README.
- [ ] Run full stack fresh via `docker-compose up --build`.