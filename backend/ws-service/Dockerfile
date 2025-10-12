# Simple Dockerfile for ws-service
# School 42 project - single stage build

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install curl for Docker healthcheck
RUN apk add --no-cache curl

# Copy application code
COPY . .

# Set environment variables (can be overridden by docker run -e)
ENV WS_PORT=${WS_PORT:-4000}
ENV WS_SERVICE_URL=${WS_SERVICE_URL:-http://localhost:4000}
ENV FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}
ENV GATEWAY_URL=${GATEWAY_URL:-http://gateway_service:3003}
ENV AUTH_SERVICE_URL=${AUTH_SERVICE_URL:-http://auth_service:3001}
ENV USER_SERVICE_URL=${USER_SERVICE_URL:-http://user_service:3002}
# TODO: remove secrets from here
ENV JWT_SECRET=${JWT_SECRET:-ft-transcendence-dev-secret-change-in-production}
ENV NODE_ENV=${NODE_ENV:-production}

# Expose port
EXPOSE ${WS_PORT:-4000}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${WS_PORT:-4000}/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
