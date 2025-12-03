FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Use npm ci for reproducible builds (requires package-lock.json)
RUN npm ci --omit=dev
COPY . .
# Create data directory for game state and scores
RUN mkdir -p /app/data
EXPOSE 3003
CMD ["node","server.js"]