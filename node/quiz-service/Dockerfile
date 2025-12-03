FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Use npm ci for reproducible builds (requires package-lock.json)
RUN npm install --production --omit=dev --omit=dev
COPY . .
# Créer le répertoire data pour les questions
RUN mkdir -p /app/data
EXPOSE 3002
CMD ["node","server.js"]