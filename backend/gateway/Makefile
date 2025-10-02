# Gateway Service Makefile
# API Gateway for ft_transcendence microservices

.PHONY: all run clean

# Default target - run all installations
all:
	@echo "📦 Installing gateway dependencies..."
	npm install
	@echo "✅ Gateway service setup complete!"
	@echo "🚀 Starting gateway development server..."
	npm run dev

# Just run the service (assumes already installed)
run:
	@echo "🚀 Starting gateway development server..."
	npm run dev

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	rm -rf node_modules
