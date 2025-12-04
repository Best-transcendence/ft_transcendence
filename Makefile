# ft_transcendence - Main Makefile
# School 42 project - Docker management
SHELL := /bin/bash

.DEFAULT_GOAL := up

# -----------------------------------------------------------------------------
# Environment & IP detection
# -----------------------------------------------------------------------------

# Load environment variables from .env file (only what we REALLY want from there)
ifeq ($(shell test -f .env && echo true),true)
  FRONTEND_PORT := $(shell grep -E '^FRONTEND_PORT=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ')
endif

# Set defaults if not found in .env
FRONTEND_PORT ?= 3000

# Auto-detect LAN_IP based on OS and network interface
UNAME_S := $(shell uname -s)

ifeq ($(UNAME_S),Darwin)  # macOS
    DETECTED_LAN_IP := $(shell ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1")
else ifeq ($(UNAME_S),Linux)
    DETECTED_LAN_IP := $(shell hostname -I | awk '{print $$1}' 2>/dev/null || echo "127.0.0.1")
else
    # Windows PowerShell (Git Bash fallback)
    DETECTED_LAN_IP := $(shell powershell.exe -Command "(Get-NetIPAddress -AddressFamily IPv4).IPAddress" | head -1 2>/dev/null || echo "127.0.0.1")
endif

# Final LAN_IP value used everywhere
LAN_IP ?= $(DETECTED_LAN_IP)

update-env-ip:
	@echo "🔄 Detecting operating system..."
	@unameOut="$(UNAME_S)"; \
	echo "🖥️ OS Detected: $$unameOut"; \
	echo "🔄 Updating LAN_IP in .env..."; \
	if [ -f .env ]; then \
		if echo "$$unameOut" | grep -i "darwin" >/dev/null; then \
			sed -i '' "s/^LAN_IP=.*/LAN_IP=$(LAN_IP)/" .env || true; \
		elif echo "$$unameOut" | grep -i "linux" >/dev/null; then \
			sed -i "s/^LAN_IP=.*/LAN_IP=$(LAN_IP)/" .env || true; \
		else \
			powershell.exe -Command \
				"(Get-Content .env) -replace 'LAN_IP=.*', 'LAN_IP=$(LAN_IP)' | Set-Content .env" || true; \
		fi; \
	else \
		echo "LAN_IP=$(LAN_IP)" > .env; \
	fi; \
	echo "🌐 LAN_IP set to: $(LAN_IP)"

waf-certs:
	@echo "🔐 Generating WAF TLS certificates..."
	@mkdir -p waf/certs
	@openssl req -x509 -nodes -days 365 \
	  -newkey rsa:2048 \
	  -keyout waf/certs/server.key \
	  -out waf/certs/server.crt \
	  -subj "/CN=localhost" 2>/dev/null || true
	@echo "✅ WAF certificates ready in waf/certs"

# -----------------------------------------------------------------------------
# Top-level commands
# -----------------------------------------------------------------------------

# Default target
docker: update-env-ip
	@echo "🐳 Building and starting all services with Docker Compose..."
	@echo "🛑 Stopping existing containers if running..."
	docker compose down 2>/dev/null || true
	@echo "🧹 Cleaning up individual service containers..."
	docker stop user_service auth_service gateway_service ws_service frontend_service elasticsearch logstash kibana filebeat kibana_setup 2>/dev/null || true
	docker rm   user_service auth_service gateway_service ws_service frontend_service elasticsearch logstash kibana filebeat kibana_setup 2>/dev/null || true
	@echo "🧹 Cleaning up existing network..."
	docker network rm ft_transcendence_network 2>/dev/null || true
	@echo "🔨 Building images if needed..."
	@$(MAKE) waf-certs
	docker compose build
	@echo "🚀 Starting all services..."
	docker compose up -d
	@echo "✅ All services started!"
	@echo
	@echo "📋 Services available at:"
	@echo "  Frontend:     https://$(LAN_IP)"
	@echo "  Gateway:      https://$(LAN_IP)/api/"
	@echo "  WebSocket:    wss://$(LAN_IP)/ws/"
	@echo "  Kibana:       https://$(LAN_IP)/kibana/"
	@echo
	@echo "📚 API Documentation (Swagger):"
	@echo "  Gateway:      https://$(LAN_IP)/api/docs"
	@echo "  Auth Service: https://$(LAN_IP)/auth-docs/"
	@echo "  User Service: https://$(LAN_IP)/user-docs/"
	@echo "  WS Service:   https://$(LAN_IP)/ws-docs/"
	@echo
	@echo "🔍 Logging & Monitoring:"
	@echo "  Elasticsearch: https://$(LAN_IP)/elasticsearch/"
	@echo "  Kibana:        https://$(LAN_IP)/kibana/"
	@echo
	@echo "📋 Following logs (Ctrl+C to stop)..."
	docker compose logs -f

docker-with-vault: update-env-ip
	@echo "🐳 Building and starting all services with Docker Compose (with Vault)..."
	@echo "🛑 Stopping existing containers if running..."
	docker compose down 2>/dev/null || true
	@echo "🧹 Cleaning up individual service containers..."
	docker stop user_service auth_service gateway_service ws_service frontend_service elasticsearch logstash kibana filebeat kibana_setup 2>/dev/null || true
	docker rm   user_service auth_service gateway_service ws_service frontend_service elasticsearch logstash kibana filebeat kibana_setup 2>/dev/null || true
	@echo "🧹 Cleaning up existing network..."
	docker network rm ft_transcendence_network 2>/dev/null || true
	@echo "🔨 Building images if needed..."
	@$(MAKE) waf-certs
	docker compose build
	@echo "🔐 Starting Vault first..."
	docker compose up -d vault-service
	@sleep 5
	@echo "🔍 Checking Vault status..."
	@status=$$(docker exec vault_service vault status 2>/dev/null | grep -E "Sealed|Initialized" || echo ""); \
	if [ -z "$$status" ]; then \
		echo "⚠️  Vault is starting up. Wait a few seconds and try 'make dev' or 'make start'."; \
	elif echo "$$status" | grep -q "Initialized.*false"; then \
		echo "⚠️  Vault is not initialized! Initialize it manually inside the container, then run 'make save-vault-keys'."; \
	elif echo "$$status" | grep -q "Sealed.*true"; then \
		echo "❌ Vault is sealed! Run 'make save-vault-keys' (if not done), then 'make dev' or 'make start' to auto-unseal."; \
	else \
		echo "✅ Vault is ready!"; \
	fi
	@echo "🚀 Starting all other services..."
	docker compose up -d
	@echo "✅ All services started!"
	@echo
	@echo "📋 Services available at:"
	@echo "  Frontend:     https://$(LAN_IP)"
	@echo "  Gateway:      https://$(LAN_IP)/api/"
	@echo "  WebSocket:    wss://$(LAN_IP)/ws/"
	@echo "  Kibana:       https://$(LAN_IP)/kibana/"
	@echo "  Vault:        http://vault-service:8200"
	@echo
	@echo "📋 Following logs (Ctrl+C to stop)..."
	docker compose logs -f

help:
	@echo "🚀 ft_transcendence - Docker Management"
	@echo
	@echo "🎯 Main commands:"
	@echo "  make docker            - Stop, build, start all services and follow logs (no Vault)"
	@echo "  make docker-with-vault - Same as above, but starts Vault too"
	@echo "  make build             - Build all Docker images"
	@echo "  make up                - Start all services"
	@echo "  make down              - Stop all services"
	@echo "  make logs              - Follow logs from all services"
	@echo "  make restart           - Restart all services (including Vault)"
	@echo "  make restart-services  - Restart services only (preserve Vault state)"
	@echo "  make clean             - Clean all Docker resources and local DBs"
	@echo "  make status            - Show service status"
	@echo
	@echo "Rebuild:"
	@echo "  make clear-cache       - Clear frontend build cache"
	@echo "  make rebuild-frontend  - Rebuild frontend only (no cache)"
	@echo "  make rebuild-all       - Rebuild ALL services (no cache)"
	@echo
	@echo "ELK:"
	@echo "  make up-elk            - Start ELK stack (ES + Logstash + Kibana + Filebeat)"
	@echo "Dev / Vault:"
	@echo "  make dev              - Clean + build + auto-unseal + start"
	@echo "  make start            - Build + auto-unseal + start (no clean)"
	@echo "  make save-vault-keys  - Store Vault unseal keys for automation"
	@echo "  make auto-unseal      - Unseal Vault using stored keys (.vault-keys)"

# -----------------------------------------------------------------------------
# Basic lifecycle
# -----------------------------------------------------------------------------

build:
	@echo "🔨 Building all Docker images..."
	@$(MAKE) waf-certs
	docker compose build

up:
	@echo "🚀 Starting all services..."
	@$(MAKE) waf-certs
	docker compose up -d
	@echo "✅ All services started!"
	@echo "📋 Frontend: https://$(LAN_IP)"

down:
	@echo "🛑 Stopping all services..."
	docker compose down

logs:
	@echo "📋 Following logs from all services (Ctrl+C to stop)..."
	docker compose logs -f

restart: down
	@echo "🚀 Starting all services..."
	@echo "🔐 Starting Vault first..."
	@docker compose up -d vault-service 2>/dev/null || true
	@sleep 5
	@echo "🚀 Starting other services..."
	docker compose up -d
	@echo "✅ All services restarted!"
	@echo "📋 Frontend: https://$(LAN_IP)"

restart-services:
	@echo "🔄 Restarting services (preserving Vault)..."
	@docker compose restart user-service auth-service gateway-service ws-service frontend waf elasticsearch logstash kibana filebeat 2>/dev/null || \
		(docker compose up -d user-service auth-service gateway-service ws-service frontend waf elasticsearch logstash kibana filebeat)
	@docker compose up -d kibana-setup
	@echo "✅ Services restarted!"
	@echo "📋 Frontend: https://$(LAN_IP)"

clean:
	@echo "🧹 Cleaning up ALL Docker resources and local data..."
	docker compose down -v --rmi all 2>/dev/null || true
	@echo "🧹 Pruning Docker system..."
	docker system prune -a -f --volumes
	docker builder prune -a -f
	@echo "🗑️  Removing local DB files..."
	@rm -f backend/user-service/data/*.db backend/user-service/data/*.db-journal || true
	@rm -f backend/auth-service/data/*.db backend/auth-service/data/*.db-journal || true
	@rm -f backend/ws-service/data/*.db backend/ws-service/data/*.db-journal || true
	@rm -f *.db *.db-journal || true
	@echo "🗑️  Removing Prisma leftovers..."
	@rm -rf backend/auth-service/prisma backend/user-service/prisma backend/prisma prisma generated/prisma || true
	@find backend -type d -name "prisma" -exec rm -rf {} + 2>/dev/null || true
	@find backend -type f -path "*/prisma/*.db" -delete 2>/dev/null || true
	@find backend -type f -path "*/prisma/*.db-journal" -delete 2>/dev/null || true
	@echo "🧹 Removing frontend build artifacts..."
	@rm -rf frontend/dist frontend/node_modules/.vite frontend/.vite frontend/.cache || true
	@echo "🧹 Removing backend build artifacts..."
	@find backend -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	@find backend -type f -name "*.tsbuildinfo" -delete 2>/dev/null || true
	@find backend -type d -name ".cache" -exec rm -rf {} + 2>/dev/null || true
	@find backend -type d -path "*/node_modules/.cache" -exec rm -rf {} + 2>/dev/null || true
	@echo "🧹 Removing logs..."
	@find backend -type f -name "*.log" -delete 2>/dev/null || true
	@rm -f *.log
	@rm -rf logs
	@echo "🧹 Removing WAF certificates..."
	@rm -rf waf/certs
	@echo "✅ Full cleanup complete!"

status:
	@echo "📊 Service Status:"
	@docker compose ps

# -----------------------------------------------------------------------------
# Vault basics
# -----------------------------------------------------------------------------

docker-no-logs: update-env-ip
	@echo "🐳 Building and starting services (no logs)..."
	docker compose down 2>/dev/null || true
	@$(MAKE) waf-certs
	docker compose build
	docker compose up -d

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
	@$(MAKE) waf-certs
	@$(MAKE) docker-no-logs
	@echo ""
	@if [ -f .vault-keys ]; then \
		echo "🔐 Auto-unsealing Vault..."; \
		$(MAKE) auto-unseal; \
	else \
		echo "❌ .vault-keys not found."; \
		echo "📝 Run 'make save-vault-keys' once to store your Vault keys, then re-run 'make dev'."; \
		exit 1; \
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
		echo "❌ .vault-keys not found."; \
		echo "📝 Run 'make save-vault-keys' once to store your Vault keys, then re-run 'make start'."; \
		exit 1; \
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
# -----------------------------------------------------------------------------
# ELK & rebuild helpers
# -----------------------------------------------------------------------------

up-elk:
	@echo "🚀 Starting ELK Stack..."
	docker compose up -d elasticsearch logstash kibana filebeat kibana-setup
	@echo "✅ ELK Stack started!"
	@echo "📊 Kibana: https://$(LAN_IP)/kibana/ (elastic / changeme)"

clear-cache:
	@echo "🧹 Clearing frontend build cache..."
	@rm -rf frontend/dist frontend/node_modules/.vite frontend/.vite frontend/.cache
	@echo "✅ Cache cleared!"

rebuild-frontend: update-env-ip clear-cache
	@echo "🔨 Force rebuilding frontend (no cache)..."
	@docker compose stop frontend user-service auth-service gateway-service ws-service waf 2>/dev/null || true
	@docker compose rm -f frontend user-service auth-service gateway-service ws-service waf 2>/dev/null || true
	@if [ -f .env ]; then \
		set -a; . .env; set +a; \
	fi; \
	docker compose build --no-cache frontend
	@docker compose up -d
	@echo "✅ Frontend rebuilt!"
	@echo "⚠️  Clear your browser cache or hard refresh."

rebuild-all: update-env-ip clear-cache
	@echo "🔨 Force rebuilding ALL services (no cache)..."
	@docker compose stop frontend user-service auth-service gateway-service ws-service waf 2>/dev/null || true
	@docker compose rm -f frontend user-service auth-service gateway-service ws-service waf 2>/dev/null || true
	@docker compose build --no-cache
	@docker compose up -d
	@echo "✅ All services rebuilt!"
	@echo "📋 Hard refresh browser (Cmd/Ctrl+Shift+R)"

.PHONY: help docker docker-with-vault build up down logs restart restart-services clean \
        status up-elk clear-cache rebuild-frontend rebuild-all update-env-ip \
        docker-no-logs save-vault-keys auto-unseal dev start