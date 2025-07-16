# File: agents/marketer-agent/Dockerfile

# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy package manifest and install dependencies (production only)
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Stage 2: runtime
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy built dependencies and source
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app .

# Expose port if needed (optional)
EXPOSE 8080

# Start the marketer-agent
CMD ["node", "index.js"]
