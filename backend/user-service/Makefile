# User Service Makefile
# Handles user profiles, friends, and game statistics

.PHONY: all run clean

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

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	rm -rf node_modules
	rm -f prisma/user.db
	rm -rf prisma/migrations
