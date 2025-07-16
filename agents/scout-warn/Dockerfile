# File: agents/scout-warn/Dockerfile

# 1) Builder stage: install production deps only
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy package metadata and install prod deps
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy the rest of the code
COPY . .

# 2) Final stage: slim runtime
FROM node:20-alpine
WORKDIR /usr/src/app

# We need docker-cli for our download step
RUN apk add --no-cache docker-cli

# Bring in compiled app + installed deps
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app .

# Entry point
CMD ["node", "index.js"]
