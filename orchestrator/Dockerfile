# Use an Alpine-based Node for smaller image
FROM node:20-alpine

# inside container, work in /usr/src/app/orchestrator
WORKDIR /usr/src/app/orchestrator

# copy over package files & install  
COPY package.json package-lock.json ./
RUN npm install

# now copy the rest of your code
COPY . .

# default to the production start
CMD ["npm", "start"]
