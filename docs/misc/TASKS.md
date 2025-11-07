# 🚀 ft_transcendence - Team Task Management

> **Current Phase**: Week 0 - Foundations  
> **Last Updated**: $(date +'%Y-%m-%d')  
> **Team**: Tina, Camille, Juan, Yulia  

## 📋 Quick Status Dashboard

| Area | Owner | Status | Priority |
|------|--------|---------|----------|
| Infrastructure | - | 🔴 Not Started | HIGH |
| Backend Setup | - | 🔴 Not Started | HIGH |
| Frontend Setup | - | 🔴 Not Started | HIGH |
| Game Engine | - | 🔴 Not Started | MEDIUM |
| Documentation | Tina | 🟡 In Progress | MEDIUM |

---

## 🎯 IMMEDIATE ACTIONS (Week 0 - Foundations)

### 🚧 Critical Foundation Tasks
*These MUST be completed before any development begins*

#### Repository & Git Setup
- [ ] **[URGENT]** Assign task owners for each major area
  - [ ] Frontend Lead: `[Juan]`
  - [ ] Backend Lead: `[Yulia]`  
  - [ ] Game Engine Lead: `[Camille]`
  - [ ] Infrastructure Lead: `[Tina]`
- [ ] Create `develop` branch from main
- [ ] Set up branch protection rules (require PR reviews)
- [ ] Create basic folder structure:
  ```
  /frontend/          # Next.js + TypeScript
  /backend/           # Fastify + SQLite
  /game/             # Pong game logic
  /docker/           # Container configurations
  ```

#### Environment & Security Setup  
- [ ] **[CRITICAL]** Populate `.gitignore` with essential entries
  - [ ] Add `.env`, `node_modules/`, `dist/`, `build/`
  - [ ] Add database files, IDE configs, OS files
- [ ] Create `.env.example` template
- [ ] Verify `.env` is properly gitignored (evaluation requirement)
- [ ] Set up development secrets structure

#### Docker Infrastructure
- [ ] Complete `docker-compose.yml` configuration
  - [ ] Database service (PostgreSQL)
  - [ ] Backend service (NestJS)
  - [ ] Frontend service (Next.js)
  - [ ] Proxy service (Nginx)
- [ ] Test `docker-compose up --build` command works
- [ ] Configure service networking and dependencies

---

## 📅 DEVELOPMENT ROADMAP

### Week 1: Base Infrastructure & Scaffolds

#### Infrastructure Tasks
- [ ] **Complete Docker setup** with all services running
- [ ] **Configure TLS termination** with self-signed certificates  
- [ ] **Set up proxy configuration** in `/proxy/nginx.conf`
- [ ] **Verify cross-service communication** works

#### Backend Tasks (Fastify + SQLite)
- [ ] **Initialize Fastify project** in `/backend/`
- [ ] **Set up SQLite database** with better-sqlite3
- [ ] **Create health check endpoint** (`/api/health`)
- [ ] **Configure basic CORS** and security middleware
- [ ] **Set up development database** schema

#### Frontend Tasks (Next.js + TypeScript)  
- [ ] **Initialize Next.js project** with TypeScript in `/frontend/`
- [ ] **Set up basic routing** structure:
  - [ ] `/` - Home/landing page
  - [ ] `/login` - Authentication
  - [ ] `/register` - User registration  
  - [ ] `/dashboard` - User dashboard
  - [ ] `/play` - Game interface
  - [ ] `/tournament` - Tournament system
- [ ] **Configure TypeScript** with strict mode
- [ ] **Set up basic UI framework** (choose: Tailwind CSS, Material-UI, or styled-components)

#### Game Engine Tasks
- [ ] **Create game engine structure** in `/game/`
- [ ] **Implement basic Pong mechanics**:
  - [ ] Ball physics and movement
  - [ ] Paddle controls (keyboard input)
  - [ ] Collision detection
  - [ ] Score tracking
- [ ] **Create HTML5 Canvas integration** placeholder

### Week 2: Authentication & Local Pong

#### Backend Authentication
- [ ] **User model and registration API**
  - [ ] Secure password hashing (bcrypt)
  - [ ] Input validation and sanitization
  - [ ] Error handling
- [ ] **JWT authentication system**
  - [ ] Login endpoint with JWT generation
  - [ ] Protected route middleware
  - [ ] Session management
- [ ] **2FA implementation**
  - [ ] TOTP setup (using authenticator apps)
  - [ ] Backup codes generation
  - [ ] 2FA verification endpoints

#### Frontend Authentication
- [ ] **Login page** with form validation
- [ ] **Registration page** with password requirements
- [ ] **Authentication state management** (Context API or Redux)
- [ ] **Protected route wrapper** component
- [ ] **Error handling and user feedback**

#### Game Implementation  
- [ ] **Complete local Pong game**
  - [ ] Two-player keyboard controls
  - [ ] Win condition logic  
  - [ ] Score display
  - [ ] Game reset functionality
- [ ] **Game rules and manual** page
- [ ] **End-game screen** with results

### Week 3: Tournament & WebSockets

#### Backend Features
- [ ] **Tournament system APIs**
  - [ ] Create tournament endpoint
  - [ ] Join tournament logic  
  - [ ] Match scheduling algorithm
  - [ ] Tournament bracket generation
- [ ] **WebSocket gateway setup**
  - [ ] Real-time chat system
  - [ ] Game state synchronization  
  - [ ] Live tournament updates
- [ ] **Match history storage** in PostgreSQL

#### Frontend Tournament System
- [ ] **Tournament creation UI**
- [ ] **Tournament browser and join interface**
- [ ] **Live tournament bracket display**
- [ ] **Real-time chat component**
- [ ] **Tournament history and statistics**

#### Game Integration
- [ ] **Tournament-Pong integration**
- [ ] **WebSocket game synchronization**
- [ ] **Spectator mode** for ongoing matches

### Week 4: Stability & Evaluation Readiness

#### Final Integration & Testing
- [ ] **End-to-end HTTPS/WSS verification**
- [ ] **Cross-browser compatibility testing**
- [ ] **Responsive design validation** (mobile, tablet, desktop)
- [ ] **Database migration verification**
- [ ] **Performance optimization**

#### Evaluation Preparation  
- [ ] **Complete evaluation checklist** review
- [ ] **Documentation updates** (README, API docs)
- [ ] **Demo preparation** and testing
- [ ] **Security audit** (environment variables, input validation)

---

## 🎖️ BONUS MODULES (Weeks 5-8)

### High-Priority Modules (Choose 2-3)
- [ ] **AI Opponent** (Major) - *Camille lead*
- [ ] **User Stats Dashboard** (Minor) - *Camille, Tina, Yulia*  
- [ ] **Live Chat** (Major) - *Already planned for Week 3*
- [ ] **2FA + JWT** (Major) - *Already planned for Week 2*

### Medium-Priority Modules (If time allows)
- [ ] **Responsive Design** (Minor) - *Tina lead*
- [ ] **Advanced Authentication** (OAuth/SAML) (Major)
- [ ] **Infrastructure Logging** (Major) - *Yulia, Camille*
- [ ] **Game Customization** (Minor) - *Juan*

### Research/Optional Modules
- [ ] **Blockchain Tournament Scores** (Major) - *Research: Camille, Juan*
- [ ] **Multiplayer >2 players** (Major) - *Research: Juan* 
- [ ] **3D Graphics** (Major) - *Research: Juan*
- [ ] **Microservices Architecture** (Major) - *Research: Yulia*

---

## 🤝 TEAM COORDINATION

### Daily Standup Format
**What did you complete yesterday?**
- [ ] List completed tasks with checkboxes

**What are you working on today?**  
- [ ] Current task with expected completion time

**Any blockers or help needed?**
- [ ] Dependencies on other team members
- [ ] Technical challenges or questions

### Weekly Review Template
**Week X Goals:**
- [ ] Goal 1
- [ ] Goal 2  
- [ ] Goal 3

**Completed:**
- [x] Completed item 1
- [x] Completed item 2

**In Progress:**
- [ ] Current work item 1
- [ ] Current work item 2

**Blocked/Issues:**
- Issues encountered and solutions

**Next Week Focus:**
- Priority tasks for upcoming week

---

## 🆘 QUICK REFERENCE

### Getting Started Commands
```bash
# Start development environment
docker-compose up --build

# Run in detached mode  
docker-compose up -d --build

# View logs
docker-compose logs -f [service_name]

# Stop all services
docker-compose down
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: description of changes"

# Push and create PR
git push origin feature/your-feature-name
```

### Task Status Icons
- 🔴 **Not Started** - Task not begun
- 🟡 **In Progress** - Currently being worked on  
- 🟢 **Completed** - Task finished and verified
- ⏸️ **Blocked** - Waiting on dependencies
- ❌ **Cancelled** - Task no longer needed

---

## 📝 NOTES

### Important Evaluation Requirements
- ✅ Must run with single `docker-compose up --build` command
- ✅ Environment variables must be in `.env` file (gitignored)  
- ✅ Must work in Firefox without visible errors
- ✅ Must be a Single Page Application (SPA) with TypeScript
- ✅ Must include local 2-player Pong with tournament system

### Risk Management
- 🔴 **High Risk**: Complex integrations, security features, new technologies
- 🟡 **Medium Risk**: Well-documented features with some complexity  
- 🟢 **Low Risk**: Standard implementations with existing documentation


---

*Last updated: $(date +'%Y-%m-%d %H:%M:%S')*
