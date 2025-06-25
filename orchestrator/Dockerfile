# Dockerfile for the Orchestrator

# --- STAGE 1: Build Stage ---
    FROM node:20-alpine AS builder
    WORKDIR /usr/src/app
    COPY package*.json ./
    # We use npm ci because it's faster and more reliable for CI/build environments.
    RUN npm ci --only=production
    COPY . .
    
    # --- STAGE 2: Production Stage ---
    FROM node:20-alpine
    WORKDIR /usr/src/app
    COPY --from=builder /usr/src/app/node_modules ./node_modules
    COPY --from=builder /usr/src/app/ .
    
    # The command that will be run when the container starts.
    CMD [ "node", "index.js" ]