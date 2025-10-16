FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Install curl for external healthchecks (used by docker-compose)
RUN apk add --no-cache curl

# Copy application code
COPY . .

# Expose the default port (can be overridden by docker-compose)
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
