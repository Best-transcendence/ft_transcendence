# Auth Service Makefile

.PHONY: all run clean docker docker-clean logs

# Default target - run all installations
all:
	@echo "📦 Installing auth-service dependencies..."
	npm install
	@echo "Installing .env dependences"
	npm install dotenv dotenv-expand
	@echo "🌱 Seeding database..."
	npm run seed
	@echo "✅ Auth service setup complete!"
	@echo "🚀 Starting auth-service development server..."
	npm run dev

# Just run the service (assumes already installed)
run:
	@echo "🚀 Starting auth-service development server..."
	npm run dev

# Clean up (including Docker)
clean:
	@echo "🧹 Cleaning up..."
	rm -rf node_modules
	rm -f data/auth.db
	rm -f data/*.db
	@echo "🐳 Cleaning Docker resources..."
	docker stop auth_service 2>/dev/null || true
	docker rm auth_service 2>/dev/null || true
	docker rmi ft_transcendence_auth_service 2>/dev/null || true

# Docker: build if needed and start
docker:
	@echo "🐳 Building auth-service Docker image..."
	docker build -t ft_transcendence_auth_service .
	@echo "🛑 Stopping existing container if running..."
	docker stop auth_service 2>/dev/null || true
	docker rm auth_service 2>/dev/null || true
	@echo "🚀 Starting auth-service Docker container..."
	docker network create ft_transcendence_network 2>/dev/null || true
	docker run -d --name auth_service --network ft_transcendence_network -p 3001:3001 ft_transcendence_auth_service
	@echo "✅ Container started! Following logs..."
	@echo "📋 Press Ctrl+C to stop following logs (container keeps running)"
	docker logs -f auth_service

# Docker: clean existing images for this service
docker-clean:
	@echo "🧹 Cleaning up Docker resources for auth-service..."
	docker stop auth_service 2>/dev/null || true
	docker rm auth_service 2>/dev/null || true
	docker rmi ft_transcendence_auth_service 2>/dev/null || true

# Docker: follow logs in real-time
logs:
	@echo "📋 Following auth-service logs (Ctrl+C to stop)..."
	docker logs -f auth_service
