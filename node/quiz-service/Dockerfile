FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Use npm install for production dependencies (more flexible than npm ci)
RUN npm install --production --omit=dev
COPY . .
# Créer le répertoire data pour les questions
RUN mkdir -p /app/data
EXPOSE 3002
CMD ["node","server.js"]