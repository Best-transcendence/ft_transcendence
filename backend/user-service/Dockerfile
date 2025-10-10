# Simple Dockerfile for user-service
# School 42 project - single stage build

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy application code
COPY . .

# Create data directory for SQLite database and set permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Set environment variables
ENV USER_SERVICE_PORT=3002
ENV USER_SERVICE_URL=http://localhost:3002
ENV USER_DATABASE_URL=file:./data/user.db
# TODO: remove secrets from here
ENV JWT_SECRET=ft-transcendence-dev-secret-change-in-production
ENV NODE_ENV=production

# Add seed script to package.json
RUN npm pkg set scripts.seed="node prisma/seed.js"

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
