# Auth Service Makefile
# Handles user authentication, registration, and JWT token management

.PHONY: all run clean

# Default target - run all installations
all:
	@echo "📦 Installing auth-service dependencies..."
	npm install
	@echo "🔧 Generating Prisma client..."
	npx prisma generate
	@echo "🗄️ Running database migrations..."
	npx prisma migrate dev --name init
	@echo "🌱 Seeding database..."
	npm run seed
	@echo "✅ Auth service setup complete!"
	@echo "🚀 Starting auth-service development server..."
	npm run dev

# Just run the service (assumes already installed)
run:
	@echo "🚀 Starting auth-service development server..."
	npm run dev

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	rm -rf node_modules
	rm -f prisma/auth.db
	rm -f prisma/*.db
