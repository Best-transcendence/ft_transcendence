# Gateway Service Makefile

.PHONY: all run clean docker docker-clean logs

# Default target - run all installations
all:
	@echo "📦 Installing gateway dependencies..."
	npm install
	@echo "Installing .env dependences"
	npm install dotenv dotenv-expand
	@echo "✅ Gateway service setup complete!"
	@echo "🚀 Starting gateway development server..."
	npm run dev

# Just run the service (assumes already installed)
run:
	@echo "🚀 Starting gateway development server..."
	npm run dev

# Clean up (including Docker)
clean:
	@echo "🧹 Cleaning up..."
	rm -rf node_modules
	@echo "🐳 Cleaning Docker resources..."
	docker stop gateway_service 2>/dev/null || true
	docker rm gateway_service 2>/dev/null || true
	docker rmi ft_transcendence_gateway_service 2>/dev/null || true

# Docker: build if needed and start
docker:
	@echo "🐳 Building gateway Docker image..."
	docker build -t ft_transcendence_gateway_service .
	@echo "🛑 Stopping existing container if running..."
	docker stop gateway_service 2>/dev/null || true
	docker rm gateway_service 2>/dev/null || true
	@echo "🚀 Starting gateway Docker container..."
	docker network create ft_transcendence_network 2>/dev/null || true
	docker run -d --name gateway_service --network ft_transcendence_network -p 3003:3003 ft_transcendence_gateway_service
	@echo "✅ Container started! Following logs..."
	@echo "📋 Press Ctrl+C to stop following logs (container keeps running)"
	docker logs -f gateway_service

# Docker: clean existing images for this service
docker-clean:
	@echo "🧹 Cleaning up Docker resources for gateway..."
	docker stop gateway_service 2>/dev/null || true
	docker rm gateway_service 2>/dev/null || true
	docker rmi ft_transcendence_gateway_service 2>/dev/null || true

# Docker: follow logs in real-time
logs:
	@echo "📋 Following gateway logs (Ctrl+C to stop)..."
	docker logs -f gateway_service
