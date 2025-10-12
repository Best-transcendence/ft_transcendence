FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci
RUN apk add --no-cache curl

COPY prisma/ ./prisma/
RUN npx prisma generate

COPY . .
RUN mkdir -p /app/data && chmod 777 /app/data

RUN npm pkg set scripts.seed="node prisma/seed.js"

EXPOSE 3001

CMD ["npm", "start"]
