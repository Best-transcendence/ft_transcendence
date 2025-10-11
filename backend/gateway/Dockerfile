# Simple Dockerfile for gateway-service
# School 42 project - single stage build

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Set environment variables (can be overridden by docker run -e)
ENV GATEWAY_PORT=${GATEWAY_PORT:-3003}
ENV GATEWAY_URL=${GATEWAY_URL:-http://localhost:3003}
ENV AUTH_SERVICE_URL=${AUTH_SERVICE_URL:-http://auth_service:3001}
ENV USER_SERVICE_URL=${USER_SERVICE_URL:-http://user_service:3002}
ENV WS_SERVICE_URL=${WS_SERVICE_URL:-http://ws_service:4000}
# TODO: remove secrets from here
ENV JWT_SECRET=${JWT_SECRET:-ft-transcendence-dev-secret-change-in-production}
ENV NODE_ENV=${NODE_ENV:-production}

# Expose port
EXPOSE ${GATEWAY_PORT:-3003}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${GATEWAY_PORT:-3003}/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
