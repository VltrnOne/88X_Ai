# Dockerfile

# --- STAGE 1: Build Stage ---
# Use an official Node.js image as the base for our build environment.
# We choose version 20-alpine for a smaller footprint.
FROM node:20-alpine AS builder

# Set the working directory inside the container.
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files.
COPY package*.json ./

# Install all production dependencies.
RUN npm ci --only=production

# Copy the rest of the application source code.
COPY . .


# --- STAGE 2: Production Stage ---
# Start from a clean, lightweight Node.js image.
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy the installed dependencies from the 'builder' stage.
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy the application source code from the 'builder' stage.
COPY --from=builder /usr/src/app/ .

# The command that will be run when the container starts.
CMD [ "node", "index.js" ]
