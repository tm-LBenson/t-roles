FROM node:16-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy app source
COPY . .

# Expose port and start application
EXPOSE 3000
CMD ["node", "index.js"]
