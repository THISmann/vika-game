FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Use npm ci for reproducible builds (requires package-lock.json)
RUN npm ci --omit=dev
COPY . .
EXPOSE 3004
# TELEGRAM_BOT_TOKEN must be provided as environment variable
CMD ["node","server.js"]

