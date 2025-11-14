# ft_transcendence - Main Makefile
# School 42 project - Docker management
SHELL := /bin/bash

# Load environment variables from .env file
ifeq ($(shell test -f .env && echo true),true)
  LAN_IP := $(shell grep -E '^LAN_IP=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ')
  FRONTEND_PORT := $(shell grep -E '^FRONTEND_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ')
endif

# Set defaults if not found in .env
LAN_IP ?= localhost
FRONTEND_PORT ?= 3000

.PHONY: help build up down logs clean restart restart-services status rebuild rebuild-frontend rebuild-all clear-cache unseal vault-ready vault-setup vault-init-first-time vault-init-existing up-elk up-elasticsearch up-logstash up-kibana up-filebeat save-vault-keys auto-unseal dev start docker-no-logs fix-backend-deps

# Default target
docker:
	@echo "🐳 Building and starting all services with Docker Compose..."
	@echo "🛑 Stopping existing containers if running..."
	docker compose down 2>/dev/null || true
	@echo "🧹 Cleaning up individual service containers..."
	docker stop user_service auth_service gateway_service ws_service frontend_service elasticsearch logstash kibana filebeat kibana_setup 2>/dev/null || true
	docker rm user_service auth_service gateway_service ws_service frontend_service elasticsearch logstash kibana filebeat kibana_setup 2>/dev/null || true
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
	@echo "  Frontend:     https://$(LAN_IP)"
	@echo "  Gateway:      https://$(LAN_IP)/api/"
	@echo "  WebSocket:    wss://$(LAN_IP)/ws/"
	@echo "  Kibana:       https://$(LAN_IP)/kibana/"
	@echo ""
	@echo "📚 API Documentation (Swagger):"
	@echo "  Gateway:      https://$(LAN_IP)/api/docs"
	@echo "  Auth Service: https://$(LAN_IP)/auth-docs/"
	@echo "  User Service: https://$(LAN_IP)/user-docs/"
	@echo "  WS Service:   https://$(LAN_IP)/ws-docs/"
	@echo ""
	@echo "🔍 Logging & Monitoring:"
	@echo "  Elasticsearch: https://$(LAN_IP)/elasticsearch/"
	@echo "  Kibana:        https://$(LAN_IP)/kibana/"
	@echo ""
	@echo "🔧 Internal Services:"
	@echo "  Vault:        http://vault-service:8200"
	@echo ""
	@echo "📋 Following logs (Press Ctrl+C to stop following logs, containers keep running)..."
	docker compose logs -f

help:
	@echo "🚀 ft_transcendence - Docker Management"
	@echo ""
	@echo "🎯 Quick Start (Recommended):"
	@echo "  make dev             - Complete automated workflow (clean → docker → auto-unseal)"
	@echo "  make start           - Quick start without cleaning (docker → auto-unseal)"
	@echo "  make save-vault-keys - Save Vault keys for automation (one-time setup)"
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
	@echo "  make fix-backend-deps - Fix backend ESLint dependency issues"
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
	@echo "ELK Stack commands:"
	@echo "  make up-elk          - Start entire ELK stack (recommended)"
	@echo "  make up-elasticsearch - Start only elasticsearch"
	@echo "  make up-logstash     - Start only logstash"
	@echo "  make up-kibana       - Start only kibana"
	@echo "  make up-filebeat     - Start only filebeat"
	@echo ""
	@echo "Vault commands:"
	@echo "  make vault-setup          - Complete first-time Vault setup (init + unseal + secrets)"
	@echo "  make vault-init-first-time - Automated first-time Vault setup (all steps from README)"
	@echo "  make vault-init-existing  - Automated Vault setup for already configured machines"
	@echo "  make unseal               - Unseal Vault manually (requires 3 unseal keys)"
	@echo "  make auto-unseal          - Unseal Vault automatically (uses saved keys)"
	@echo "  make vault-ready          - Check if Vault is ready (initialized and unsealed)"
	@echo ""

# ============================================================================
# 🎯 AUTOMATED WORKFLOW TARGETS
# ============================================================================

# Save Vault keys for automated workflow (one-time setup)
save-vault-keys:
	@echo "🔐 Saving Vault keys for automated workflow..."
	@echo ""
	@echo "⚠️  This file will store your VAULT_TOKEN and unseal keys"
	@echo "⚠️  It's added to .gitignore for security"
	@echo ""
	@read -p "Enter your VAULT_TOKEN: " token; \
	echo "VAULT_TOKEN=$$token" > .vault-keys
	@echo ""
	@echo "📝 Now enter 3 unseal keys (you only need 3 of the 5):"
	@read -p "Enter Unseal Key 1: " key1; \
	echo "UNSEAL_KEY_1=$$key1" >> .vault-keys
	@read -p "Enter Unseal Key 2: " key2; \
	echo "UNSEAL_KEY_2=$$key2" >> .vault-keys
	@read -p "Enter Unseal Key 3: " key3; \
	echo "UNSEAL_KEY_3=$$key3" >> .vault-keys
	@chmod 600 .vault-keys
	@echo ""
	@echo "✅ Vault keys saved to .vault-keys (secure permissions set)"
	@echo "🎯 You can now use 'make dev' or 'make start' for automated workflow!"

# Automatically unseal Vault using saved keys
auto-unseal:
	@if [ ! -f .vault-keys ]; then \
		echo "❌ .vault-keys file not found!"; \
		echo "📝 Run 'make save-vault-keys' first to save your keys"; \
		exit 1; \
	fi
	@echo "🔐 Auto-unsealing Vault..."
	@if ! docker ps | grep -q vault_service; then \
		echo "❌ Vault container is not running. Starting it now..."; \
		docker compose up -d vault-service; \
		sleep 5; \
	fi
	@. ./.vault-keys; \
	echo "🔓 Unsealing with key 1..."; \
	docker exec vault_service vault operator unseal $$UNSEAL_KEY_1 > /dev/null; \
	echo "🔓 Unsealing with key 2..."; \
	docker exec vault_service vault operator unseal $$UNSEAL_KEY_2 > /dev/null; \
	echo "🔓 Unsealing with key 3..."; \
	docker exec vault_service vault operator unseal $$UNSEAL_KEY_3 > /dev/null
	@echo "✅ Vault unsealed successfully!"

# Complete automated development workflow (clean → docker → auto-unseal)
dev: clean
	@echo ""
	@echo "🎯 Starting automated development workflow..."
	@echo ""
	@$(MAKE) docker-no-logs
	@echo ""
	@if [ -f .vault-keys ]; then \
		echo "🔐 Auto-unsealing Vault..."; \
		$(MAKE) auto-unseal; \
	else \
		echo "⚠️  .vault-keys not found. Run 'make save-vault-keys' first for automation"; \
		echo "📝 Or unseal manually now..."; \
		echo ""; \
		$(MAKE) unseal; \
	fi
	@echo ""
	@echo "🚀 Starting all services now that Vault is unsealed..."
	@if [ -f .vault-keys ]; then \
		. ./.vault-keys; \
		export VAULT_TOKEN; \
		docker compose up -d; \
	else \
		docker compose up -d; \
	fi
	@sleep 3
	@echo ""
	@echo "✅ Development environment ready!"
	@echo ""
	@echo "📋 Services available at:"
	@echo "  Frontend:     https://$(LAN_IP)"
	@echo "  Gateway:      https://$(LAN_IP)/api/"
	@echo "  WebSocket:    wss://$(LAN_IP)/ws/"
	@echo "  Kibana:       https://$(LAN_IP)/kibana/"
	@echo ""
	@echo "📚 API Documentation (Swagger):"
	@echo "  Gateway:      https://$(LAN_IP)/api/docs"
	@echo "  Auth Service: https://$(LAN_IP)/auth-docs/"
	@echo "  User Service: https://$(LAN_IP)/user-docs/"
	@echo "  WS Service:   https://$(LAN_IP)/ws-docs/"
	@echo ""
	@echo "🔍 Logging & Monitoring:"
	@echo "  Elasticsearch: https://$(LAN_IP)/elasticsearch/"
	@echo "  Kibana:        https://$(LAN_IP)/kibana/"
	@echo ""
	@echo "🔧 Internal Services:"
	@echo "  Vault:        http://vault-service:8200"
	@echo ""
	@echo "💡 Tip: Run 'make logs' to follow logs"

# Quick start without cleaning (docker → auto-unseal)
start:
	@echo ""
	@echo "🎯 Quick starting all services..."
	@echo ""
	@$(MAKE) docker-no-logs
	@echo ""
	@if [ -f .vault-keys ]; then \
		echo "🔐 Auto-unsealing Vault..."; \
		$(MAKE) auto-unseal; \
	else \
		echo "⚠️  .vault-keys not found. Run 'make save-vault-keys' first for automation"; \
		echo "📝 Or unseal manually now..."; \
		echo ""; \
		$(MAKE) unseal; \
	fi
	@echo ""
	@echo "🚀 Starting all services now that Vault is unsealed..."
	@if [ -f .vault-keys ]; then \
		. ./.vault-keys; \
		export VAULT_TOKEN; \
		docker compose up -d; \
	else \
		docker compose up -d; \
	fi
	@sleep 3
	@echo ""
	@echo "✅ All services ready!"
	@echo ""
	@echo "📋 Services available at:"
	@echo "  Frontend:     https://$(LAN_IP)"
	@echo "  Gateway:      https://$(LAN_IP)/api/"
	@echo "  WebSocket:    wss://$(LAN_IP)/ws/"
	@echo "  Kibana:       https://$(LAN_IP)/kibana/"
	@echo ""
	@echo "📚 API Documentation (Swagger):"
	@echo "  Gateway:      https://$(LAN_IP)/api/docs"
	@echo "  Auth Service: https://$(LAN_IP)/auth-docs/"
	@echo "  User Service: https://$(LAN_IP)/user-docs/"
	@echo "  WS Service:   https://$(LAN_IP)/ws-docs/"
	@echo ""
	@echo "🔍 Logging & Monitoring:"
	@echo "  Elasticsearch: https://$(LAN_IP)/elasticsearch/"
	@echo "  Kibana:        https://$(LAN_IP)/kibana/"
	@echo ""
	@echo "🔧 Internal Services:"
	@echo "  Vault:        http://vault-service:8200"
	@echo ""
	@echo "💡 Tip: Run 'make logs' to follow logs"

# Helper target: docker without following logs (used by dev and start)
docker-no-logs:
	@echo "🐳 Building and starting services with Docker Compose..."
	@if [ -f .vault-keys ]; then \
		echo "🔐 Loading VAULT_TOKEN from .vault-keys..."; \
		. ./.vault-keys; \
		export VAULT_TOKEN; \
		echo "🛑 Stopping existing containers if running..."; \
		docker compose down 2>/dev/null || true; \
		echo "🧹 Cleaning up individual service containers..."; \
		docker stop user_service auth_service gateway_service ws_service frontend_service elasticsearch logstash kibana filebeat kibana_setup 2>/dev/null || true; \
		docker rm user_service auth_service gateway_service ws_service frontend_service elasticsearch logstash kibana filebeat kibana_setup 2>/dev/null || true; \
		echo "🧹 Cleaning up existing network..."; \
		docker network rm ft_transcendence_network 2>/dev/null || true; \
		echo "🔨 Building images if needed..."; \
		docker compose build; \
		echo "🔐 Starting Vault first..."; \
		docker compose up -d vault-service; \
	else \
		echo "🛑 Stopping existing containers if running..."; \
		docker compose down 2>/dev/null || true; \
		echo "🧹 Cleaning up individual service containers..."; \
		docker stop user_service auth_service gateway_service ws_service frontend_service elasticsearch logstash kibana filebeat kibana_setup 2>/dev/null || true; \
		docker rm user_service auth_service gateway_service ws_service frontend_service elasticsearch logstash kibana filebeat kibana_setup 2>/dev/null || true; \
		echo "🧹 Cleaning up existing network..."; \
		docker network rm ft_transcendence_network 2>/dev/null || true; \
		echo "🔨 Building images if needed..."; \
		docker compose build; \
		echo "🔐 Starting Vault first..."; \
		docker compose up -d vault-service; \
	fi
	@echo "⏳ Waiting for Vault to be ready..."
	@sleep 5
	@echo "⏸️  Services will start after Vault is unsealed..."

# ============================================================================
# END AUTOMATED WORKFLOW TARGETS
# ============================================================================

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
	@echo "  Frontend:     https://$(LAN_IP)"
	@echo "  Gateway:      https://$(LAN_IP)/api/"
	@echo "  WebSocket:    wss://$(LAN_IP)/ws/"
	@echo "  Kibana:       https://$(LAN_IP)/kibana/"
	@echo ""
	@echo "📚 API Documentation (Swagger):"
	@echo "  Gateway:      https://$(LAN_IP)/api/docs"
	@echo "  Auth Service: https://$(LAN_IP)/auth-docs/"
	@echo "  User Service: https://$(LAN_IP)/user-docs/"
	@echo "  WS Service:   https://$(LAN_IP)/ws-docs/"
	@echo ""
	@echo "🔍 Logging & Monitoring:"
	@echo "  Elasticsearch: https://$(LAN_IP)/elasticsearch/"
	@echo "  Kibana:        https://$(LAN_IP)/kibana/"
	@echo ""
	@echo "🔧 Internal Services:"
	@echo "  Vault:        http://vault-service:8200"

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
	@echo "  Frontend:     https://$(LAN_IP)"
	@echo "  Gateway:      https://$(LAN_IP)/api/"
	@echo "  WebSocket:    wss://$(LAN_IP)/ws/"
	@echo "  Kibana:       https://$(LAN_IP)/kibana/"
	@echo ""
	@echo "📚 API Documentation (Swagger):"
	@echo "  Gateway:      https://$(LAN_IP)/api/docs"
	@echo "  Auth Service: https://$(LAN_IP)/auth-docs/"
	@echo "  User Service: https://$(LAN_IP)/user-docs/"
	@echo "  WS Service:   https://$(LAN_IP)/ws-docs/"
	@echo ""
	@echo "🔍 Logging & Monitoring:"
	@echo "  Elasticsearch: https://$(LAN_IP)/elasticsearch/"
	@echo "  Kibana:        https://$(LAN_IP)/kibana/"
	@echo ""
	@echo "🔧 Internal Services:"
	@echo "  Vault:        http://vault-service:8200"

# Restart services only (preserves Vault unsealed state)
restart-services:
	@echo "🔄 Restarting services (preserving Vault)..."
	@echo "🔐 Vault will remain running and unsealed"
	@docker compose restart user-service auth-service gateway-service ws-service frontend waf elasticsearch logstash kibana filebeat 2>/dev/null || \
		(docker compose up -d user-service auth-service gateway-service ws-service frontend waf elasticsearch logstash kibana filebeat)
	@echo "🔧 Restarting kibana-setup to ensure defaults are loaded..."
	@docker compose up -d kibana-setup
	@echo "✅ Services restarted!"
	@echo "📋 Services available at:"
	@echo "  Frontend:     https://$(LAN_IP)"
	@echo "  Gateway:      https://$(LAN_IP)/api/"
	@echo "  WebSocket:    wss://$(LAN_IP)/ws/"
	@echo "  Kibana:       https://$(LAN_IP)/kibana/"
	@echo ""
	@echo "📚 API Documentation (Swagger):"
	@echo "  Gateway:      https://$(LAN_IP)/api/docs"
	@echo "  Auth Service: https://$(LAN_IP)/auth-docs/"
	@echo "  User Service: https://$(LAN_IP)/user-docs/"
	@echo "  WS Service:   https://$(LAN_IP)/ws-docs/"
	@echo ""
	@echo "🔍 Logging & Monitoring:"
	@echo "  Elasticsearch: https://$(LAN_IP)/elasticsearch/"
	@echo "  Kibana:        https://$(LAN_IP)/kibana/"
	@echo ""
	@echo "🔧 Internal Services:"
	@echo "  Vault:        http://vault-service:8200"

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
	@echo "🗑️  Removing local database files (new structure)..."
	@rm -f backend/user-service/data/*.db
	@rm -f backend/user-service/data/*.db-journal
	@rm -f backend/auth-service/data/*.db
	@rm -f backend/auth-service/data/*.db-journal
	@rm -f backend/ws-service/data/*.db
	@rm -f backend/ws-service/data/*.db-journal
	@rm -f *.db
	@rm -f *.db-journal
	@echo "🗑️  Removing Prisma leftovers (if any)..."
	@rm -rf backend/auth-service/prisma
	@rm -rf backend/user-service/prisma
	@rm -rf backend/prisma
	@find backend -type d -name "prisma" -exec rm -rf {} + 2>/dev/null || true
	@find backend -type f -path "*/prisma/*.db" -delete 2>/dev/null || true
	@find backend -type f -path "*/prisma/*.db-journal" -delete 2>/dev/null || true
	@rm -rf prisma
	@rm -rf generated/prisma
	@echo "🧹 Removing frontend build artifacts..."
	@rm -rf frontend/dist
	@rm -rf frontend/node_modules/.vite
	@rm -rf frontend/.vite
	@rm -rf frontend/.cache
	@echo "🧹 Removing backend build artifacts..."
	@find backend -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	@find backend -type f -name "*.tsbuildinfo" -delete 2>/dev/null || true
	@find backend -type d -name ".cache" -exec rm -rf {} + 2>/dev/null || true
	@find backend -type d -path "*/node_modules/.cache" -exec rm -rf {} + 2>/dev/null || true
	@echo "🧹 Removing logs..."
	@find backend -type f -name "*.log" -delete 2>/dev/null || true
	@rm -f *.log
	@rm -rf logs
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

# ELK Stack service commands
up-elasticsearch:
	@echo "🚀 Starting elasticsearch..."
	docker compose up -d elasticsearch

up-logstash:
	@echo "🚀 Starting logstash..."
	docker compose up -d logstash

up-kibana:
	@echo "🚀 Starting kibana..."
	docker compose up -d kibana

up-filebeat:
	@echo "🚀 Starting filebeat..."
	docker compose up -d filebeat

up-elk:
	@echo "🚀 Starting ELK Stack..."
	docker compose up -d elasticsearch logstash kibana filebeat kibana-setup
	@echo "✅ ELK Stack started!"
	@echo "📊 Kibana will be available at: https://$(LAN_IP)/kibana/"
	@echo "🔑 Login with: elastic / changeme"

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
	@echo "📝 Next steps - Run these commands in your shell:"
	@echo "   export VAULT_TOKEN='your_initial_root_token'"
	@echo "   export VAULT_ADDR='127.0.0.1:8200'"
	@echo "   make up"

# Automated Vault first-time setup (all steps from README lines 38-116)
vault-init-first-time:
	@echo "🔐 Automated Vault First-Time Setup"
	@echo "===================================="
	@echo ""
	@echo "Step 1: Building and starting Vault..."
	@$(MAKE) build
	@$(MAKE) up-vault
	@echo "⏳ Waiting for Vault to be ready..."
	@sleep 5
	@echo ""
	@echo "Step 2: Initializing Vault (getting tokens and keys)..."
	@echo "⚠️  This will generate Initial Root Token and 5 Unseal Keys"
	@echo "⚠️  SAVE THESE SECURELY - they are unique to this machine!"
	@echo ""
	@docker exec -it vault_service vault operator init || \
		(echo "❌ Vault initialization failed. Check if container is running." && exit 1)
	@echo ""
	@echo "✅ Vault initialized!"
	@echo "📝 IMPORTANT: Save the Initial Root Token and 5 Unseal Keys securely"
	@echo ""
	@echo "Step 3: Setting up VAULT environment variables..."
	@echo "⚠️  Please enter your Initial Root Token from Step 2:"
	@read -p "VAULT_TOKEN: " token && \
	export VAULT_TOKEN="$$token" && \
	export VAULT_ADDR='127.0.0.1:8200' && \
	echo "✅ VAULT_TOKEN and VAULT_ADDR exported for this session"
	@echo ""
	@echo "Step 4: Unsealing Vault..."
	@echo "⚠️  You will need 3 of the 5 Unseal Keys from Step 2"
	@read -s -p "Enter Unseal Key 1: " key1 && echo && \
	docker exec vault_service vault operator unseal $$key1 || exit 1
	@read -s -p "Enter Unseal Key 2: " key2 && echo && \
	docker exec vault_service vault operator unseal $$key2 || exit 1
	@read -s -p "Enter Unseal Key 3: " key3 && echo && \
	docker exec vault_service vault operator unseal $$key3 || exit 1
	@echo "✅ Vault unsealed!"
	@echo ""
	@echo "Step 5: Logging into Vault..."
	@echo "⚠️  Please re-enter your VAULT_TOKEN for login:"
	@read -p "VAULT_TOKEN: " token && \
	docker exec -e VAULT_TOKEN="$$token" vault_service vault login -method=token token="$$token" > /dev/null 2>&1 || \
		(echo "⚠️  Login step skipped (may already be logged in)" && true)
	@echo "✅ Logged into Vault!"
	@echo ""
	@echo "Step 6: Loading secrets..."
	@echo "⚠️  Please enter your VAULT_TOKEN again for secret operations:"
	@read -p "VAULT_TOKEN: " token && \
	echo "📦 Enabling KV v2 secrets engine..." && \
	docker exec -e VAULT_TOKEN="$$token" vault_service vault secrets enable -path=secret kv-v2 2>/dev/null || \
		echo "⚠️  KV engine already enabled (this is OK)" && \
	echo "🔑 Adding JWT secret..." && \
	docker exec -e VAULT_TOKEN="$$token" vault_service vault kv put secret/jwt JWT_SECRET='secretjwt' || \
		(echo "❌ Failed to add JWT secret. Ensure Vault is unsealed and logged in." && exit 1) && \
	echo "🔒 Creating SSL certificates..." && \
	mkdir -p certs && \
	openssl req -x509 -nodes -days 365 \
		-newkey rsa:2048 \
		-keyout certs/server.key \
		-out certs/server.crt \
		-subj "/CN=localhost" 2>/dev/null || \
		(echo "⚠️  SSL certs may already exist (this is OK)" && true) && \
	echo "🔒 Adding SSL certificates to Vault..." && \
	docker exec -e VAULT_TOKEN="$$token" vault_service vault kv put secret/ssl \
		CRT="$$(cat certs/server.crt)" KEY="$$(cat certs/server.key)" && \
		rm -rf certs || \
		(echo "❌ Failed to add SSL secrets. Ensure Vault is unsealed and logged in." && exit 1)
	@echo "✅ Secrets loaded!"
	@echo ""
	@echo "Step 7: Starting all containers..."
	@$(MAKE) up
	@echo ""
	@echo "✅ Vault first-time setup complete!"
	@echo "📝 Next steps - Run these commands in your shell:"
	@echo "   export VAULT_TOKEN='your_initial_root_token'"
	@echo "   export VAULT_ADDR='127.0.0.1:8200'"

# Automated Vault setup for already configured machines (README lines 119-150)
vault-init-existing:
	@echo "🔐 Automated Vault Setup (Already Configured)"
	@echo "============================================="
	@echo ""
	@echo "Step 1: Building and starting Vault..."
	@$(MAKE) build
	@$(MAKE) up-vault
	@echo "⏳ Waiting for Vault to be ready..."
	@sleep 5
	@echo ""
	@echo "Step 2: Setting up VAULT environment variables..."
	@if [ -z "$$VAULT_TOKEN" ]; then \
		echo "⚠️  VAULT_TOKEN not found in environment."; \
		echo "⚠️  Please enter your Initial Root Token:"; \
		read -p "VAULT_TOKEN: " token && \
		export VAULT_TOKEN="$$token" && \
		export VAULT_ADDR='127.0.0.1:8200' && \
		echo "✅ VAULT_TOKEN and VAULT_ADDR exported for this session"; \
	else \
		export VAULT_ADDR='127.0.0.1:8200' && \
		echo "✅ Using existing VAULT_TOKEN from environment" && \
		echo "✅ VAULT_ADDR set to 127.0.0.1:8200"; \
	fi
	@echo ""
	@echo "Step 3: Unsealing Vault..."
	@echo "⚠️  You will need 3 of your 5 Unseal Keys"
	@read -s -p "Enter Unseal Key 1: " key1 && echo && \
	docker exec vault_service vault operator unseal $$key1 || exit 1
	@read -s -p "Enter Unseal Key 2: " key2 && echo && \
	docker exec vault_service vault operator unseal $$key2 || exit 1
	@read -s -p "Enter Unseal Key 3: " key3 && echo && \
	docker exec vault_service vault operator unseal $$key3 || exit 1
	@echo "✅ Vault unsealed!"
	@echo ""
	@echo "Step 4: Starting all containers..."
	@$(MAKE) up
	@echo ""
	@echo "✅ Vault setup complete for existing configuration!"
	@echo "📝 Next steps - Run these commands in your shell:"
	@echo "   export VAULT_TOKEN='your_initial_root_token'"
	@echo "   export VAULT_ADDR='127.0.0.1:8200'"

# Clear frontend build cache
clear-cache:
	@echo "🧹 Clearing frontend build cache..."
	@rm -rf frontend/dist frontend/node_modules/.vite
	@echo "✅ Cache cleared!"

# Force rebuild frontend without cache
rebuild-frontend: clear-cache
	@echo "🔨 Force rebuilding frontend (no cache)..."
	@echo "🛑 Stopping services (preserving Vault and ELK)..."
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
	@echo "🛑 Stopping services (preserving Vault and ELK)..."
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

# Fix backend ESLint dependencies (if you see module errors)
fix-backend-deps:
	@echo "🔧 Fixing backend ESLint dependencies..."
	@echo "🧹 Cleaning backend node_modules..."
	@cd backend && rm -rf node_modules package-lock.json
	@echo "📦 Reinstalling backend dependencies..."
	@cd backend && npm install
	@echo "✅ Backend dependencies fixed!"
	@echo "💡 If you still see errors, try: make fix-backend-deps"
