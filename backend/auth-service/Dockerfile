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

# Copy Prisma schema and generate Prisma Client
# It's important to do this BEFORE copying the rest of the app,
# so that Docker layer caching works effectively
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Create data directory (if needed) and adjust permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Ensure `npm run seed` script exists, even if not defined in package.json
RUN npm pkg set scripts.seed="node prisma/seed.js"

# Expose the service port
EXPOSE 3001

# -------------------------------
# ENTRYPOINT
# -------------------------------
# 1. Push DB schema (migrations)
# 2. Run seed script (no crash if fails or already seeded)
# 3. Start the application
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
