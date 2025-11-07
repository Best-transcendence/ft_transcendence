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

.PHONY: help build up down logs clean restart restart-services status rebuild rebuild-frontend rebuild-all clear-cache unseal vault-ready vault-setup

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
	@echo "🔐 Starting Vault first..."
	docker compose up -d vault-service
	@echo "⏳ Waiting for Vault to be ready..."
	@sleep 5
	@echo "🔍 Checking Vault status..."
	@status=$$(docker exec vault_service vault status 2>/dev/null | grep -E "Sealed|Initialized" || echo ""); \
	if [ -z "$$status" ]; then \
		echo "⚠️  Vault is starting up. Please wait a moment and check with 'make vault-ready'"; \
		echo "📝 If this is first time, run 'make vault-setup' to initialize and configure Vault"; \
		echo "📝 If Vault is already set up, run 'make unseal' if it's sealed"; \
		echo ""; \
		echo "🚀 Starting all other services (they may fail if Vault is not ready)..."; \
	elif echo "$$status" | grep -q "Initialized.*false"; then \
		echo "⚠️  Vault is not initialized!"; \
		echo "📝 Run 'make vault-setup' for first-time setup"; \
		echo "📝 Or run 'make vault-init' to initialize, then 'make unseal' to unseal"; \
		echo ""; \
		echo "⚠️  Starting services anyway (they will fail until Vault is initialized)..."; \
	elif echo "$$status" | grep -q "Sealed.*true"; then \
		echo "❌ Vault is sealed!"; \
		echo "📝 You MUST unseal Vault before services can start properly"; \
		echo "📝 Run 'make unseal' to unseal Vault (requires 3 unseal keys)"; \
		echo ""; \
		echo "⚠️  Starting services anyway (they will fail until Vault is unsealed)..."; \
		echo "⚠️  After unsealing, run 'make restart' or 'make up' to restart services"; \
	else \
		echo "✅ Vault is ready!"; \
	fi
	@echo ""
	@echo "🚀 Starting all other services..."
	docker compose up -d
	@echo "✅ All services started!"
	@echo ""
	@echo "📋 Services available at:"
	@echo "  Vault:     http://vault-service:8200"
	@echo "  Frontend:  http://$(LAN_IP):$(FRONTEND_PORT)"
	@echo "  Gateway:   http://$(LAN_IP):$$(grep -E '^GATEWAY_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 3003)"
	@echo "  Auth:      http://$(LAN_IP):$$(grep -E '^AUTH_SERVICE_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 3001)"
	@echo "  User:      http://$(LAN_IP):$$(grep -E '^USER_SERVICE_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 3002)"
	@echo "  WebSocket: ws://$(LAN_IP):$$(grep -E '^WS_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 4000)"
	@echo ""
	@echo "📋 Following logs (Press Ctrl+C to stop following logs, containers keep running)..."
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
	@echo "  make restart         - Restart all services (including Vault - will need to unseal)"
	@echo "  make restart-services - Restart services only (preserves Vault unsealed state)"
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
	@echo "  make up-vault        - Start only vault-service"
	@echo "  make up-user         - Start only user-service"
	@echo "  make up-auth         - Start only auth-service"
	@echo "  make up-gateway      - Start only gateway-service"
	@echo "  make up-ws           - Start only ws-service"
	@echo "  make up-frontend     - Start only frontend"
	@echo "  make up-waf          - Start only waf"
	@echo ""
	@echo "Vault commands:"
	@echo "  make vault-setup     - Complete first-time Vault setup (init + unseal + secrets)"
	@echo "  make unseal          - Unseal Vault (needed after restart - requires 3 unseal keys)"
	@echo "  make vault-ready     - Check if Vault is ready (initialized and unsealed)"
	@echo ""

# Build all images
build:
	@echo "🔨 Building all Docker images..."
	docker compose build

# Start all services
up:
	@echo "🚀 Starting all services..."
	@echo "🔐 Starting Vault first..."
	@docker compose up -d vault-service 2>/dev/null || true
	@sleep 3
	@echo "🔍 Checking Vault status..."
	@status=$$(docker exec vault_service vault status 2>/dev/null | grep -E "Sealed|Initialized" || echo ""); \
	if [ -n "$$status" ]; then \
		if echo "$$status" | grep -q "Initialized.*false"; then \
			echo "⚠️  Vault is not initialized! Run 'make vault-setup' for first-time setup"; \
		elif echo "$$status" | grep -q "Sealed.*true"; then \
			echo "⚠️  Vault is sealed! Run 'make unseal' to unseal it"; \
		else \
			echo "✅ Vault is ready!"; \
		fi; \
	fi
	@echo "🚀 Starting all other services..."
	docker compose up -d
	@echo "✅ All services started!"
	@echo "📋 Services available at:"
	@echo "  Vault:     http://vault-service:8200"
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

# Restart all services (including Vault - Vault will be sealed after restart)
restart: down
	@echo "🚀 Starting all services..."
	@echo "🔐 Starting Vault first..."
	@docker compose up -d vault-service 2>/dev/null || true
	@sleep 5
	@echo "🔍 Checking Vault status..."
	@status=$$(docker exec vault_service vault status 2>/dev/null | grep -E "Sealed|Initialized" || echo ""); \
	if [ -n "$$status" ]; then \
		if echo "$$status" | grep -q "Initialized.*false"; then \
			echo "⚠️  Vault is not initialized! Run 'make vault-setup' for first-time setup"; \
		elif echo "$$status" | grep -q "Sealed.*true"; then \
			echo "⚠️  Vault is sealed (this is normal after restart)!"; \
			echo "📝 Run 'make unseal' to unseal it, then run 'make up' to start services"; \
			echo ""; \
			echo "🚀 Starting services anyway (they will fail until Vault is unsealed)..."; \
		else \
			echo "✅ Vault is ready!"; \
		fi; \
	fi
	@echo "🚀 Starting all other services..."
	@docker compose up -d
	@echo "✅ All services started!"
	@echo ""
	@if echo "$$status" | grep -q "Sealed.*true"; then \
		echo "⚠️  IMPORTANT: Vault is sealed. Run 'make unseal' to unseal it."; \
		echo "   After unsealing, services will automatically reconnect."; \
	fi
	@echo "📋 Services available at:"
	@echo "  Vault:     http://vault-service:8200"
	@echo "  Frontend:  http://$(LAN_IP):$(FRONTEND_PORT)"
	@echo "  Gateway:   http://$(LAN_IP):$$(grep -E '^GATEWAY_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 3003)"
	@echo "  Auth:      http://$(LAN_IP):$$(grep -E '^AUTH_SERVICE_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 3001)"
	@echo "  User:      http://$(LAN_IP):$$(grep -E '^USER_SERVICE_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 3002)"
	@echo "  WebSocket: ws://$(LAN_IP):$$(grep -E '^WS_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 4000)"

# Restart services only (preserves Vault unsealed state)
restart-services:
	@echo "🔄 Restarting services (preserving Vault)..."
	@echo "🔐 Vault will remain running and unsealed"
	@docker compose restart user-service auth-service gateway-service ws-service frontend waf 2>/dev/null || \
		(docker compose up -d user-service auth-service gateway-service ws-service frontend waf)
	@echo "✅ Services restarted!"
	@echo "📋 Services available at:"
	@echo "  Vault:     http://vault-service:8200"
	@echo "  Frontend:  http://$(LAN_IP):$(FRONTEND_PORT)"
	@echo "  Gateway:   http://$(LAN_IP):$$(grep -E '^GATEWAY_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 3003)"
	@echo "  Auth:      http://$(LAN_IP):$$(grep -E '^AUTH_SERVICE_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 3001)"
	@echo "  User:      http://$(LAN_IP):$$(grep -E '^USER_SERVICE_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 3002)"
	@echo "  WebSocket: ws://$(LAN_IP):$$(grep -E '^WS_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo 4000)"

# Clean up everything
clean:
	@echo "🧹 Cleaning up ALL Docker resources and databases..."
	@echo "⚠️  This will remove containers, images, volumes, networks, build cache, and local databases!"
	@echo "🔐 NOTE: Vault data in ./vault/data is preserved (bind mount, not a volume)"
	@echo ""
	docker compose down -v --rmi all 2>/dev/null || true
	@echo "🧹 Pruning Docker system (excluding Vault data)..."
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
	@echo "🔐 Vault data preserved in ./vault/data - you won't need to reinitialize!"

# Show status
status:
	@echo "📊 Service Status:"
	@docker compose ps

# Unseal Vault
unseal: up-vault
	@echo "🔐 Unsealing Vault..."
	@echo "⏳ Waiting for Vault to be ready..."
	@sleep 3
	@if ! docker ps | grep -q vault_service; then \
		echo "❌ Vault container is not running. Starting it now..."; \
		docker compose up -d vault-service; \
		sleep 5; \
	fi
	@read -s -p "Enter Unseal Key 1: " key1; echo; \
	docker exec -it vault_service vault operator unseal $$key1; \
	read -s -p "Enter Unseal Key 2: " key2; echo; \
	docker exec -it vault_service vault operator unseal $$key2; \
	read -s -p "Enter Unseal Key 3: " key3; echo; \
	docker exec -it vault_service vault operator unseal $$key3
	@echo "✅ Vault should be unlocked"

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

up-waf:
	@echo "🚀 Starting waf..."
	docker compose up -d waf

up-vault:
	@echo "🚀 Starting vault-service..."
	docker compose up -d vault-service

# Setup Vault secrets (enable KV engine and load secrets)
vault-setup-secrets:
	@echo "🔐 Setting up Vault secrets..."
	@if [ -z "$$VAULT_TOKEN" ]; then \
		if [ -f .env ]; then \
			VAULT_TOKEN=$$(grep -E '^VAULT_TOKEN=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo ""); \
			if [ -z "$$VAULT_TOKEN" ]; then \
				echo "❌ VAULT_TOKEN not found in environment or .env file"; \
				echo "   Export it: export VAULT_TOKEN='your_initial_root_token'"; \
				echo "   Or add to .env: VAULT_TOKEN='your_initial_root_token'"; \
				exit 1; \
			fi; \
		else \
			echo "❌ VAULT_TOKEN not set. Export it or add to .env file"; \
			echo "   export VAULT_TOKEN='your_initial_root_token'"; \
			exit 1; \
		fi; \
	fi
	@if [ -z "$$VAULT_TOKEN" ]; then \
		if [ -f .env ]; then \
			VAULT_TOKEN=$$(grep -E '^VAULT_TOKEN=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' '); \
		fi; \
	fi
	@echo "📦 Enabling KV v2 secrets engine..."; \
	docker exec -e VAULT_TOKEN="$$VAULT_TOKEN" -i vault_service vault secrets enable -path=secret kv-v2 2>/dev/null || \
		echo "⚠️  KV engine already enabled (this is OK)"; \
	echo "🔑 Adding JWT secret..."; \
	docker exec -e VAULT_TOKEN="$$VAULT_TOKEN" -i vault_service vault kv put secret/jwt JWT_SECRET='secretjwt' || \
		(echo "❌ Failed to add JWT secret. Ensure Vault is unsealed and logged in." && exit 1); \
	echo "🔒 Creating SSL certificates..."; \
	mkdir -p certs; \
	openssl req -x509 -nodes -days 365 \
		-newkey rsa:2048 \
		-keyout certs/server.key \
		-out certs/server.crt \
		-subj "/CN=localhost" 2>/dev/null || \
		echo "⚠️  SSL certs may already exist (this is OK)"; \
	echo "🔒 Adding SSL certificates to Vault..."; \
	docker exec -e VAULT_TOKEN="$$VAULT_TOKEN" -i vault_service vault kv put secret/ssl \
		CRT="$$(cat certs/server.crt)" KEY="$$(cat certs/server.key)" && \
		rm -rf certs || \
		(echo "❌ Failed to add SSL secrets. Ensure Vault is unsealed and logged in." && exit 1)
	@echo "✅ Vault secrets configured!"

# Ensure Vault is ready (check status)
vault-ready:
	@echo "🔍 Checking Vault status..."
	@status=$$(docker exec vault_service vault status 2>/dev/null | grep -E "Sealed|Initialized" || echo ""); \
	if [ -z "$$status" ]; then \
		echo "❌ Vault container not running. Run 'make up-vault' first."; \
		exit 1; \
	fi; \
	if echo "$$status" | grep -q "Sealed.*true"; then \
		echo "🔐 Vault is sealed. Run 'make unseal' to unseal it."; \
		exit 1; \
	fi; \
	if echo "$$status" | grep -q "Initialized.*false"; then \
		echo "🔐 Vault is not initialized. Run 'make vault-setup' first."; \
		exit 1; \
	fi; \
	echo "✅ Vault is ready (initialized and unsealed)!"

# Complete Vault first-time setup workflow
vault-setup: up-vault
	@echo "🔐 Complete Vault first-time setup..."
	@echo ""
	@echo "Step 1: Initializing Vault..."
	@echo "⚠️  This will generate Initial Root Token and 5 Unseal Keys"
	@echo "⚠️  SAVE THESE SECURELY - they are unique to this machine!"
	@echo ""
	@docker exec -it vault_service vault operator init || \
		(echo "❌ Vault container not running. Run 'make up-vault' first." && exit 1)
	@echo ""
	@echo "✅ Vault initialized!"
	@echo "📝 IMPORTANT: Save the Initial Root Token and 5 Unseal Keys securely"
	@echo ""
	@echo "Step 2: Please unseal Vault..."
	@echo "⚠️  You will need 3 of the 5 Unseal Keys from the initialization step"
	@$(MAKE) unseal || exit 1
	@echo ""
	@echo "Step 3: Setting up secrets..."
	@echo "⚠️  You need to export VAULT_TOKEN first: export VAULT_TOKEN='your_initial_root_token'"
	@if [ -z "$$VAULT_TOKEN" ]; then \
		echo "❌ VAULT_TOKEN not set. Export it first: export VAULT_TOKEN='your_token'"; \
		exit 1; \
	fi
	@$(MAKE) vault-setup-secrets || exit 1
	@echo ""
	@echo "✅ Vault setup complete!"
	@echo "📝 Remember to export VAULT_TOKEN in your shell: export VAULT_TOKEN='your_token'"
	@echo "📝 You can now run 'make up' to start all services"

# Clear frontend build cache
clear-cache:
	@echo "🧹 Clearing frontend build cache..."
	@rm -rf frontend/dist frontend/node_modules/.vite
	@echo "✅ Cache cleared!"

# Force rebuild frontend without cache
rebuild-frontend: clear-cache
	@echo "🔨 Force rebuilding frontend (no cache)..."
	@echo "🛑 Stopping services (preserving Vault)..."
	@docker compose stop frontend user-service auth-service gateway-service ws-service waf 2>/dev/null || true
	@docker compose rm -f frontend user-service auth-service gateway-service ws-service waf 2>/dev/null || true
	@echo "🔨 Building frontend with updated environment variables..."
	@if [ -f .env ]; then \
		set -a; \
		. .env; \
		set +a; \
		docker compose build --no-cache frontend; \
	else \
		docker compose build --no-cache frontend; \
	fi
	@echo "🔐 Ensuring Vault is running..."
	@docker compose up -d vault-service 2>/dev/null || true
	@sleep 3
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
rebuild-all: clear-cache
	@echo "🔨 Force rebuilding ALL services (no cache)..."
	@echo "⚠️  This may take several minutes..."
	@echo "🛑 Stopping services (preserving Vault)..."
	@docker compose stop frontend user-service auth-service gateway-service ws-service waf 2>/dev/null || true
	@docker compose rm -f frontend user-service auth-service gateway-service ws-service waf 2>/dev/null || true
	@echo "🔨 Building all services..."
	docker compose build --no-cache
	@echo "🔐 Ensuring Vault is running..."
	@docker compose up -d vault-service 2>/dev/null || true
	@sleep 3
	@echo "🔍 Checking Vault status..."
	@status=$$(docker exec vault_service vault status 2>/dev/null | grep -E "Sealed|Initialized" || echo ""); \
	if [ -n "$$status" ]; then \
		if echo "$$status" | grep -q "Initialized.*false"; then \
			echo "⚠️  Vault is not initialized! Run 'make vault-setup' for first-time setup"; \
		elif echo "$$status" | grep -q "Sealed.*true"; then \
			echo "⚠️  Vault is sealed! Run 'make unseal' to unseal it"; \
		else \
			echo "✅ Vault is ready!"; \
		fi; \
	fi
	@echo "🚀 Starting all services..."
	docker compose up -d
	@echo "✅ All services rebuilt and started!"
	@echo "📋 Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)"
