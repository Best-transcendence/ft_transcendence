# Simple Dockerfile for frontend
# School 42 project - single stage build

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

#Put some variables in the backend.
ARG VITE_BACKEND_URL
ARG VITE_WS_URL

# Install curl for external healthchecks (used by docker-compose)
RUN apk add --no-cache curl

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Expose the default port (can be overridden by docker-compose)
EXPOSE 3000

# Start the application using Vite preview
CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port 3000"]

