FROM node:20

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose Parcel dev server
EXPOSE 1234

# Default command
CMD ["npm", "run", "start"]
