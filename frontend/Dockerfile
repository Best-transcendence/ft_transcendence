# Simple Dockerfile for frontend
# School 42 project - single stage build

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Environment variables for Vite build (used at build time)
ARG VITE_BACKEND_URL=http://localhost:3003
ARG VITE_WS_URL=ws://localhost:4000

# Set as ENV so Vite can access them during build
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_WS_URL=${VITE_WS_URL}

# Install curl for external healthchecks (used by docker-compose)
RUN apk add --no-cache curl

# Copy source code
COPY . .

# Build the frontend (Vite will use the ENV variables)
RUN npm run build

# Expose the default port (can be overridden by docker-compose)
EXPOSE 3000

# Start the application using Vite preview
CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port 3000"]

