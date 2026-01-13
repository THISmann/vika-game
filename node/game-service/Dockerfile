FROM node:18-alpine
WORKDIR /app
# Copy shared directory first (from parent context)
COPY shared ./shared
# Copy package files
COPY game-service/package*.json ./
# Use npm install (package-lock.json may be out of sync)
RUN npm install --production --omit=dev
# Copy game-service files individually (excluding shared symlink)
COPY game-service/controllers ./controllers
COPY game-service/routes ./routes
COPY game-service/models ./models
COPY game-service/config ./config
COPY game-service/middleware ./middleware
COPY game-service/services ./services
COPY game-service/gameState.js ./
COPY game-service/websocket.js ./
COPY game-service/server.js ./
COPY game-service/data ./data
COPY game-service/WEBSOCKET_DOCUMENTATION.md ./
# Create data directory for game state and scores
RUN mkdir -p /app/data
EXPOSE 3003
CMD ["node","server.js"]