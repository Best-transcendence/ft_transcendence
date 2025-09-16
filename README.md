# 🏓 ft_transcendence - Real-time Pong Tournament Platform

A modern, full-stack web application implementing the classic Pong game with tournaments, real-time multiplayer, and advanced features built with Next.js, NestJS, and WebSocket technology.

## 🚀 Quick Start

```bash
# Clone and setup the development environment
git clone <repository-url>
cd ft_transcendence

# Environment is already configured in .env
# (Edit .env if you need custom ports)

# Start with Docker
docker-compose up --build
```

Visit `https://localhost` to access the application.

## 📋 Task Management

### For Daily Development
- **Primary task tracking**: See [TASKS.md](TASKS.md) for current sprint and task assignments
- **Task templates**: Use templates in [docs/task-templates.md](docs/task-templates.md) for consistent task creation
- **Progress tracking**: Update task checkboxes and status as you work

### Quick Task Status Update
```bash
# Edit the main task file
vim TASKS.md

# Update your tasks and commit
git add TASKS.md
git commit -m "Update task progress - [your initials]"
git push
```

## 📁 Project Structure

```
├── frontend/          # Next.js + TypeScript SPA
├── backend/           # NestJS + Prisma + PostgreSQL  
├── game/              # Pong game engine
├── proxy/             # Nginx reverse proxy + TLS
├── docker-compose.yml # Development environment
├── TASKS.md           # ⭐ Main task tracking file
└── docs/              # Project documentation
    ├── Agenda.md      # Project roadmap and milestones
    ├── task-templates.md  # Task creation templates
    ├── modules.md     # Feature modules and assignments
    └── notes_Tina.md  # Development planning notes
```

## 🎯 Development Workflow

1. **Check TASKS.md** for your current assignments and dependencies
2. **Create feature branch**: `git checkout -b feature/task-name`
3. **Update task status** to 🟡 In Progress 
4. **Develop, test, and document** your changes
5. **Create Pull Request** with task reference
6. **Update task status** to 🟢 Completed after merge

## 🛠️ Technology Stack

- **Frontend**: Next.js 13+ with TypeScript, Server-Side Rendering
- **Backend**: NestJS with JWT authentication and 2FA
- **Database**: PostgreSQL with Prisma ORM  
- **Game Engine**: HTML5 Canvas with WebSocket synchronization
- **DevOps**: Docker, Nginx, HTTPS/WSS
- **Real-time**: WebSocket for chat and live game updates

## 📖 Documentation

- [TASKS.md](TASKS.md) - Current sprint tasks and team assignments
- [docs/Agenda.md](docs/Agenda.md) - Project roadmap and weekly milestones  
- [docs/task-templates.md](docs/task-templates.md) - Standardized task templates
- [docs/modules.md](docs/modules.md) - Feature modules and complexity assessment
- [docs/evaluation_sheet.html](docs/evaluation_sheet.html) - 42 School evaluation criteria

## 🏆 Core Features

- **Single Page Application** with TypeScript and responsive design
- **Local & Tournament Pong** with matchmaking and brackets  
- **Real-time Chat** during matches via WebSocket
- **JWT Authentication** with Two-Factor Authentication (2FA)
- **User Statistics** and match history dashboard
- **AI Opponent** for single-player practice
- **Cross-browser Compatible** (Firefox, Chrome, Safari)

## 🔒 Security & Compliance

- Environment variables stored in `.env` (gitignored)
- Input validation and XSS protection
- SQL injection prevention via Prisma ORM
- HTTPS/WSS encryption across all services
- 42 School evaluation compliance

---

**Team**: Tina, Camille, Juan, Yulia | **Academic Project**: 42 School ft_transcendence
