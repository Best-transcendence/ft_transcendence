# ft_transcendence - Main Makefile
# School 42 project - Docker management

.PHONY: help build up down logs clean restart status

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
	@echo "  make docker    - Stop, build, start all services and follow logs (DEFAULT)"
	@echo "  make build     - Build all Docker images"
	@echo "  make up        - Start all services"
	@echo "  make down      - Stop all services"
	@echo "  make logs      - Follow logs from all services"
	@echo "  make restart   - Restart all services"
	@echo "  make clean     - Clean up all Docker resources"
	@echo "  make status    - Show status of all services"
	@echo ""
	@echo "Individual service commands:"
	@echo "  make up-user   - Start only user-service"
	@echo "  make up-auth   - Start only auth-service"
	@echo "  make up-gateway- Start only gateway-service"
	@echo "  make up-ws     - Start only ws-service"
	@echo "  make up-frontend- Start only frontend"
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
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Gateway:   http://localhost:3003"
	@echo "  Auth:      http://localhost:3001"
	@echo "  User:      http://localhost:3002"
	@echo "  WebSocket: ws://localhost:4000"

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
	@echo "🧹 Cleaning up all Docker resources..."
	docker compose down -v --rmi all
	docker system prune -f
	@echo "✅ Cleanup complete!"

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
