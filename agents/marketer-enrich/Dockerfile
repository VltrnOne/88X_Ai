# Use a lightweight Node.js base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install application dependencies
RUN npm install --omit=dev

# Copy the rest of the application source code
COPY . .

# The command to run when the container starts
CMD [ "node", "index.js" ]