FROM node:18-alpine
WORKDIR /app
# Copy shared directory first (from parent context)
COPY shared ./shared
# Copy package files
COPY auth-service/package*.json ./
# Use npm ci for reproducible builds (requires package-lock.json)
RUN npm install --production --omit=dev --omit=dev
# Copy auth-service files individually (excluding shared symlink)
COPY auth-service/controllers ./controllers
COPY auth-service/routes ./routes
COPY auth-service/models ./models
COPY auth-service/config ./config
COPY auth-service/middleware ./middleware
COPY auth-service/utils ./utils
COPY auth-service/data ./data
COPY auth-service/server.js ./
EXPOSE 3001
CMD ["node","server.js"]