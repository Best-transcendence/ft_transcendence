FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Install curl for external healthchecks (used by docker-compose)
RUN apk add --no-cache curl

# Copy Prisma schema and generate client
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy application code
COPY . .

# Create data directory for SQLite database and set permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Add seed script to package.json
RUN npm pkg set scripts.seed="node prisma/seed.js"

# Expose the default port (can be overridden by docker-compose)
EXPOSE 3002

# Start the application
CMD ["npm", "start"]
