# ft_transcendence - Main Makefile
# School 42 project - Docker management
SHELL := /bin/bash

# Load environment variables from .env file
ifeq ($(shell test -f .env && echo true),true)
  LAN_IP := $(shell grep -E '^LAN_IP=' .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ')
endif

# Set defaults if not found in .env
LAN_IP ?= localhost


.PHONY: help save-vault-keys auto-unseal dev start docker-no-logs logs clean unseal up-vault vault-setup-secrets vault-ready vault-setup restart-user restart-auth restart-gateway restart-ws restart-frontend

help:
	@echo "🚀 ft_transcendence - Docker Management"
	@echo ""
	@echo "🎯 Quick Start:"
	@echo "  make dev             - Complete automated workflow (clean → docker → auto-unseal)"
	@echo "  make start           - Quick start without cleaning (docker → auto-unseal)"
	@echo "  make save-vault-keys - Save Vault keys for automation (one-time setup)"
	@echo ""
	@echo "Available commands:"
	@echo "  make logs            - Follow logs from all services"
	@echo ""
	@echo "Service restart commands:"
	@echo "  make restart-user    - Restart user-service"
	@echo "  make restart-auth    - Restart auth-service"
	@echo "  make restart-gateway - Restart gateway-service"
	@echo "  make restart-ws      - Restart ws-service"
	@echo "  make restart-frontend - Restart frontend"
	@echo ""
	@echo "Vault commands:"
	@echo "  make vault-setup     - Complete first-time Vault setup (init + unseal + secrets)"
	@echo "  make unseal          - Unseal Vault manually (requires 3 unseal keys)"
	@echo "  make auto-unseal     - Unseal Vault automatically (uses saved keys)"
	@echo "  make vault-ready     - Check if Vault is ready (initialized and unsealed)"
	@echo ""

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

# Follow logs
logs:
	@echo "📋 Following logs from all services (Ctrl+C to stop)..."
	docker compose logs -f

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

# Start vault-service
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
	@echo "📝 You can now run 'make start' to start all services"

# Individual service restart targets
restart-user:
	@echo "🔄 Restarting user-service..."
	docker compose restart user-service

restart-auth:
	@echo "🔄 Restarting auth-service..."
	docker compose restart auth-service

restart-gateway:
	@echo "🔄 Restarting gateway-service..."
	docker compose restart gateway-service

restart-ws:
	@echo "🔄 Restarting ws-service..."
	docker compose restart ws-service

restart-frontend:
	@echo "🔄 Restarting frontend..."
	docker compose restart frontend
