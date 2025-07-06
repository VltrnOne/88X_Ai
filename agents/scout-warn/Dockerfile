# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production
RUN npm install dotenv --production     # ← bring in dotenv
COPY . .

# Stage 2: runtime
FROM node:20-alpine
WORKDIR /usr/src/app
RUN apk add --no-cache docker-cli
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app ./
CMD ["node", "index.js"]
