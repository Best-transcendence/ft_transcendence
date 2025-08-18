## Mandatory minimum

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

## Modules explanation

## Web
- **Major: Backend framework** → Use something like Django, NestJS, or Express instead of plain PHP.  
- **Minor: Frontend framework/toolkit** → Use React, Vue, or Angular to build the interface.  
- **Minor: Database** → Store user info, match history, scores, etc.  
- **Major: Blockchain scores** → Save tournament results on blockchain so they can’t be tampered with.  

## User Management
- **Major: Standard user management** → Sign up, log in, password reset, and keep the same user across tournaments.  
- **Major: Remote authentication** → Log in using Google, GitHub, or another external provider.  

## Gameplay & User Experience
- **Major: Remote players** → Play Pong against someone online, not just on the same keyboard.  
- **Major: Multiplayer (more than 2)** → Support 3+ players in one game.  
- **Major: Add another game** → Add a second game (besides Pong), with history and matchmaking.  
- **Minor: Game customization** → Let players change colors, themes, or game speed.  
- **Major: Live chat** → Players can chat with each other while playing.  

## AI–Algo
- **Major: AI opponent** → Add a computer-controlled player to play against.  
- **Minor: Stats dashboard** → Show charts/tables with wins, losses, rankings, etc.  

## Cybersecurity
- **Major: WAF + Vault** → Web Application Firewall to block attacks, and Vault to securely store secrets (passwords, keys).  
- **Minor: GDPR compliance** → Follow privacy laws: anonymize data, let users delete accounts.  
- **Major: 2FA + JWT** → Add Two-Factor Authentication (extra login code) and JWT tokens for secure sessions.  

## DevOps
- **Major: Log management** → Collect and centralize logs (errors, activity).  
- **Minor: Monitoring system** → Track server performance, uptime, and alerts.  
- **Major: Microservices backend** → Split the app into small services (auth service, game service, chat service, etc.).  

## Graphics
- **Major: Advanced 3D** → Use 3D graphics (like WebGL or Three.js) to make the game look more advanced.  

## Accessibility
- **Minor: Support on all devices** → Works on desktop, tablet, and mobile.  
- **Minor: Browser compatibility** → Works on Chrome, Firefox, Safari, Edge, etc.  
- **Minor: Multiple languages** → Translate UI into different languages.  
- **Minor: Accessibility features** → Add support for visually impaired players (screen readers, high contrast).  
- **Minor: Server-Side Rendering (SSR)** → Render pages on the server before sending them → faster load and SEO friendly.  

## Server-Side Pong
- **Major: Server-side Pong + API** → Game logic runs on the server, with an API so clients can connect.  
- **Major: CLI vs Web gameplay** → Allow someone in the command line to play against someone in the web app.  
