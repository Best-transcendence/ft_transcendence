# ft_transcendence

> Online multiplayer Pong platform with microservices, tournament matchmaking system, AI opponent, dashboard, full i18n language translation, WAF + ModSecurity, ELK stack and optionally Vault protection  — built for the 42 **ft_transcendence** project.

---

## Table of Contents

- [1. Usage](#1-usage)
   - [1.1 Repository Structure](#11-repository-structure)
- [2. Implemented 42 Subject Modules](#2-implemented-42-subject-modules)
- [3. High-Level Architecture](#3-high-level-architecture)
- [4. Backend Microservices](#4-backend-microservices)
  - [4.1 Gateway Service](#41-gateway-service)
  - [4.2 Auth Service](#42-auth-service)
  - [4.3 User Service](#43-user-service)
  - [4.4 WebSocket Service](#44-websocket-service)
- [5. Frontend](#5-frontend)
- [6. Game Modes](#6-game-modes)
  - [6.1 Remote Multiplayer](#61-remote-multiplayer-major-remote)
  - [6.2 AI Opponent](#62-ai-opponent-major-ai)
- [7. Dashboard](#7-dashboard-minor-dashboard)
- [8. Database Layer](#8-database-layer-minor-database)
- [9. Security: WAF + Vault + JWT](#9-security-waf--vault--jwt)
  - [9.1 WAF & ModSecurity](#91-waf--modsecurity-major-waf)
  - [9.2 HashiCorp Vault Integration](#92-hashicorp-vault-integration)
  - [9.3 JWT Authentication](#93-jwt-authentication)
- [10. Logging & Monitoring (ELK)](#10-logging--monitoring-elk-major-elk)
- [11. Internationalization (i18n)](#11-internationalization-i18n-minor-language)
- [12. Browser Support](#12-browser-support-minor-browser)
- [13. Service URLs](#13-service-urls)

---

## 1. Usage

1️⃣ **Clone the repository**

```bash
git clone https://github.com/ngtina99/ft_transcendence.git
cd ft_transcendence
```

2️⃣ Build the server

```bash
make
```

4️⃣ Access the server

In a browser: 
```text
https://<YOUR_LAN_IP>
```

### 1.1 Repository Structure

```text
ft_transcendence/
├── Makefile                 # Main dev & deployment workflows (Vault, Docker, etc.)
├── docker-compose.yml       # All services (WAF, Vault, backend, frontend, ELK)
├── backend/
│   ├── auth-service/        # JWT login/register, auth API, SQLite db
│   ├── user-service/        # Profiles, stats, matches, SQLite db
│   ├── ws-service/          # WebSocket game engine & rooms
│   ├── gateway/             # Single HTTP entrypoint, routing to microservices
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── main.ts          # SPA bootstrap
│       ├── router.ts        # Custom router + route guards + LanguageSwitcher hooks
│       ├── pages/           # Intro, Game, Dashboard, History, Auth, etc.
│       ├── components/      # Header, sidebar, profile, logout button, etc.
│       ├── games/           # Pong game engine + AIOpponent
│       └── services/
│           ├── api/         # Gateway HTTP client
│           ├── ws/          # WebSocket client
│           └── lang/        # i18n engine and translations
├── waf/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── modsecurity.conf
├── vault/
│   └── README.md            # Manual Vault setup instructions
```

---

## 2. Implemented 42 Subject Modules

- **Major – Backend**  
  Full microservice backend: auth, user, gateway, websockets, all containerized.

- **Minor – Frontend**  
  Custom SPA in TypeScript (Vite), own router, components, and responsive UI.

- **Minor – Database**  
  Separated SQLite databases per service, with schema & migrations.

- **Major – Standard User**  
  Registration/login, session via JWT, profile editing, avatars, and match history.

- **Major – Remote**  
  Online multiplayer Pong over WebSockets with proper room/sync logic.

- **Major – AI**  
  AI opponent with multiple difficulty levels implemented in `frontend/src/games/AIOpponent.ts`.

- **Minor – Dashboard**  
  Statistics dashboard with charts and recent match list, implemented in `frontend/src/pages/Dashboard.ts`.

- **Major – WAF, ModSecurity**  
  NGINX-based WAF with ModSecurity and OWASP CRS in `waf/`.

- **Major – ELK**  
  Full ELK stack with Filebeat, Logstash, Elasticsearch, and Kibana.

- **Major – Microservices**  
  Auth / User / WebSocket / Gateway split with separate databases and APIs.

- **Minor – Browser**  
  Browser-based SPA; tested and designed for modern desktop browsers.

- **Minor – Language**  
  Internationalization with multiple locales in `frontend/src/services/lang/Translations.ts`.

---

## 3. High-Level Architecture

**Request path (HTTP):**

```text
Browser (HTTPS) 
   → WAF (NGINX + ModSecurity) 
   → Gateway Service (Node/Express)
      → Auth Service (JWT issuance / login)
      → User Service (profiles, stats, matches)
      → WS Service (WebSocket upgrade coordination)
```

**Real-time game path:**

```text
Browser WebSocket (wss://…/ws)
   → WAF
   → Gateway / WS Service
   → Game room engine (per-match state, paddle/ball updates)
```

**Observability pipeline:**

```text
All backend services (JSON logs) 
   → Filebeat 
   → Logstash 
   → Elasticsearch 
   → Kibana (dashboards & log search)
```

**Secret management:**

```text
Vault (vault-service)
   → stores JWT secret(s)
   → stores TLS cert keypair for WAF
   → provides secrets to backend containers via environment
```

## 4. Backend Microservices

Each microservice is in backend/<service-name> with its own main.js, routes, and database.

---

### 4.1 Gateway Service
**Location:** `backend/gateway/`  
**Role:** Single entry point for all API traffic from the WAF

#### Responsibilities
- Routes incoming requests:
  - `/auth/*` → auth-service
  - `/users/*` + statistics → user-service
  - `/ws/*` + match endpoints → ws-service
- Validates JWT tokens using shared secret from Vault
- Normalizes API responses
- Centralized error handling
- Access logging for ELK pipeline
- Swagger documentation at:
  - `/api/docs`

---

### 4.2 Auth Service
**Location:** `backend/auth-service/`

#### Responsibilities
- User registration and login
- Password hashing using **bcrypt**
- Generates JWT access tokens with `JWT_SECRET`
- Credential verification via SQLite database
- Validation middleware + proper error responses

---

### 4.3 User Service
**Location:** `backend/user-service/`

#### Responsibilities
- Manages persistent user profiles:
  - username, display name, avatar, etc.
- Match history:
  - scores, players, timestamps, game type
  - provides recent matches for dashboard
- Statistics API:
  - total games, wins, losses, draws
  - points for/against, highest score
  - win rate, streaks, point differential
- Friends / relationships (where implemented)
- REST API endpoints consumed by the gateway

---

### 4.4 WebSocket Service
**Location:** `backend/ws-service/`

#### Responsibilities
- Real-time WebSocket engine for Pong game
- Lobby / matchmaking (queue + pairing)
- Game room lifecycle:
  - create room
  - assign players
  - manage disconnects
- Syncs gameplay state:
  - ball + paddle positions
  - scores
  - state updates
- Emits events:
  - game start
  - score updates
  - game end / winner
- Produces logs for Filebeat → ELK

---

## 5. Frontend

**Location:** `frontend/`  
**Stack:** TypeScript + Vite + plain DOM/TS (no React), Tailwind-like utility classes

### Key Structure

#### `src/main.ts`
- SPA bootstrap: mounts the app and initializes:
  - custom router
  - theme
  - localization (i18n)

#### `src/router.ts`
- Hash-based navigation (`#intro`, `#dashboard`, `#history`, `#game`, `#login`, `#register`, etc.)
- Protected routes that require authentication (JWT check + user state)
- Listens to `lang:changed` events for the LanguageSwitcher

#### `src/pages/`
- `Intro.ts` — Landing page
- `Login.ts` / `Register.ts` — Authentication pages
- `Dashboard.ts` — User stats dashboard
- `History.ts` — Full match history
- `Game.ts` — Main gameplay page (remote + AI)

#### `src/components/`
Reusable UI components:
- profile header
- sidebar
- logout button
- theme toggle
- modal windows

#### `src/services/`
- `api/` – All HTTP requests via **Gateway**
- `ws/` – WebSocket client for multiplayer games
- `lang/` – i18n system

**Notes**
- Fully responsive: desktop-first but supports smaller screens
- Gameplay drawn via `<canvas>` + `requestAnimationFrame`

---

## 6. Game Modes

### 6.1 Remote Multiplayer (Major: Remote)

- Join matchmaking queue
- Server pairs two online players
- Real-time WebSocket game loop:
  - Client → sends paddle movement & ready events
  - Server → authoritative ball physics, scoring, win/lose state
  - Server → broadcasts updated game state to both players
- Final results are stored via **user-service** as a `ONE_VS_ONE` match
- Match entries are later used for:
  - History page
  - Dashboard stats (wins, losses, points, streaks, etc.)

---

### 6.2 AI Opponent (Major: AI)

**Location:** `frontend/src/games/AIOpponent.ts`

- Runs **client-side only**
- Multiple difficulty levels with different:
  - Prediction accuracy
  - Reaction time / delay
  - Max paddle speed
- Core logic:
  - Reads ball position & velocity
  - Predicts where the ball will intersect the AI paddle line
  - Moves towards the target with human-like speed limits (not “perfect”)
- Results are stored as matches of type `AI`, so:
  - They appear in history
  - They contribute to dashboard statistics (but are distinguishable by type)

---

### 6.3 Tournament System (part of Remote – Tournament Match Types)

Tournament matches reuse the same WebSocket engine as normal remote games, but add a small **single-elimination bracket** flow on top.

**Match types used:**

- `TOURNAMENT_1V1` – opening / early round
- `TOURNAMENT_INTERMEDIATE` – intermediate / semi-final round
- `TOURNAMENT_FINAL` – final round

**High-level flow:**

1. **Tournament join**
   - Player selects *Tournament* mode from the game menu.
   - The client sends a tournament join request to the **WS service** through the gateway.
   - Server groups players into small brackets (e.g. 4 players → 2 semis + 1 final).

2. **Bracket & room creation**
   - For each round, the WS service:
     - Creates WebSocket “rooms” for pairs of players.
     - Marks the match with the correct `type`:
       - `TOURNAMENT_1V1` or `TOURNAMENT_INTERMEDIATE` for earlier rounds
       - `TOURNAMENT_FINAL` for the final
   - Each room runs a standard Pong match over WebSockets.

3. **Playing the rounds**
   - Inside a round, the game loop is identical to classic remote:
     - Clients send paddle updates.
     - Server computes ball physics and score.
     - State is broadcast to both players.
   - When one player reaches the winning condition:
     - WS service decides the **winner** and **loser**.
     - The result is sent to **user-service** to be stored as a tournament match entry.

4. **Advancement & elimination**
   - Winners move to the next round in the bracket.
   - Losers are eliminated from the tournament.
   - The final round (`TOURNAMENT_FINAL`) determines the **tournament champion**.

5. **Persistence & dashboard integration**
   - Every tournament game is saved through **user-service** with:
     - `type` ∈ {`TOURNAMENT_1V1`, `TOURNAMENT_INTERMEDIATE`, `TOURNAMENT_FINAL`}
     - scores, players, timestamps, winner
   - The **Dashboard** can then:
     - Show how many tournament games were played
     - Distinguish tournament performance from normal `ONE_VS_ONE` and `AI` matches
     - Use tournament games in performance charts and recent matches list

---

## 7. Dashboard (Minor: Dashboard)

**Location:** `frontend/src/pages/Dashboard.ts`

### Views / Widgets
- **Statistics Overview**
  - total games
  - wins / losses / draws
  - win rate + streaks
  - points for / against + highest score
  - “Last updated” based on recent match

- **Game Outcomes (Pie/Donut Chart)**
- **Match Types Distribution (Bar Chart)**
  - ONE_VS_ONE
  - Tournament rounds
  - AI
- **Performance Over Time (Line Chart)**
  - cumulative win rate
- **Recent Matches**
  - last 3 matches with opponent, type, date, score
  - link to full history (#history)

> All charts rendered manually using **HTML5 Canvas** (no third-party chart library)

---

## 8. Database Layer (Minor: Database)

Each backend service has **its own** SQLite database:
- Auth DB — users + credentials
- User DB — profiles, stats, matches
- WS DB (optional) — temporary/persistent game session data

Accessed using plain SQL via Node modules (e.g. `better-sqlite3`)

✔ Microservice data ownership  
✔ Local but realistic architecture

---

## 9. Security: WAF + Vault + JWT

### 9.1 WAF & ModSecurity (Major: WAF)

**Location:** `waf/`

- NGINX reverse proxy with **ModSecurity** + **OWASP CRS**
- TLS termination using self-signed certificates (stored in Vault)
- Protects against:
  - SQLi
  - XSS
  - Path traversal
  - Bad user agents
- Only forwards requests to **gateway-service**

See: `waf/README.md` for ruleset + tuning

---

### 9.2 HashiCorp Vault Integration

**Location:** `vault/`, Makefile scripts

Vault stores:
- `secret/jwt` → `JWT_SECRET` used by all backend services
- `secret/ssl` → TLS cert + key for WAF

Vault container:
- manually initialized once per host
- auto-unsealed using `.vault-keys`

---

### 9.3 JWT Authentication
- Login → receives JWT
- JWT in `Authorization` header for every request
- Gateway validates token before forwarding to services
- Secret securely sourced from Vault

---

## 10. Logging & Monitoring (ELK) (Major: ELK)

**Location:**  
- `backend/*/utils/logger.js`  
- `docker-compose.yml`  
- `backend/ELK_eval.md`

### Stack Components
| Component     | Role |
|--------------|------|
| Filebeat     | Tails backend logs, forwards to Logstash |
| Logstash     | Parses JSON logs, enriches, forwards to Elasticsearch |
| Elasticsearch | Stores logs + enables search |
| Kibana       | UI dashboard for log analytics |

### Log Format
All services emit structured JSON logs:
- timestamp
- log level
- service name
- message
- metadata
- correlation IDs supported

---

## 11. Internationalization (i18n) (Minor: Language)

**Location:** `frontend/src/services/lang/`

- `LangEngine.ts` — `t(key)` translation function
- `Translations.ts`:
```ts
export const translations = {
  en: { ... },
  fr: { ... },
  de: { ... },
  es: { ... },
  pt: { ... },
  hu: { ... },
};
```

LanguageSwitcher component:

- Globally wired in router.ts using setupLanguageSwitcher.
- Emits a lang:changed event.
- Router listens and re-renders the current page with the new language.
- All user-facing texts (menus, buttons, dashboard labels, etc.) go through t("key"), giving consistent translations across the app.

## 12. Browser Support (Minor: Browser)

The app is a single-page browser application:

Designed for modern desktop browsers:

- Chrome
- Firefox
- Safari

Uses:

- ES modules
- requestAnimationFrame for game loops
- WebSockets for multiplayer
- localStorage for tokens

No native desktop client, no mobile app — everything happens in the browser.

---

## 13. Service URLs

Assuming the WAF resolves to https://<LAN_IP> (printed by the Makefile):

- **Frontend:**  
  `https://<LAN_IP>`

- **Gateway (API root):**  
  `https://<LAN_IP>/api/`

- **WebSocket:**  
  `wss://<LAN_IP>/ws/`

### Swagger / API Docs

- Gateway docs:  
  `https://<LAN_IP>/api/docs`
- Auth service docs:  
  `https://<LAN_IP>/auth-docs/`
- User service docs:  
  `https://<LAN_IP>/user-docs/`
- WebSocket service docs:  
  `https://<LAN_IP>/ws-docs/`

### Logging & Monitoring
- Kibana:  
  `https://<LAN_IP>/kibana/`
- Elasticsearch (if exposed):  
  `https://<LAN_IP>/elasticsearch/`

---
