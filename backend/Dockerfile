# Use official Node.js LTS image
FROM node:20-alpine AS base

ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Install dependencies using cached layer
COPY package*.json ./
RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Cloud Run provides PORT env var; default to 8080
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]

