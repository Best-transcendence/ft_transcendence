# Frontend Makefile

.PHONY: all run clean docker docker-clean logs

# Default target - run all installations
all:
	@echo "🧹 Cleaning cache..."
	rm -rf .parcel-cache dist
	@echo "📦 Installing frontend dependencies..."
	npm install
	@echo "📦 Installing TailwindCSS dependencies..."
	npm install -D tailwindcss postcss autoprefixer
	@echo "🎨 Building TailwindCSS..."
	npx tailwindcss -i ./public/styles.css -o ./public/output.css
	@echo "✅ Frontend setup complete!"
	@echo "🚀 Starting frontend development server..."
	npm run dev

# Just run the service (assumes already installed)
run:
	@echo "🚀 Starting frontend development server..."
	npm run dev

# Clean up (including Docker)
clean:
	@echo "🧹 Cleaning up..."
	rm -rf node_modules
	rm -rf dist
	rm -rf .parcel-cache
	rm -f public/output.css
	@echo "🐳 Cleaning Docker resources..."
	docker stop frontend_service 2>/dev/null || true
	docker rm frontend_service 2>/dev/null || true
	docker rmi ft_transcendence_frontend 2>/dev/null || true

# Docker: build if needed and start
docker:
	@echo "🐳 Building frontend Docker image..."
	docker build -t ft_transcendence_frontend .
	@echo "🛑 Stopping existing container if running..."
	docker stop frontend_service 2>/dev/null || true
	docker rm frontend_service 2>/dev/null || true
	@echo "🚀 Starting frontend Docker container..."
	docker network create ft_transcendence_network 2>/dev/null || true
	docker run -d --name frontend_service --network ft_transcendence_network -p 3000:3000 ft_transcendence_frontend
	@echo "✅ Container started! Following logs..."
	@echo "📋 Press Ctrl+C to stop following logs (container keeps running)"
	docker logs -f frontend_service

# Docker: clean existing images for this service
docker-clean:
	@echo "🧹 Cleaning up Docker resources for frontend..."
	docker stop frontend_service 2>/dev/null || true
	docker rm frontend_service 2>/dev/null || true
	docker rmi ft_transcendence_frontend 2>/dev/null || true

# Docker: follow logs in real-time
logs:
	@echo "📋 Following frontend logs (Ctrl+C to stop)..."
	docker logs -f frontend_service
