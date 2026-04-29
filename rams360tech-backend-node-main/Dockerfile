FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

EXPOSE 8000

# Use node directly — "type":"module" in package.json enables ESM natively
# Avoids broken nodemon start script (em-dash bug) and babel-node dep
CMD ["node", "server.js"]
