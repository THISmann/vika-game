FROM node:20-alpine

WORKDIR /app

# Copy shared directory first (from parent context)
COPY shared ./shared

# Copy package files
COPY api-gateway/package*.json ./

# Install dependencies
RUN npm install --production --omit=dev

# Copy api-gateway files
COPY api-gateway/server.js ./
COPY api-gateway/config ./config
COPY api-gateway/src ./src

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "server.js"]
