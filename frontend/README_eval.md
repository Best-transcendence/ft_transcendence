# Frontend - Evaluation Overview

## Purpose

The frontend is a **Single Page Application (SPA)** built with TypeScript and TailwindCSS, providing the user interface for the ft_transcendence Pong tournament platform.

## Architecture

- **Framework**: Vanilla TypeScript SPA (no framework dependencies)
- **Bundler**: Vite
- **Styling**: TailwindCSS
- **Routing**: Hash-based client-side routing

## Key Components

### Entry Point
- `src/main.ts`: Application bootstrap, router initialization, DOM event listeners

### Routing
- `src/router.ts`: Hash-based routing system, protected page handling, authentication checks

### Pages
- Located in `src/pages/`: Individual page components for different views

### Services
- Located in `src/services/`: API communication, WebSocket connections, authentication

### Components
- Located in `src/components/`: Reusable UI components

## Integration Points

- **Backend API**: Communicates with Gateway Service via HTTP
- **WebSocket Service**: Real-time connections for game updates and user presence
- **Authentication**: JWT token management for protected routes

## Configuration

- Port: Configurable via `FRONTEND_PORT` in root `.env` (default: 3000)
- Backend URL: Configurable via `VITE_BACKEND_URL` environment variable

