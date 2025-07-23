# Use an Alpine-based Node for smaller image
FROM node:20-alpine

# Install Docker CLI and Docker Compose
RUN apk add --no-cache curl && \
    curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-24.0.7.tgz | tar -xzC /tmp && \
    cp /tmp/docker/docker /usr/local/bin/ && \
    rm -rf /tmp/docker && \
    curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose && \
    apk del curl

# inside container, work in /usr/src/app/orchestrator
WORKDIR /usr/src/app/orchestrator

# copy over package files & install  
COPY package.json package-lock.json ./
RUN npm install

# now copy the rest of your code
COPY . .

# default to the production start
CMD ["npm", "start"]
