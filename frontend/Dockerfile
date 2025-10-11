# Simple Dockerfile for frontend
# School 42 project - single stage build

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set environment variables (can be overridden by docker run -e)
ENV FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Expose port
EXPOSE ${FRONTEND_PORT:-3000}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${FRONTEND_PORT:-3000}/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application using Vite preview
CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port ${FRONTEND_PORT:-3000}"]
