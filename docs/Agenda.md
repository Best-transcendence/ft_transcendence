# 📑 Table of Contents

- *read third from 1-2*
- [0. Roles](#roles)
- [1. Development Roadmap](#development-roadmap)
- [2. Supplementary Roadmap](#supplementary-roadmap)
- *read second from 3-5*
- [3. My Recommended Modules](#my-recommended-modules)
- [4. Only If Modules](#only-if-modules)
- [5. Not Recommended Modules](#not-recommended-modules)
- *read first from 6-8*
- [6. Mandatory Minimum](#mandatory-minimum)
- [7. Module Explanation](#modules-explanation)
- [8. Risk Map](#risk-map)
  - [🟢 Low Risk (Safe / Predictable)](#-low-risk-safe--predictable)
  - [🟡 Medium Risk (Manageable with Planning)](#-medium-risk-manageable-with-planning)
  - [🔴 High Risk (Heavy / Time-Consuming)](#-high-risk-heavy--time-consuming)

# Roles


- Camille - Game
- Yulia - Backend
- Juan - Frontend
- Tina - Infrastructure/DevOps

# Development Roadmap

| #  | Workstream                                       | Must come after | Can run in parallel with | Type / Priority  | Status / Notes                                                                 |
| -- | ------------------------------------------------ | --------------- | ------------------------ | ---------------- | ------------------------------------------------------------------------------ |
| 0  | **Project Foundations** (Tournament system)      | —               | —                        | —                | ✅ Completed                                                                   |
| 1  | **Backend framework (Node.js + Fastify)**        | 0               | 3                        | MAJOR            | ✅ DONE                                                                        |
| 2  | **Database (SQLight + Prisma)**                  | 0               | —                        | Minor            | ✅ DONE                                                                        |
| 3  | **Frontend framework (TS + Tailwind/R)**         | 0               | 1                        | Minor            | ✅ DONE                                                                        |
| 4  | **Microservices architecture**                   | —               | 2                        | MAJOR            | ✅ DONE                                                                        |
| 5  | **DevOps: log management**                       | 1               | 8, 10                    | MAJOR            | ⏳ Not started                                                                 |
| 6  | **Standard User Management**                     | 1, 2            | 4, 7, 3                  | MAJOR            | 🔧 In progress — Friend button, online status, input validation, match history |
| 7  | **WAF + Vault (secrets mgmt)**                   | 5               | 8, 9, 10                 | MAJOR            | 🔧 In progress — Camill                                                        |
| 8  | **Auth: JWT + 2FA**                              | 2               | 5, 10                    | MAJOR            | 🧍 Assigned: Camille — Not started                                             |
| 9  | **Multiple languages (i18n)**                    | 3               | 6, 7, 8, 9               | Minor            | ✅ DONE                                                                        |
| 10 | **Accessibility features**                       | 3               | 6, 7, 8, 9, 10           | Minor            | 🧍 Assigned: Tina - Not started                                                |
| 11 | **AI opponent**                                  | 1, 2, 8         | 13                       | MAJOR            | ✅ DONE                                                                        |
| 12 | **User & game stats dashboards**                 | 2, 5, 8, 9      | 12                       | Minor            | 🧍 Assigned: Yulia(?) — In progress                                            |
| 13 | **Expanded browser compatibility**               | 3, 12, 13       | —                        | Minor            | 🧪 Testing close to evaluation                                                 |
| 14 | **Remote players** *(Test: network reliability)* | —               | —                        | MAJOR            | ✅ DONE                                       |


| #  | Workstream                         | Must come after | Can run in parallel with |
|----|------------------------------------|-----------------|--------------------------|
| 0  | Project Foundations                | —               | —                        |
| 1  | Backend framework (Node.js+Fastify)| 0               | 3                        | - Major
| 2  | Database (SQLight + Prisma)        | 0               | —                        | - Minor
| 3  | Frontend framework (TS+Tailwind/R) | 0               | 1                        | - Minor
| 4  | Microservices architecture         | -               | 2                        | - Major
| 5  | DevOps: log management             | 1               | 8, 10                    | - (Major) - internal with backend/frontend
| 6  | Standard User Management           | 1, 2            | 4, 7, 3                  | - Major
| 7  | WAF + Vault (secrets mgmt)         | 5               | 8, 9, 10                 | - Major
| 8  | Auth: JWT + 2FA                    | 2               | 5, 10                    | - Major
| 9  | SSR integration patterns (confirm) | 1,3             | 5, 10                    | - Minor, if it's built-in in the frontend framework (we can use React)
| 10 | Responsive (all devices)           | 3               | 6, 7, 8, 9               | - Minor
| 11 | Accessibility features             | 3               | 6, 7, 8, 9, 10           | - Minor
| 12 | AI opponent                        | 1,2,8           | 13                       | - Major
| 13 | User & game stats dashboards       | 2,5,8,9         | 12                       | - Minor
| 14 | Expanded browser compatibility     | 3,12,13         | —                        | - Minor

0. Project Foundations - Tournament system
1. Backend framework (Node.js+Fastify) - DONE
2. Database (SQLight + Prisma) - DONE
3. Frontend framework (TS+Tailwind/R) - Framework applied to all colors, better structured output.css
4. Microservices architecture - DONE
5. DevOps: log management - not started 
6. Standard User Management - friend button, online status of friends, add validation for empty input and others in profile edit, match history
7. WAF + Vault (secrets mgmt) - not started, Camille
8. Auth: JWT + 2FA - not started, Camille
9. SSR integration patterns (confirm) - not started, Tina
10. Responsive (all devices) - not started, Tina
11. Accessibility features - not started
12. AI opponent - Yulia need to make it more complex
13. User & game stats dashboards - in progress by Tina
14. Expanded browser compatibility - test close to evaluation
15. Remote players - TEST: Consider network issues, such as unexpected disconnections or lag

# Supplementary Roadmap

| #O | Workstream                              | Must come after | Can run in parallel with |
|----|-----------------------------------------|-----------------|--------------------------|
| O1 | Game customization options              | 3,7             | 8,11                     | - Minor
| O2 | Remote authentication (IdP/OAuth/SAML)  | 5               | 6,8                      | - Major, if we have time after 2FA
| O3 | GDPR toolkit (anonymize/local/delete)   | 2,5             | 11                       | - Minor
| O4 | Device compatibilita                    | 3               | 8,9                      | - Minor
| O5 | Store tournament scores on Blockchain   | 12              | -                        | - Major
| O6 |SSR integration patterns                 |                 | -                        | - Major

# My Recommended Modules
(I explain my opinion at the end of every line)
🫶
### Web
  - Major module: Use a framework to build the backend - ADDED
  - Minor module: Use a framework or a toolkit to build the frontend - RESEARCH, must write TypeScript, so we can use React → Next.js - built on top of React (SSR/SSG, routing, data fetching, auth-friendly)
  - Minor module: Use a database for the backend -  YULIA: 10, JUAN:8, kinda mandatory

### Gameplay and user experience
  - Major module: Live chat - ADDED

### AI-Algo
  - Major module: Introduce an AI opponent - CAMILLE: 10, TINA, really good to show a demo
  - Minor module: User and game stats dashboards - CAMILLE : 7, TINA: 9, YULIA, easy, traditional feature

### Cybersecurity
  - Major module: Implement Two-Factor Authentication (2FA) and JWT - ADDED

### Devops
  - Major module: Infrastructure setup for log management. - YULIA, CAMILLE, it would help debugging for all of us

### Accessibility
  - Minor module: Support on all devices. - TINA: 10, quick and small responsive design changes
  - Minor module: Expanding browser compatibility. - BONUS, probably nothing to do
  - Minor module: Add accessibility features for visually impaired users. - RESEARCH JUAN, TINA, almost nothing to do, easy to implement in the workflow
  - Minor module: Server-Side Rendering (SSR) integration. - RESEARCH CAMILLE, TINA, YULIA, it is a built-in in the framework as I mentioned beyond *"React → Next.js - built on top of React (SSR/SSG, routing, data fetching, auth-friendly)"*

# Only If Modules
🤔
### Web
  - Major module: Store the score of a tournament in the Blockchain - CAMILLE: 9, JUAN: 8, really complex, but it wouldn't influence the workflow, probably just could be implemented close to the end of the project and then you can count with the time

### Gameplay and user experience
  - Major module: Multiplayer (more than 2 players in the same game) - JUAN: 9, I don't recommend, it would require a more complex game logic and a lot additional at the end, but maybe if we set up a good plan how to execute
  - Minor module: Game customization options - JUAN: 8, good and simple extra if we are good in time close to the end

### User Management
  - Major module: Implementing a remote authentication - TINA: 9, CAMILLE, popular feature nowadays, can be really hard to implement, we could try to do when we do the other authentication

### Cybersecurity
  - Major module: Implement WAF/ModSecurity with a hardened configuration and HashiCorp Vault for secrets management - RESEARCH (CAMILLE AND JUAN), TINA:9, jobmarket, hands-on experience,
complicated
  - Minor module: GDPR compliance options with user anonymization, local data management, and Account Deletion - RESEARCH (CAMILLE AND JUAN), good hands-on experience but require more time

### Devops
  - Major module: Designing the backend as microservices. - REASEARCH, YULIA: 10, I don't recommend, but maybe if we can make a good plan on it and explain how it affects the project what we should take care of it and everybody could follow during the process, I just think it would require a lot of extra care regarding the whole workflow

### Accessibility
  - Minor module: Supports multiple languages. - RESEARCH CAMILLE, not so much extra work, not the most important but a really useful feature for accessibility

# Not Recommended Modules
🙅‍♀️
### Graphics
  - Major module: Use advanced 3D techniques. - RESEARCH (JUAN), not so useful if none of us into graphics and time-consuming

### Gameplay and user experience
  - Major module: Remote players - SKIP
  - Major module: Add another game with user history and matchmaking - SKIP

### Devops
  - Minor module: Monitoring system. - SKIP

### User Management
  - Major module: Standard user management, authentication, users across tournaments - YULIA OPTIONAL, CAMILLE, doesn't teach you too many new things, time-consuming with the edge cases

### Server-Side Pong
  - Major module: Replace basic Pong with server-side Pong and implement an API. - RESEARCH YULIA, CAMILLE, too risky regarding the infrastructure
  - Major module: Enabling Pong gameplay via CLI against web users with API integration. - RESEARCH JUAN, TINA, I don't see it as useful

# Mandatory minimum

A minimum of *7 major* modules is required. Two Minor Modules count as one Major Module.

### Basic Website Setup
  - SPA (single page app) with Typescript frontend (moving around doesn’t reload the whole page, instead, JavaScript updates only the part of the page that changes)
  - Runs in Docker with one command (docker-compose up --build)
  - Works at least in Firefox, no visible errors  

### Pong Game Basics
  - Local Pong (2 players on same keyboard)  
  - Tournament system with aliases + matchmaking (organizes multiple players into a series of matches until a winner is decided, nicknames players type in before the tournament starts, the system automatically decides who plays against who, and in which order)
  - Same paddle speed for everyone  

### Security
  - Passwords hashed (“hashed” means you don’t store the real password in the database, e.g.: password = "hello123" → stored as "5d41402abc4b2a76b9719d911017c592")
  - Protection against SQL injection / XSS (login field: ' OR '1'='1 can trick and log them without password, <script>alert('Hacked!')</script>, webattacks)
  - HTTPS everywhere  
  - Input validation (client/server depending on setup) (user input checks: email, passwrod, alias/nickname, Client-side validation = checked in the browser with JavaScript before sending, Server-side validation = checked again on the backend)
  - Secrets in `.env` (not in git)  

# Module explanation

### Web
- **Major: Backend framework** → Use something like Django, NestJS, or Express instead of plain PHP.  
- **Minor: Frontend framework/toolkit** → Use React, Vue, or Angular to build the interface.  
- **Minor: Database** → Store user info, match history, scores, etc.  
- **Major: Blockchain scores** → Save tournament results on blockchain so they can’t be manipulated.

### User Management
- **Major: Standard user management** → Sign up, log in, password reset, and keep the same user across tournaments.  
- **Major: Remote authentication** → Log in using Google, GitHub, Facebook or another external provider.  

### Gameplay & User Experience
- **Major: Remote players** → Play Pong against someone online, not just on the same keyboard.  
- **Major: Multiplayer (more than 2)** → Support 3+ players in one game.  
- **Major: Add another game** → Add a second game (besides Pong), with history and matchmaking.  
- **Minor: Game customization** → Let players change colors, themes, or game speed.  
- **Major: Live chat** → Players can chat with each other while playing.  

### AI–Algo
- **Major: AI opponent** → Add a computer-controlled player to play against.  
- **Minor: Stats dashboard** → Show charts/tables with wins, losses, rankings, etc.  

### Cybersecurity
- **Major: WAF + Vault** → Web Application Firewall to block attacks, and Vault to securely store secrets (passwords, keys). CI/CD pipeline asks Vault for temporary DB credentials instead of storing passwords in Git. WAF protects the deployed apps that your CI/CD pipeline delivers to production.
- **Minor: GDPR compliance** → Follow privacy laws: anonymize data, let users delete accounts.  
- **Major: 2FA + JWT** → Add Two-Factor Authentication (extra login code) and JWT (JSON Web Token, e.g.:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...) tokens for secure sessions, instead of sending your username/password on every request

### DevOps
- **Major: Log management** → Collect and centralize logs (errors, activity). Good for debugging. 
- **Minor: Monitoring system** → Track server performance, uptime, and alerts.  
- **Major: Microservices backend** → Split the app into small services (auth service, game service, chat service, etc.). Each doing one job, each service runs in its own container (Docker). They talk to each other via APIs (HTTP, WebSockets, etc.). If something crashes probably others can stay alive. 

### Graphics
- **Major: Advanced 3D** → Use 3D graphics (like WebGL or Three.js) to make the game look more advanced.  

### Accessibility
- **Minor: Support on all devices** → Works on desktop, tablet, and mobile.  
- **Minor: Browser compatibility** → Works on Chrome, Firefox, Safari, Edge, etc.  
- **Minor: Multiple languages** → Translate UI into different languages.  
- **Minor: Accessibility features** → Add support for visually/physically impaired players (no mouse usage, screen readers, high contrast).  
- **Minor: Server-Side Rendering (SSR)** → Render pages on the server before sending them, faster load and SEO friendly.

### Server-Side Pong
- **Major: Server-side Pong + API** → Game logic runs on the server, with an API so clients can connect. (Each browser might run the game slightly differently. One player could cheat by changing their browser code
ball.x = myPaddle.x;   // force the ball to always hit my paddle
opponent.score = 0;    // reset opponent score
myScore = 999;         // give myself infinite points. Accepts only player inputs (up/down), never trusts client monitor position. Syncing between two browsers is messy (you need to constantly exchange ball positions, paddle moves, etc.)
- **Major: CLI vs Web gameplay** → Command Line Interface. Allow someone in the command line to play against someone in the web app.

# Risk Map

### 🟢 Low Risk (Safe / Predictable)
- **Backend framework (Major)** → Lets you avoid raw PHP, makes backend cleaner.
- **2FA + JWT** → Security upgrade, relatively standard to implement.  
- **Live chat (Major)** → Straightforward with websockets.  
- **AI opponent (Major)** → Demo-friendly (play vs computer), not too complex if simple AI.  
- **Database (Minor)** → Almost mandatory if you store users/scores.  
- **Game customization (Minor)** → Simple settings (colors, themes).  
- **Stats dashboard (Minor)** → Just display graphs/tables of wins/losses.  
- **Support on all devices** → Responsive design (CSS media queries).  
- **Browser compatibility** → Test across browsers, small tweaks.  
- **Multiple languages** → Add i18n (translation files).  
- **Accessibility features** → High contrast, screen reader support.  
- **SSR integration (Minor)** → Use framework built-ins (e.g., Next.js). (The framework already has that feature included by default.)
- **Frontend framework/toolkit (Minor)** — React/Vue/Angular basics are well documented.

### 🟡 Medium Risk (Manageable with Planning)
- **Standard user management (Major)** → Account lifecycle, resets, edge cases.  
- **Remote authentication (Major)** → Redirects/tokens/config can be really hard.  
- **Monitoring system (Minor)** → Prometheus/Grafana setup, exporters, alerts.
- **GDPR compliance (Minor)** — Add user data rights: **anonymization**, **local data management (view/edit/delete)**, and **account deletion**. Needs clear UX + backend flows; not hard, but requires careful handling and testing.

### 🔴 High Risk (Heavy / Time-Consuming)
- **Blockchain scores** → Complex and heavy for little evaluation gain.
- **Remote players** → Netcode, network latency, reconnection handling: hard to debug.
- **Multiplayer > 2 players** → More complex game logic.
- **Add another game** → Just extra work.
- **WAF + Vault** → Production-level setup, can take a lot of time.
- **Microservices backend** → Good for learning, but adds infrastructure complexity. 
- **Advanced 3D graphics** → Risky if nobody on team knows WebGL/Three.js before. 
- **Server-side Pong + API** → Needs redesign of simple Pong logic.  
- **CLI vs Web Pong** → Extra integration layer: frontend-backend connection.
