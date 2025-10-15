# -------------------------------
# Stage: Build and Runtime
# -------------------------------
	FROM node:20-alpine

	# Set working directory inside the container
	WORKDIR /app
	
	# Copy package files and install dependencies
	COPY package*.json ./
	RUN npm ci
	
	# Install curl (used by external healthchecks in docker-compose)
	RUN apk add --no-cache curl
	
	# Copy Prisma schema and generate Prisma Client
	# Doing this before copying the full code helps with Docker layer caching
	COPY prisma/ ./prisma/
	RUN npx prisma generate
	
	# Copy the rest of the application code
	COPY . .
	
	# Create a writable data directory (used by SQLite)
	RUN mkdir -p /app/data && chmod 777 /app/data
	
	# Ensure that the seed script exists in package.json
	RUN npm pkg set scripts.seed="node prisma/seed.js"
	
	# Expose the user service port (can be overridden in docker-compose)
	EXPOSE 3002
	
	# -------------------------------
	# ENTRYPOINT
	# -------------------------------
	# 1. Apply schema (push migrations)
	# 2. Run seed (do not crash if seed already applied)
	# 3. Start the user service
	#
	# CMD Parameters:
	# - "sh": Use shell interpreter
	# - "-c": Execute command string
	# - "npx prisma db push --accept-data-loss": Sync Prisma schema to database
	#   --accept-data-loss: Allow schema changes that may cause data loss
	# - "&&": Run next command only if previous succeeds
	# - "npm run seed": Execute database seeding script
	# - "|| true": Continue even if seeding fails (prevents container crash)
	# - "&& npm start": Start the application server
	CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run seed || true && npm start"]
	