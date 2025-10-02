# Frontend Makefile
# Vanilla TypeScript SPA with TailwindCSS

.PHONY: all run clean

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

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	rm -rf node_modules
	rm -rf dist
	rm -rf .parcel-cache
	rm -f public/output.css
