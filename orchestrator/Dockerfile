# Dockerfile for the Orchestrator

# --- STAGE 1: Build Stage ---
    FROM node:20-alpine AS builder
    WORKDIR /usr/src/app
    COPY package*.json ./
    RUN npm ci --only=production
    COPY . .
    
    # --- STAGE 2: Production Stage ---
    FROM node:20-alpine
    
    # INSTALL DOCKER CLI
    # This gives the container the 'docker' command.
    RUN apk add --no-cache docker-cli
    
    WORKDIR /usr/src/app
    COPY --from=builder /usr/src/app/node_modules ./node_modules
    COPY --from=builder /usr/src/app/ .
    
    # This command will be overridden by docker-compose, but is good for documentation.
    CMD [ "node", "index.js" ]