# Stage 1: install deps
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy only package.json + lockfile, install production deps
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: final image
FROM node:20-alpine
WORKDIR /usr/src/app

# Pull in prod dependencies from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy your code
COPY . .

# Run your agent
CMD ["node", "index.js"]
