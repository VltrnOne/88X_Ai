# Dockerfile

# --- STAGE 1: Build Stage ---
    FROM node:20-alpine AS builder
    WORKDIR /usr/src/app
    COPY package*.json ./
    RUN npm ci --only=production
    COPY . .
    
    # --- STAGE 2: Production Stage ---
    FROM node:20-alpine
    WORKDIR /usr/src/app
    COPY --from=builder /usr/src/app/node_modules ./node_modules
    COPY --from=builder /usr/src/app/ .
    CMD [ "node", "index.js" ]