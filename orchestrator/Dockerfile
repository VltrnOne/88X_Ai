# Use an Alpine-based Node for smaller image
FROM node:18-slim

# Install bash, curl, git, Docker CLI, and Docker Compose for dev tooling
RUN apt-get update && apt-get install -y \
    bash \
    curl \
    git \
    ca-certificates \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Install Docker CLI
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y docker-ce-cli \
    && rm -rf /var/lib/apt/lists/*

# Install Docker Compose
RUN curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose

# inside container, work in /usr/src/app/orchestrator
WORKDIR /usr/src/app/orchestrator

# copy over package files & install  
COPY package.json package-lock.json ./
RUN npm install

# now copy the rest of your code
COPY . .

# Change ownership to node user for proper permissions
RUN chown -R node:node .

# Switch to node user
USER node

# default to the production start
CMD ["npm", "start"]
