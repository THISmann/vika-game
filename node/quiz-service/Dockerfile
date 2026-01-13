FROM node:18-alpine
WORKDIR /app
# Copy shared directory first (from parent context)
COPY shared ./shared
# Copy package files
COPY quiz-service/package*.json ./
# Use npm install (package-lock.json may be out of sync)
RUN npm install --production --omit=dev
# Copy quiz-service files individually (excluding shared symlink)
COPY quiz-service/controllers ./controllers
COPY quiz-service/routes ./routes
COPY quiz-service/models ./models
COPY quiz-service/config ./config
COPY quiz-service/middleware ./middleware
COPY quiz-service/server.js ./
COPY quiz-service/data ./data
# Créer le répertoire data pour les questions
RUN mkdir -p /app/data
EXPOSE 3002
CMD ["node","server.js"]