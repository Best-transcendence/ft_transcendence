# User Service Makefile

.PHONY: all run clean docker docker-clean logs

# Default target - run all installations
all:
	@echo "📦 Installing user-service dependencies..."
	npm install
	@echo "🔧 Generating Prisma client..."
	npx prisma generate
	@echo "🗄️ Running database migrations..."
	npx prisma migrate dev --name init
	@echo "🌱 Seeding database..."
	npm run seed
	@echo "✅ User service setup complete!"
	@echo "🚀 Starting user-service development server..."
	npm run dev

# Just run the service (assumes already installed)
run:
	@echo "🚀 Starting user-service development server..."
	npm run dev

# Clean up (including Docker)
clean:
	@echo "🧹 Cleaning up..."
	rm -rf node_modules
	rm -f prisma/user.db
	rm -f prisma/*.db
	@echo "🐳 Cleaning Docker resources..."
	docker stop user_service 2>/dev/null || true
	docker rm user_service 2>/dev/null || true
	docker rmi ft_transcendence_user_service 2>/dev/null || true

# Docker: build if needed and start
docker:
	@echo "🐳 Building user-service Docker image..."
	docker build -t ft_transcendence_user_service .
	@echo "🚀 Starting user-service Docker container..."
	docker run -d --name user_service -p 3002:3002 ft_transcendence_user_service
	@echo "✅ Container started! Following logs..."
	@echo "📋 Press Ctrl+C to stop following logs (container keeps running)"
	docker logs -f user_service

# Docker: clean existing images for this service
docker-clean:
	@echo "🧹 Cleaning up Docker resources for user-service..."
	docker stop user_service 2>/dev/null || true
	docker rm user_service 2>/dev/null || true
	docker rmi ft_transcendence_user_service 2>/dev/null || true

# Docker: follow logs in real-time
logs:
	@echo "📋 Following user-service logs (Ctrl+C to stop)..."
	docker logs -f user_service
