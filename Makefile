# ft_transcendence - Main Makefile
# School 42 project - Docker management

# Load environment variables from .env file
ifeq ($(shell test -f .env && echo true),true)
  LAN_IP := $(shell grep -E '^LAN_IP=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ')
  FRONTEND_PORT := $(shell grep -E '^FRONTEND_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ')
endif

# Set defaults if not found in .env
LAN_IP ?= localhost
FRONTEND_PORT ?= 3000

.PHONY: help build up down logs clean restart status rebuild rebuild-frontend rebuild-all clear-cache

# Default target
docker:
	@echo "🐳 Building and starting all services with Docker Compose..."
	@echo "🛑 Stopping existing containers if running..."
	docker compose down 2>/dev/null || true
	@echo "🧹 Cleaning up individual service containers..."
	docker stop user_service auth_service gateway_service ws_service frontend_service 2>/dev/null || true
	docker rm user_service auth_service gateway_service ws_service frontend_service 2>/dev/null || true
	@echo "🧹 Cleaning up existing network..."
	docker network rm ft_transcendence_network 2>/dev/null || true
	@echo "🔨 Building images if needed..."
	docker compose build
	@echo "🚀 Starting all services..."
	docker compose up -d
	@echo "✅ All services started! Following logs..."
	@echo "📋 Press Ctrl+C to stop following logs (containers keep running)"
	docker compose logs -f

help:
	@echo "🚀 ft_transcendence - Docker Management"
	@echo ""
	@echo "Available commands:"
	@echo "  make docker          - Stop, build, start all services and follow logs (DEFAULT)"
	@echo "  make build           - Build all Docker images"
	@echo "  make up              - Start all services"
	@echo "  make down            - Stop all services"
	@echo "  make logs            - Follow logs from all services"
	@echo "  make restart         - Restart all services"
	@echo "  make clean           - Clean up all Docker resources"
	@echo "  make status          - Show status of all services"
	@echo ""
	@echo "Rebuild commands (force cache clear):"
	@echo "  make rebuild-frontend - Force rebuild frontend without cache"
	@echo "  make rebuild-all      - Force rebuild ALL services without cache"
	@echo "  make clear-cache      - Clear frontend build cache (dist, .vite)"
	@echo "  make rebuild          - Alias for rebuild-frontend (common use case)"
	@echo ""
	@echo "Individual service commands:"
	@echo "  make up-user         - Start only user-service"
	@echo "  make up-auth         - Start only auth-service"
	@echo "  make up-gateway      - Start only gateway-service"
	@echo "  make up-ws           - Start only ws-service"
	@echo "  make up-frontend     - Start only frontend"
	@echo ""

# Build all images
build:
	@echo "🔨 Building all Docker images..."
	docker compose build

# Start all services
up:
	@echo "🚀 Starting all services..."
	docker compose up -d
	@echo "✅ All services started!"
	@echo "📋 Services available at:"
	@echo "  Frontend:  http://$(LAN_IP):$(FRONTEND_PORT)"
	@echo "  Gateway:   http://$(LAN_IP):$$(grep -E '^GATEWAY_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 3003)"
	@echo "  Auth:      http://$(LAN_IP):$$(grep -E '^AUTH_SERVICE_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 3001)"
	@echo "  User:      http://$(LAN_IP):$$(grep -E '^USER_SERVICE_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 3002)"
	@echo "  WebSocket: ws://$(LAN_IP):$$(grep -E '^WS_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 4000)"

# Stop all services
down:
	@echo "🛑 Stopping all services..."
	docker compose down

# Follow logs
logs:
	@echo "📋 Following logs from all services (Ctrl+C to stop)..."
	docker compose logs -f

# Restart all services
restart: down up

# Clean up everything
clean:
	@echo "🧹 Cleaning up ALL Docker resources and databases..."
	@echo "⚠️  This will remove containers, images, volumes, networks, build cache, and local databases!"
	docker compose down -v --rmi all 2>/dev/null || true
	docker system prune -a -f --volumes
	docker builder prune -a -f
	@echo "🗑️  Removing local database files..."
	@rm -f user.db
	@rm -f backend/auth-service/prisma/auth.db
	@rm -f backend/user-service/prisma/prisma/user.db
	@echo "🧹 Removing frontend build artifacts..."
	@rm -rf frontend/dist
	@rm -rf frontend/node_modules/.vite
	@echo "✅ Full cleanup complete! Everything is reset."

# Show status
status:
	@echo "📊 Service Status:"
	@docker compose ps

# Individual service commands
up-user:
	@echo "🚀 Starting user-service..."
	docker compose up -d user-service

up-auth:
	@echo "🚀 Starting auth-service..."
	docker compose up -d auth-service

up-gateway:
	@echo "🚀 Starting gateway-service..."
	docker compose up -d gateway-service

up-ws:
	@echo "🚀 Starting ws-service..."
	docker compose up -d ws-service

up-frontend:
	@echo "🚀 Starting frontend..."
	docker compose up -d frontend

# Clear frontend build cache
clear-cache:
	@echo "🧹 Clearing frontend build cache..."
	@rm -rf frontend/dist frontend/node_modules/.vite
	@echo "✅ Cache cleared!"

# Force rebuild frontend without cache
rebuild-frontend: down clear-cache
	@echo "🔨 Force rebuilding frontend (no cache)..."
	docker compose build --no-cache frontend
	@echo "🚀 Starting all services..."
	docker compose up -d
	@echo "✅ Frontend rebuilt and all services started!"
	@echo ""
	@echo "⚠️  BROWSER CACHE ISSUE - You MUST clear your browser cache!"
	@echo ""
	@echo "Choose ONE method:"
	@echo "  1. Hard Refresh:     Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows/Linux)"
	@echo "  2. DevTools:         Right-click refresh → 'Empty Cache and Hard Reload'"
	@echo "  3. Incognito Mode:   Open http://$(LAN_IP):$(FRONTEND_PORT) in incognito/private window"
	@echo "  4. Disable Cache:    F12 → Network tab → Check 'Disable cache' → Refresh"
	@echo ""

# Alias for rebuild-frontend (most common use case)
rebuild: rebuild-frontend

# Force rebuild ALL services without cache
rebuild-all: down
	@echo "🧹 Clearing frontend build cache..."
	@rm -rf frontend/dist frontend/node_modules/.vite
	@echo "🔨 Force rebuilding ALL services (no cache)..."
	@echo "⚠️  This may take several minutes..."
	docker compose build --no-cache
	@echo "🚀 Starting all services..."
	docker compose up -d
	@echo "✅ All services rebuilt and started!"
	@echo "📋 Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)"
