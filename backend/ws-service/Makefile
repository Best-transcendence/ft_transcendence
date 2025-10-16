# WS Service Makefile

.PHONY: all run clean docker docker-clean logs

# Default target - run all installations
all:
	@echo "📦 Installing ws-service dependencies..."
	npm install
	@echo "✅ WS service setup complete!"
	@echo "🚀 Starting ws-service development server..."
	npm run dev

# Just run the service (assumes already installed)
run:
	@echo "🚀 Starting ws-service development server..."
	npm run dev

# Clean up (including Docker)
clean:
	@echo "🧹 Cleaning up..."
	rm -rf node_modules
	@echo "🐳 Cleaning Docker resources..."
	docker stop ws_service 2>/dev/null || true
	docker rm ws_service 2>/dev/null || true
	docker rmi ft_transcendence_ws_service 2>/dev/null || true

# Docker: build if needed and start
docker:
	@echo "🐳 Building ws-service Docker image..."
	docker build -t ft_transcendence_ws_service .
	@echo "🛑 Stopping existing container if running..."
	docker stop ws_service 2>/dev/null || true
	docker rm ws_service 2>/dev/null || true
	@echo "🚀 Starting ws-service Docker container..."
	docker network create ft_transcendence_network 2>/dev/null || true
	docker run -d --name ws_service --network ft_transcendence_network -p 4000:4000 ft_transcendence_ws_service
	@echo "✅ Container started! Following logs..."
	@echo "📋 Press Ctrl+C to stop following logs (container keeps running)"
	docker logs -f ws_service

# Docker: clean existing images for this service
docker-clean:
	@echo "🧹 Cleaning up Docker resources for ws-service..."
	docker stop ws_service 2>/dev/null || true
	docker rm ws_service 2>/dev/null || true
	docker rmi ft_transcendence_ws_service 2>/dev/null || true

# Docker: follow logs in real-time
logs:
	@echo "📋 Following ws-service logs (Ctrl+C to stop)..."
	docker logs -f ws_service
