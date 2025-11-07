# -------------------------------
# Stage: Build and Runtime
# -------------------------------
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Install curl (optional, useful for healthchecks or debugging)
RUN apk add --no-cache curl

# Install build dependencies for better-sqlite3 (python3, make, g++)
RUN apk add --no-cache python3 make g++

# Copy the rest of the application code
COPY . .

# Create data directory (if needed) and adjust permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Expose the service port
EXPOSE 3001

# -------------------------------
# ENTRYPOINT
# -------------------------------
# 1. Run seed script (no crash if fails or already seeded)
# 2. Start the application
#
# CMD Parameters:
# - "sh": Use shell interpreter
# - "-c": Execute command string
# - "npm run seed": Execute database seeding script (creates DB if needed)
# - "|| true": Continue even if seeding fails (prevents container crash)
# - "&& npm start": Start the application server
CMD ["sh", "-c", "npm run seed || true && npm start"]
