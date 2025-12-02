FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Use npm install for production dependencies (more flexible than npm ci)
RUN npm install --production --omit=dev
COPY . .
# Create data directory for game state and scores
RUN mkdir -p /app/data
EXPOSE 3003
CMD ["node","server.js"]