# ~/vltrn-system/orchestrator/Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
RUN npm install dotenv
COPY . .

# Stage 2: Production
FROM node:20-alpine
WORKDIR /usr/src/app

RUN apk add --no-cache docker-cli

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app ./

EXPOSE 8080
CMD ["node", "server.js"]
