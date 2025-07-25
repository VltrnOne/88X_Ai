# Use a specific Node.js version for stability
FROM node:18-slim

# Install bash and other essential tools for dev container compatibility
RUN apt-get update && apt-get install -y \
    bash \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (This is the missing step that fixes the error)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Command to run the agent
CMD [ "node", "src/index.js" ]